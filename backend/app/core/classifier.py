import pandas as pd

class Classifier:
    def __init__(self, df_products: pd.DataFrame):
        self.df_products = df_products.copy()

    def classify_all(self) -> pd.DataFrame:
        """Применить все классификаторы"""
        self._classify_style()
        self._classify_size()
        self._classify_full()
        return self.df_products

    def _classify_style(self):
        """Классификация по Моде (стиль)"""
        self.df_products['class_style'] = (
            self.df_products['form'] + '_' +
            self.df_products['material'] + '_' +
            self.df_products['color']
        )

    def _classify_size(self):
        """Классификация по Анатомии (размеры) с дискретизацией S/M/L"""
        def size_class(temples, lens, bridge):
            t = 'S' if temples < 135 else 'M' if temples < 145 else 'L'
            l = 'S' if lens < 48 else 'M' if lens < 52 else 'L'
            b = 'S' if bridge < 16 else 'M' if bridge < 18 else 'L'
            return f"{t}_{l}_{b}"

        self.df_products['class_size'] = self.df_products.apply(
            lambda r: size_class(r['temples_length'], r['lens_width'], r['bridge_width']),
            axis=1
        )

    def _classify_full(self):
        """Итоговый комбинированный класс"""
        self.df_products['class_full'] = (
            self.df_products['class_style'] + '_' +
            self.df_products['class_size']
        )
