from fastapi import APIRouter, HTTPException, Query
from typing import List
from .models import (
    Salon, RecommendationsResponse, LuxuryAnalysis,
    HeatmapData, ForecastData, CompareResponse
)
from ..data.loader import DataLoader
from ..core.classifier import Classifier
from ..core.clustering import Clustering
from ..core.forecast import Forecast
from ..core.recommender import Recommender
import pandas as pd

router = APIRouter()

# Глобальные контейнеры для ML данных, которые заполнятся при старте через lifespan
loader = None
df_sales_with_class = None
df_stock = None
df_products = None
clusters = None
forecasts = None
forecaster = None

def initialize_ml_components():
    """Функция безопасной инициализации тяжелых ML-моделей при старте сервера"""
    global loader, df_sales_with_class, df_stock, df_products, clusters, forecasts, forecaster
    
    loader = DataLoader()
    df_sales, df_stock, df_products = loader.load_all()

    # Классификация ФМЦ
    classifier = Classifier(df_products)
    df_products = classifier.classify_all()

    # Кластеризация KMeans
    clustering = Clustering()
    df_sales_with_class = df_sales.merge(
        df_products[['article', 'class_style', 'class_size', 'class_full']],
        on='article'
    )
    clusters = clustering.cluster_salons(df_sales_with_class)

    # Расчет временных рядов Prophet
    forecaster = Forecast(df_sales_with_class, df_products)
    forecasts = forecaster.forecast_all()

# --- ОСТАЛЬНЫЕ РОУТЫ ОСТАЮТСЯ СТРОГО ИЗ КОДА ВАШЕГО РАЗРАБОТЧИКА ---

@router.get("/salons", response_model=List[Salon])
async def get_salons():
    if loader is None: raise HTTPException(status_code=503, detail="ML-модуль еще инициализируется")
    return loader.get_salons()

@router.get("/salons/{salon_id}", response_model=Salon)
async def get_salon(salon_id: int):
    if loader is None: raise HTTPException(status_code=503, detail="ML-модуль еще инициализируется")
    salons = loader.get_salons()
    for salon in salons:
        if salon.id == salon_id:
            return salon
    raise HTTPException(status_code=404, detail="Salon not found")

@router.get("/recommendations/{salon_id}", response_model=RecommendationsResponse)
async def get_recommendations(salon_id: int):
    if recommender is None: raise HTTPException(status_code=503, detail="ML-модуль еще инициализируется")
    recommender = Recommender(df_sales_with_class, df_stock, df_products, forecasts, clusters)
    return recommender.get_recommendations(salon_id)

@router.get("/heatmap/{salon_id}", response_model=List[HeatmapData])
async def get_heatmap(salon_id: int):
    recommender = Recommender(df_sales_with_class, df_stock, df_products, forecasts, clusters)
    return recommender.get_heatmap(salon_id)

@router.get("/luxury/{salon_id}", response_model=LuxuryAnalysis)
async def get_luxury_analysis(salon_id: int):
    # Используем корректный импорт класса LuxuryAnalysis из модуля вашего разработчика
    from ..core.luxury_analysis import LuxuryAnalysis as LuxuryAnalyzer
    analyzer = LuxuryAnalyzer(df_sales_with_class, df_stock, df_products)
    return analyzer.analyze(salon_id)

@router.get("/compare", response_model=CompareResponse)
async def compare_salons(salon1: int = Query(...), salon2: int = Query(...)):
    comparator = Recommender(df_sales_with_class, df_stock, df_products, forecasts, clusters)
    return comparator.compare_salons(salon1, salon2)

@router.get("/forecast/{salon_id}/{classifier_type}/{class_value}", response_model=List[ForecastData])
async def get_forecast(salon_id: int, classifier_type: str, class_value: str):
    if classifier_type not in ['style', 'size', 'full']:
        raise HTTPException(status_code=400, detail="Invalid classifier_type")
    return forecaster.get_forecast(salon_id, classifier_type, class_value)

@router.get("/clusters")
async def get_clusters():
    if clusters is None: raise HTTPException(status_code=503, detail="ML-модуль еще инициализируется")
    return {
        "clusters": clusters,
        "salon_cluster_map": {
            salon_id: {"style": c_style, "size": c_size, "full": c_full}
            for salon_id, (c_style, c_size, c_full) in clusters.items()
        }
    }
