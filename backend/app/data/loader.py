# backend/app/data/loader.py
import pandas as pd
import os
from dotenv import load_dotenv

load_dotenv()

class DataLoader:
    def __init__(self):
        self.data_dir = os.getenv("DATA_DIR", "./data")
        
    def load_all_precomputed(self) -> dict:
        """Загружает финальные бизнес-отчеты """
        def safe_read(filename: str) -> pd.DataFrame:
            path = f"{self.data_dir}/{filename}"
            if os.path.exists(path):
                df = pd.read_csv(path)
                df.columns = df.columns.str.strip() # Чистим пробелы в шапке
                return df
            print(f"⚠️ Файл не найден: {path}")
            return pd.DataFrame()

        return {
            "ost_40let": safe_read("отчет_40_лет_Октября.csv"),
            "ost_vasenko": safe_read("отчет_Васенко.csv"),
            "ost_komar": safe_read("отчет_Комарова.csv"),
            "monthly_forecast": safe_read("отчет_с_ежемесячным_прогнозом.csv"),
            "dynamics_summary": safe_read("сводные_данные_динамика_спроса.csv"),
            "products": safe_read("оптика_products.csv") # Используем для поиска премиума
        }

    def get_salons(self) -> list[dict]:
        return [
            {"id": 1, "name": "Салон 40 лет Октября", "file_key": "ost_40let", "address": "г. Челябинск, ул. 40 лет Октября, д. 15"},
            {"id": 2, "name": "Салон Комаровского", "file_key": "ost_komar", "address": "г. Челябинск, ул. Комаровского, д. 4"},
            {"id": 3, "name": "Салон Васенко", "file_key": "ost_vasenko", "address": "г. Челябинск, ул. Васенко, д. 96"}
        ]
