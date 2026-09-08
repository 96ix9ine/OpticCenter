import pandas as pd
import numpy as np
from typing import Dict, List

class LuxuryAnalysis:
    def __init__(self, df_sales: pd.DataFrame, df_stock: pd.DataFrame, df_products: pd.DataFrame):
        self.df_sales = df_sales
        self.df_stock = df_stock
        self.df_products = df_products
        self._mark_luxury()

    def _mark_luxury(self):
        """Отметить дорогие оправы"""
        luxury_brands = ['Gucci', 'Valentino', 'Prada', 'Tom Ford']
        self.df_products['is_luxury'] = (
            (self.df_products['price'] > 15000) |
            (self.df_products['brand'].isin(luxury_brands))
        )

    def analyze(self, salon_id: int) -> Dict:
        """Провести анализ дорогих оправ для салона"""
        salon_name = self._get_salon_name(salon_id)

        # Общие метрики
        total_revenue = self.df_sales[self.df_sales['salon'] == salon_name]['revenue'].sum()
        luxury_revenue = self.df_sales[
            (self.df_sales['salon'] == salon_name) &
            (self.df_sales['article'].isin(
                self.df_products[self.df_products['is_luxury']]['article']
            ))
        ]['revenue'].sum()

        total_stock = self.df_stock[self.df_stock['salon'] == salon_name]['stock'].sum()
        luxury_stock = self.df_stock[
            (self.df_stock['salon'] == salon_name) &
            (self.df_stock['article'].isin(
                self.df_products[self.df_products['is_luxury']]['article']
            ))
        ]['stock'].sum()

        luxury_share_revenue = luxury_revenue / total_revenue if total_revenue > 0 else 0
        luxury_share_stock = luxury_stock / total_stock if total_stock > 0 else 0

        # Оборачиваемость дорогих
        avg_luxury_stock = luxury_stock / 12 if luxury_stock > 0 else 1  # упрощённо
        turnover = luxury_revenue / avg_luxury_stock if avg_luxury_stock > 0 else 0

        # Рекомендации по стилю для дорогих оправ
        style_recs = self._get_luxury_style_recommendations(salon_name)
        size_recs = self._get_luxury_size_recommendations(salon_name)

        # Итоговое резюме
        if luxury_share_stock > luxury_share_revenue:
            summary = "Переизбыток дорогих оправ в остатках. Рекомендуется сократить закупки и перераспределить в другие салоны."
        elif turnover < 1:
            summary = "Низкая оборачиваемость дорогих оправ. Оставить только бестселлеры, остальное перераспределить."
        elif luxury_share_revenue > 0.3:
            summary = "Хорошие продажи дорогих оправ. Рекомендуется расширить ассортимент в стилях и размерах, которые лучше всего продаются."
        else:
            summary = "Доля дорогих оправ в продажах умеренная. Поддерживать текущий ассортимент, отслеживать тренды."

        return {
            "salon_id": salon_id,
            "salon_name": salon_name,
            "luxury_share_revenue": round(luxury_share_revenue, 3),
            "luxury_share_stock": round(luxury_share_stock, 3),
            "turnover": round(turnover, 2),
            "style_recommendations": style_recs,
            "size_recommendations": size_recs,
            "summary": summary
        }

    def _get_luxury_style_recommendations(self, salon_name: str) -> List[dict]:
        """Рекомендации по стилям дорогих оправ"""
        # Агрегируем продажи дорогих оправ по стилям
        luxury_articles = self.df_products[self.df_products['is_luxury']]['article'].tolist()
        luxury_sales = self.df_sales[
            (self.df_sales['salon'] == salon_name) &
            (self.df_sales['article'].isin(luxury_articles))
        ].merge(self.df_products[['article', 'class_style']], on='article')

        style_sales = luxury_sales.groupby('class_style')['revenue'].sum().sort_values(ascending=False)

        # Топ-5 стилей
        recommendations = []
        for style, revenue in style_sales.head(5).items():
            # Находим остаток
            articles_style = self.df_products[self.df_products['class_style'] == style]['article'].tolist()
            stock = self.df_stock[
                (self.df_stock['salon'] == salon_name) &
                (self.df_stock['article'].isin(articles_style))
            ]['stock'].sum()

            recommendations.append({
                "class_name": style,
                "sales": round(revenue, 0),
                "stock": int(stock),
                "recommendation": "Расширить ассортимент" if revenue > 100000 else "Поддерживать текущий уровень"
            })

        return recommendations

    def _get_luxury_size_recommendations(self, salon_name: str) -> List[dict]:
        """Рекомендации по размерам дорогих оправ"""
        # Агрегируем продажи дорогих оправ по размерам
        luxury_articles = self.df_products[self.df_products['is_luxury']]['article'].tolist()
        luxury_sales = self.df_sales[
            (self.df_sales['salon'] == salon_name) &
            (self.df_sales['article'].isin(luxury_articles))
        ].merge(self.df_products[['article', 'class_size']], on='article')

        size_sales = luxury_sales.groupby('class_size')['revenue'].sum().sort_values(ascending=False)

        # Топ-5 размеров
        recommendations = []
        for size, revenue in size_sales.head(5).items():
            articles_size = self.df_products[self.df_products['class_size'] == size]['article'].tolist()
            stock = self.df_stock[
                (self.df_stock['salon'] == salon_name) &
                (self.df_stock['article'].isin(articles_size))
            ]['stock'].sum()

            recommendations.append({
                "class_name": size,
                "sales": round(revenue, 0),
                "stock": int(stock),
                "recommendation": "Увеличить закупку" if revenue > 100000 else "Оставить минимальный ассортимент"
            })

        return recommendations

    def _get_salon_name(self, salon_id: int) -> str:
        """Получить имя салона по ID"""
        salons = self.df_sales['salon'].unique()
        if salon_id - 1 < len(salons):
            return salons[salon_id - 1]
        return f"Салон_{salon_id}"
