import pandas as pd
import numpy as np
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
from typing import Dict, Tuple

class Clustering:
    def __init__(self):
        self.style_kmeans = None
        self.size_kmeans = None

    def cluster_salons(self, df_sales: pd.DataFrame) -> Dict[int, Tuple[str, str, str]]:
        """Кластеризация салонов по стилю и размеру"""
        # Кластеризация по стилю
        pivot_style = df_sales.pivot_table(
            index='salon',
            columns='class_style',
            values='revenue',
            aggfunc='sum',
            fill_value=0
        )

        scaler_style = StandardScaler()
        scaled_style = scaler_style.fit_transform(pivot_style)
        self.style_kmeans = KMeans(n_clusters=3, random_state=42)
        style_clusters = self.style_kmeans.fit_predict(scaled_style)

        # Кластеризация по размеру
        pivot_size = df_sales.pivot_table(
            index='salon',
            columns='class_size',
            values='revenue',
            aggfunc='sum',
            fill_value=0
        )

        scaler_size = StandardScaler()
        scaled_size = scaler_size.fit_transform(pivot_size)
        self.size_kmeans = KMeans(n_clusters=3, random_state=42)
        size_clusters = self.size_kmeans.fit_predict(scaled_size)

        # Формируем результат
        result = {}
        salon_names = pivot_style.index.tolist()
        for i, salon in enumerate(salon_names):
            # Получаем ID салона (индекс + 1)
            salon_id = i + 1
            result[salon_id] = (
                f"Стиль_{style_clusters[i]}",
                f"Размер_{size_clusters[i]}",
                f"Стиль_{style_clusters[i]}_Размер_{size_clusters[i]}"
            )

        return result
