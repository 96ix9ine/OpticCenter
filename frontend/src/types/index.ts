// Структура рекомендации по ФМЦ-классу для таблицы действий (Главная)
export interface IFmcRecommendation {
  fmc_class: string;
  stock: number;
  forecast: number;
  action: 'Заказать закупку' | 'Избыток / Ротация' | 'Держать остаток' | 'Критический дефицит';
  qty: number;
}

// Структура аномалий (Главная)
export interface IAnomaly {
  fmc_class: string;
  type: string;
  desc: string;
}

// Данные по премиум-сегменту (Дорогие оправы)
export interface ILuxuryBrand {
  brand_fmc: string;
  stock: number;
  sales_90_days: number;
  efficiency: 'Высокая' | 'Низкая' | 'Критическая';
  action: string;
}

// Ответ API по конкретному салону
export interface ISalonDataResponse {
  salon: string;
  cluster: string;
  recommendations: IFmcRecommendation[];
  anomalies: IAnomaly[];
}
