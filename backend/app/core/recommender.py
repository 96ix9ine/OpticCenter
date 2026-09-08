import pandas as pd
import numpy as np
from typing import Dict, List, Tuple

class Recommender:
    def __init__(
        self,
        df_sales: pd.DataFrame,
        df_stock: pd.DataFrame,
        df_products: pd.DataFrame,
        forecasts: Dict,
        clusters: Dict
    ):
        self.df_sales = df_sales
        self.df_stock = df_stock
        self.df_products = df_products
        self.forecasts = forecasts
        self.clusters = clusters

    def get_recommendations(self, salon_id: int) -> Dict:
        """Получить рекомендации для салона"""
        salon_name = self._get_salon_name(salon_id)

        style_recs = self._get_style_recommendations(salon_id)
        size_recs = self._get_size_recommendations(salon_id)
        combined_recs = self._get_combined_recommendations(salon_id)
        anomalies = self._get_anomalies(salon_id)

        return {
            "salon_id": salon_id,
            "salon_name": salon_name,
            "style": style_recs,
            "size": size_recs,
            "combined": combined_recs,
            "anomalies": anomalies
        }

    def _get_style_recommendations(self, salon_id: int) -> List[dict]:
        """Рекомендации по стилю (Мода)"""
        salon_name = self._get_salon_name(salon_id)
        recommendations = []

        for class_style in self.df_products['class_style'].unique():
            stock = self._get_stock(salon_name, class_style, 'class_style')
            forecast_1m = self._get_forecast(salon_name, class_style, 'class_style', 1)
            forecast_3m = self._get_forecast(salon_name, class_style, 'class_style', 3)

            if stock is None or forecast_1m is None:
                continue

            rec = self._generate_recommendation(stock, forecast_1m, forecast_3m)
            recommendations.append({
                "class_name": class_style,
                "current_stock": stock,
                "forecast_1m": round(forecast_1m, 1),
                "forecast_3m": round(forecast_3m, 1),
                "recommendation": rec['action'],
                "details": rec['details']
            })

        return sorted(recommendations, key=lambda x: x['current_stock'] - x['forecast_1m'])

    def _get_size_recommendations(self, salon_id: int) -> List[dict]:
        """Рекомендации по размеру (Анатомия)"""
        salon_name = self._get_salon_name(salon_id)
        recommendations = []

        for class_size in self.df_products['class_size'].unique():
            stock = self._get_stock(salon_name, class_size, 'class_size')
            forecast_1m = self._get_forecast(salon_name, class_size, 'class_size', 1)
            forecast_3m = self._get_forecast(salon_name, class_size, 'class_size', 3)

            if stock is None or forecast_1m is None:
                continue

            rec = self._generate_recommendation(stock, forecast_1m, forecast_3m)
            recommendations.append({
                "class_name": class_size,
                "current_stock": stock,
                "forecast_1m": round(forecast_1m, 1),
                "forecast_3m": round(forecast_3m, 1),
                "recommendation": rec['action'],
                "details": rec['details']
            })

        return sorted(recommendations, key=lambda x: x['current_stock'] - x['forecast_1m'])

    def _get_combined_recommendations(self, salon_id: int) -> List[dict]:
        """Рекомендации по комбинированному классу"""
        salon_name = self._get_salon_name(salon_id)
        recommendations = []

        for class_full in self.df_products['class_full'].unique():
            stock = self._get_stock(salon_name, class_full, 'class_full')
            forecast_1m = self._get_forecast(salon_name, class_full, 'class_full', 1)
            forecast_3m = self._get_forecast(salon_name, class_full, 'class_full', 3)

            if stock is None or forecast_1m is None:
                continue

            rec = self._generate_recommendation(stock, forecast_1m, forecast_3m)
            recommendations.append({
                "class_name": class_full,
                "current_stock": stock,
                "forecast_1m": round(forecast_1m, 1),
                "forecast_3m": round(forecast_3m, 1),
                "recommendation": rec['action'],
                "details": rec['details']
            })

        return sorted(recommendations, key=lambda x: x['current_stock'] - x['forecast_1m'])

    def _generate_recommendation(self, stock: int, forecast_1m: float, forecast_3m: float) -> dict:
        """Генерация одной рекомендации"""
        if stock < forecast_1m * 1.2:
            need = max(0, int(forecast_1m * 1.2 - stock))
            return {
                "action": "Заказать",
                "details": f"Необходимо {need} шт."
            }
        elif stock > forecast_3m:
            excess = int(stock - forecast_3m)
            return {
                "action": "Убрать / Перераспределить",
                "details": f"Избыток {excess} шт."
            }
        else:
            return {
                "action": "Держать",
                "details": "Уровень запаса оптимален"
            }

    def _get_stock(self, salon_name: str, class_value: str, class_column: str) -> int:
        """Получить остаток по классу"""
        # Находим артикулы этого класса
        articles = self.df_products[self.df_products[class_column] == class_value]['article'].tolist()

        if not articles:
            return None

        stock = self.df_stock[
            (self.df_stock['salon'] == salon_name) &
            (self.df_stock['article'].isin(articles))
        ]['stock'].sum()

        return stock

    def _get_forecast(self, salon_name: str, class_value: str, class_column: str, months: int) -> float:
        """Получить прогноз по классу"""
        # Используем агрегированный прогноз по кластеру
        # Находим кластер салона
        salon_id = self._get_salon_id(salon_name)
        cluster_full = self.clusters.get(salon_id, (None, None, None))[2]

        if cluster_full is None:
            return None

        # Прогноз по кластеру
        # Упрощённо: берём средний прогноз по всем салонам кластера
        key = f"{class_column}_{class_value}"
        if key not in self.forecasts or self.forecasts[key] is None:
            return None

        forecast_data = self.forecasts[key]['forecast']
        if not forecast_data:
            return None

        # Суммируем прогноз за указанное количество недель
        total = sum([item['yhat'] for item in forecast_data[:months*4]])
        return total

    def _get_anomalies(self, salon_id: int) -> List[dict]:
        """Найти аномалии в продажах"""
        salon_name = self._get_salon_name(salon_id)
        anomalies = []

        # Для каждого класса проверяем отклонения
        for class_full in self.df_products['class_full'].unique():
            sales = self.df_sales[
                (self.df_sales['salon'] == salon_name) &
                (self.df_sales['class_full'] == class_full)
            ]

            if len(sales) < 4:
                continue

            # Последние 2 недели vs предыдущие 4 недели
            last_2w = sales.tail(2)['quantity'].sum()
            prev_4w = sales.tail(6).head(4)['quantity'].sum() if len(sales) >= 6 else last_2w

            if prev_4w > 0:
                change = (last_2w - prev_4w) / prev_4w
                if change > 0.3:
                    anomalies.append({
                        "class": class_full,
                        "type": "spike",
                        "message": f"Всплеск продаж на {round(change*100)}% за последние 2 недели"
                    })
                elif change < -0.3:
                    anomalies.append({
                        "class": class_full,
                        "type": "drop",
                        "message": f"Падение продаж на {round(abs(change)*100)}% за последние 2 недели"
                    })

        return anomalies[:10]

    def _get_salon_name(self, salon_id: int) -> str:
        """Получить имя салона по ID"""
        salons = self.df_sales['salon'].unique()
        if salon_id - 1 < len(salons):
            return salons[salon_id - 1]
        return f"Салон_{salon_id}"

    def _get_salon_id(self, salon_name: str) -> int:
        """Получить ID салона по имени"""
        salons = self.df_sales['salon'].unique()
        for i, name in enumerate(salons):
            if name == salon_name:
                return i + 1
        return None

    def get_heatmap(self, salon_id: int) -> List[dict]:
        """Получить данные для тепловой карты"""
        salon_name = self._get_salon_name(salon_id)
        heatmap_data = []

        # Получаем все уникальные стили и размеры
        styles = self.df_products['class_style'].unique()
        sizes = self.df_products['class_size'].unique()

        for style in styles:
            for size in sizes:
                class_full = f"{style}_{size}"
                sales = self.df_sales[
                    (self.df_sales['salon'] == salon_name) &
                    (self.df_sales['class_full'] == class_full)
                ]['revenue'].sum()

                stock = self.df_stock[
                    (self.df_stock['salon'] == salon_name)
                ]

                # Находим артикулы этого класса
                articles = self.df_products[
                    self.df_products['class_full'] == class_full
                ]['article'].tolist()

                stock_val = stock[stock['article'].isin(articles)]['stock'].sum() if articles else 0

                heatmap_data.append({
                    "style": style,
                    "size": size,
                    "sales": float(sales),
                    "stock": float(stock_val)
                })

        return heatmap_data

    def compare_salons(self, salon1_id: int, salon2_id: int) -> dict:
        """Сравнить два салона"""
        salon1_name = self._get_salon_name(salon1_id)
        salon2_name = self._get_salon_name(salon2_id)

        # Получаем данные по продажам для обоих салонов
        sales1 = self.df_sales[self.df_sales['salon'] == salon1_name]
        sales2 = self.df_sales[self.df_sales['salon'] == salon2_name]

        # Сравнение по стилю
        style_compare = []
        for style in self.df_products['class_style'].unique():
            revenue1 = sales1[sales1['class_style'] == style]['revenue'].sum()
            revenue2 = sales2[sales2['class_style'] == style]['revenue'].sum()
            style_compare.append({
                "class": style,
                "salon1": float(revenue1),
                "salon2": float(revenue2)
            })

        # Сравнение по размеру
        size_compare = []
        for size in self.df_products['class_size'].unique():
            revenue1 = sales1[sales1['class_size'] == size]['revenue'].sum()
            revenue2 = sales2[sales2['class_size'] == size]['revenue'].sum()
            size_compare.append({
                "class": size,
                "salon1": float(revenue1),
                "salon2": float(revenue2)
            })

        return {
            "salon1": salon1_name,
            "salon2": salon2_name,
            "style_comparison": sorted(style_compare, key=lambda x: x['salon1'] + x['salon2'], reverse=True)[:10],
            "size_comparison": sorted(size_compare, key=lambda x: x['salon1'] + x['salon2'], reverse=True)[:10]
        }
