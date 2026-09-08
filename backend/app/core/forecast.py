import pandas as pd
import numpy as np
from prophet import Prophet
from typing import Dict, List

class Forecast:
    def __init__(self, df_sales: pd.DataFrame, df_products: pd.DataFrame):
        self.df_sales = df_sales
        self.df_products = df_products
        self.forecasts = {}

    def forecast_all(self) -> Dict:
        """Сделать прогнозы для всех классов"""
        # Прогноз по Моде
        for class_style in self.df_products['class_style'].unique():
            self._forecast_class('class_style', class_style)

        # Прогноз по Анатомии
        for class_size in self.df_products['class_size'].unique():
            self._forecast_class('class_size', class_size)

        # Прогноз по комбинированному классу
        for class_full in self.df_products['class_full'].unique():
            self._forecast_class('class_full', class_full)

        return self.forecasts

    def _forecast_class(self, class_column: str, class_value: str):
        """Прогноз для одного класса"""
        # Агрегируем продажи по датам
        sales_agg = self.df_sales[
            self.df_sales[class_column] == class_value
        ].groupby('date')['quantity'].sum().reset_index()
        sales_agg.columns = ['ds', 'y']

        if len(sales_agg) < 10:
            # Недостаточно данных
            self.forecasts[f"{class_column}_{class_value}"] = None
            return

        try:
            model = Prophet()
            model.fit(sales_agg)
            future = model.make_future_dataframe(periods=4, freq='W')
            forecast = model.predict(future)

            self.forecasts[f"{class_column}_{class_value}"] = {
                'model': model,
                'forecast': forecast[['ds', 'yhat', 'yhat_lower', 'yhat_upper']].tail(4).to_dict('records')
            }
        except Exception as e:
            self.forecasts[f"{class_column}_{class_value}"] = None

    def get_forecast(self, salon_id: int, classifier_type: str, class_value: str) -> List[dict]:
        """Получить прогноз для конкретного класса"""
        key = f"{classifier_type}_{class_value}"
        if key not in self.forecasts or self.forecasts[key] is None:
            return []

        # Возвращаем сохранённый прогноз
        return self.forecasts[key]['forecast']
