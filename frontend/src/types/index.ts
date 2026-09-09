export type SectionType = "Рекомендации" | "Тепловая карта" | "Дорогие oправы" | "Сравнение салонов" | "Динамика" | "Кластеры";

export interface ISalon {
  id: number;
  name: string;
  address: string;
}

// Элемент строки рекомендации строго под Pydantic-модель бэкенда 'Recommendation'
export interface IRecItem {
  class_name: string;      // Название класса ФМЦ
  current_stock: number;   // Текущий остаток
  forecast_1m: number;     // Прогноз на 1 месяц
  forecast_3m: number;     // Прогноз на 3 месяца
  recommendation: string;  // AI Решение (Закупка/Ротация)
  details?: string;        // Описание аномалий/деталей
  qty?: number;            // Рассчитываемый объем (если нужен на фронте)
}

// Ответ строго под Pydantic-модель бэкенда 'RecommendationsResponse'
export interface IRecommendationsResponse {
  salon_id: number;
  salon_name: string;
  style: IRecItem[];       // Таблица по Моде
  size: IRecItem[];        // Таблица по Анатомии
  combined: IRecItem[];    // Комбинированная таблица
  anomalies: any[];        // Список аномалий спроса
}

export interface IHeatmapData {
  style: string;
  size: string;
  sales: number;
  stock: number;
}

export interface ILuxuryAnalysis {
  salon_id: number;
  salon_name: string;
  luxury_share_revenue: number;
  luxury_share_stock: number;
  turnover: number;
  style_recommendations: IRecItem[];
  size_recommendations: IRecItem[];
  summary: string;
}

export interface IForecastData {
  ds: string;
  yhat: number;
  yhat_lower: number;
  yhat_upper: number;
}

export interface ICompareResponse {
  salon1: string;
  salon2: string;
  style_comparison: any[];
  size_comparison: any[];
}