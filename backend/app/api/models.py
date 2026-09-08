from pydantic import BaseModel
from typing import List, Optional

class Salon(BaseModel):
    id: int
    name: str
    address: str
    cluster_style: Optional[str] = None
    cluster_size: Optional[str] = None
    cluster_full: Optional[str] = None

class Recommendation(BaseModel):
    class_name: str
    current_stock: int
    forecast_1m: float
    forecast_3m: float
    recommendation: str
    details: Optional[str] = None

class RecommendationsResponse(BaseModel):
    salon_id: int
    salon_name: str
    style: List[Recommendation]
    size: List[Recommendation]
    combined: List[Recommendation]
    anomalies: List[dict]

class LuxuryAnalysis(BaseModel):
    salon_id: int
    salon_name: str
    luxury_share_revenue: float
    luxury_share_stock: float
    turnover: float
    style_recommendations: List[Recommendation]
    size_recommendations: List[Recommendation]
    summary: str

class HeatmapData(BaseModel):
    style: str
    size: str
    sales: float
    stock: float

class ForecastData(BaseModel):
    ds: str
    yhat: float
    yhat_lower: float
    yhat_upper: float

class CompareResponse(BaseModel):
    salon1: str
    salon2: str
    style_comparison: List[dict]
    size_comparison: List[dict]
