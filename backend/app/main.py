from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from .api.routes import router, initialize_ml_components
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Данный блок безопасно запускается внутри Docker в момент старта сервера
    print("⏳ Запуск контейнера: Фоновое обучение моделей Prophet и KMeans...")
    initialize_ml_components()
    print("✅ Все ML-компоненты успешно инициализированы!")
    yield

app = FastAPI(
    title="AI-ассистент категорийного менеджера",
    description="API для анализа и прогнозирования ассортимента салонов оптики",
    version="1.0.0",
    lifespan=lifespan
)

# CORS для беспрепятственного доступа фронтенда React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Подключаем роуты
app.include_router(router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "AI-ассистент категорийного менеджера", "status": "running"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
