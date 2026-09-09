# backend/app/data/loader.py
import pandas as pd
import os
from dotenv import load_dotenv
from typing import Dict, List

load_dotenv()

class DataLoader:
    def __init__(self):
        self.data_dir = os.getenv("DATA_DIR", "./data")
        
    def load_all_precomputed(self, category: str = "оптика") -> dict:
        """
        Загружает готовые результаты расчетов для выбранной категории.
        Если файл отсутствует, подставляет пустой датафрейм, защищая сервер от падения.
        """
        prefix = f"{self.data_dir}/{category}"
        
        def safe_read(file_path: str) -> pd.DataFrame:
            if os.path.exists(file_path):
                try:
                    return pd.read_csv(file_path)
                except Exception as e:
                    print(f"⚠️ Ошибка чтения файла {file_path}: {e}")
                    return pd.DataFrame()
            return pd.DataFrame()

        # Если главного файла XYZ нет, пропускаем всю категорию
        if not os.path.exists(f"{prefix}_xyz_full.csv"):
            print(f"⚠️ Базовый файл {prefix}_xyz_full.csv не найден. Пропуск.")
            return None

        return {
            "products": safe_read(f"{prefix}_products.csv"),
            "xyz_style": safe_read(f"{prefix}_xyz_style.csv"),
            "xyz_size": safe_read(f"{prefix}_xyz_size.csv"),
            "xyz_full": safe_read(f"{prefix}_xyz_full.csv"),
            "forecast_style": safe_read(f"{prefix}_forecast_style.csv"),
        }

    def get_salons(self) -> List[dict]:
        """
        [Часть 1 ТЗ] Возвращает список реальных салонов Челябинска.
        Зафиксировано строго по ТЗ, чтобы исключить попадание FMC-классов в селектор.
        """
        return [
            {"id": 1, "name": "Салон 40 лет Октября", "address": "г. Челябинск, ул. 40 лет Октября, д. 15"},
            {"id": 2, "name": "Салон Комаровского", "address": "г. Челябинск, ул. Комаровского, д. 4"},
            {"id": 3, "name": "Салон Васенко", "address": "г. Челябинск, ул. Васенко, д. 96"}
        ]
