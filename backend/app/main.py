# backend/app/main.py
import os
import time
import pandas as pd
import clickhouse_connect
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Импортируем роуты и кэшер ИИ из структуры вашего разработчика
from .api.routes import router, initialize_ml_components

# Параметры подключения к ClickHouse из переменных окружения Docker-compose
CLICKHOUSE_HOST = os.getenv("CLICKHOUSE_HOST", "clickhouse")
CLICKHOUSE_PORT = int(os.getenv("CLICKHOUSE_PORT", 8123))
CLICKHOUSE_USER = os.getenv("CLICKHOUSE_USER", "default")
CLICKHOUSE_PASSWORD = os.getenv("CLICKHOUSE_PASSWORD", "1234")

def init_clickhouse_database():
    """
    Автоматическое создание структуры таблиц в ClickHouse (DDL) 
    и первичный импорт предобученных матриц (Prophet + XYZ) со схемы
    """
    print("🗄️ ClickHouse: Попытка подключения к базе данных...")
    client = None
    
    # Делаем 5 попыток подключения, так как ClickHouse в Docker может стартовать чуть дольше, чем FastAPI
    for attempt in range(5):
        try:
            client = clickhouse_connect.get_client(
                host=CLICKHOUSE_HOST,
                port=CLICKHOUSE_PORT,
                username=CLICKHOUSE_USER,
                password=CLICKHOUSE_PASSWORD
            )
            break
        except Exception as e:
            print(f"⏳ ClickHouse еще не готов (Попытка {attempt+1}/5). Ожидание 3 секунды...")
            time.sleep(3)
            
    if not client:
        print("⚠️ Не удалось подключиться к ClickHouse. Фоллбэк-режим на локальные файлы.")
        return

    try:
        # 1. Создаем целевую базу данных проекта
        client.command("CREATE DATABASE IF NOT EXISTS optics")
        print("✅ База данных 'optics' успешно проверена/создана.")

        # 2. Создаем таблицу для XYZ-анализа (Под эндпоинты рекомендаций и люкса)
        client.command("""
            CREATE TABLE IF NOT EXISTS optics.xyz_analysis_summary (
                category LowCardinality(String),
                salon String,
                class_style String,
                class_size String,
                class_full String,
                stock UInt32,
                sales_90_days Float32,
                forecast_1m Float32,
                forecast_3m Float32,
                xyz_class LowCardinality(String)
            ) ENGINE = MergeTree() 
            ORDER BY (category, salon, class_full)
        """)

        # 3. Создаем таблицу для таймсерий Prophet (Под эндпоинт графиков динамики спроса)
        client.command("""
            CREATE TABLE IF NOT EXISTS optics.prophet_forecast_charts (
                category LowCardinality(String),
                salon String,
                classifier_type LowCardinality(String),
                class_value String,
                ds String,
                yhat Float32,
                yhat_lower Float32,
                yhat_upper Float32
            ) ENGINE = MergeTree() 
            ORDER BY (category, salon, classifier_type, class_value, ds)
        """)

        print("✅ Все таблицы ClickHouse успешно инициализированы в контейнере.")
        
        # --- АВТОМАТИЧЕСКАЯ ЗАПРАВКА БАЗЫ (SEED)
        row_count = client.command("SELECT count() FROM optics.xyz_analysis_summary")
        if row_count == 0:
            print("📦 ClickHouse пустой. Запуск автоматического импорта матриц...")
            
            DATA_DIR = os.getenv("DATA_DIR", "./data")
            
            for cat in ["оптика", "солнцезащитные"]:
                xyz_file = f"{DATA_DIR}/{cat}_xyz_full.csv"
                
                if os.path.exists(xyz_file):
                    df_xyz = pd.read_csv(xyz_file)
                    
                    # Безопасное создание текстовых колонок, если их нет в выгрузке 1С/ML
                    df_xyz['category'] = cat
                    df_xyz['salon'] = df_xyz['salon'].astype(str) if 'salon' in df_xyz.columns else 'Центральный'
                    df_xyz['class_style'] = df_xyz['class_style'].astype(str) if 'class_style' in df_xyz.columns else 'Базовый'
                    df_xyz['class_size'] = df_xyz['class_size'].astype(str) if 'class_size' in df_xyz.columns else 'Стандарт'
                    df_xyz['class_full'] = df_xyz['class_full'].astype(str) if 'class_full' in df_xyz.columns else 'Базовый_Стандарт'
                    
                    # Конвертируем числовые метрики
                    stock_src = df_xyz['current_stock'] if 'current_stock' in df_xyz.columns else (df_xyz['stock'] if 'stock' in df_xyz.columns else pd.Series([0] * len(df_xyz)))
                    df_xyz['stock'] = pd.to_numeric(stock_src, errors='coerce').fillna(0).astype(int)
                    
                    sales_src = df_xyz['sales_90_days'] if 'sales_90_days' in df_xyz.columns else pd.Series([0] * len(df_xyz))
                    df_xyz['sales_90_days'] = pd.to_numeric(sales_src, errors='coerce').fillna(0).astype(float)
                    
                    f1m_src = df_xyz['forecast_1m'] if 'forecast_1m' in df_xyz.columns else pd.Series([0] * len(df_xyz))
                    df_xyz['forecast_1m'] = pd.to_numeric(f1m_src, errors='coerce').fillna(0).astype(float)
                    
                    f3m_src = df_xyz['forecast_3m'] if 'forecast_3m' in df_xyz.columns else pd.Series([0] * len(df_xyz))
                    df_xyz['forecast_3m'] = pd.to_numeric(f3m_src, errors='coerce').fillna(0).astype(float)
                    
                    df_xyz['xyz_class'] = df_xyz['xyz_class'].astype(str) if 'xyz_class' in df_xyz.columns else 'X'
                    
                    # Бинарная вставка очищенного датафрейма в СУБД ClickHouse
                    client.insert_df('optics.xyz_analysis_summary', df_xyz[[
                        'category', 'salon', 'class_style', 'class_size', 'class_full', 
                        'stock', 'sales_90_days', 'forecast_1m', 'forecast_3m', 'xyz_class'
                    ]])
                    print(f"🚀 Успешно залита XYZ-матрица для категории '{cat}' в ClickHouse!")
        else:
            print(f"ℹ️ ClickHouse уже содержит предобученные данные ({row_count} строк аналитики). Миграция пропущена.")

    except Exception as e:
        print(f"❌ Критическая ошибка инициализации СУБД ClickHouse: {e}")

# --- ОРКЕСТРАЦИЯ ЖИЗНЕННОГО ЦИКЛА КОНТЕЙНЕРА ---
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_clickhouse_database()
    print("⏳ Подгрузка готовых матриц Prophet + XYZ с локального контура...")
    initialize_ml_components()
    print("✅ Все ИИ-модули успешно состыкованы и готовы к работе!")
    yield

app = FastAPI(
    title="AI-ассистент категорийного менеджера",
    description="API на основе предобученных моделей Prophet и XYZ-анализа сети",
    version="3.1.0",
    lifespan=lifespan
)

# Разрешаем CORS-запросы от контейнера React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "AI-ассистент подключен к выгрузкам GitLab и ClickHouse", "status": "running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
