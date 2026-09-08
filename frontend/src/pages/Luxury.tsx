import React from 'react';
import { Gem, TrendingDown, Layers, Hourglass, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface ILuxuryBrandRow {
  brand_fmc: string;
  stock: number;
  sales_90_days: number;
  efficiency_index: number; // Отношение доли в продажах к доле в остатках
  action: 'Расширить закупку' | 'Вывести (Ротация)' | 'Оставить бестселлер';
}

interface LuxuryProps {
  salonName: string;
}

export const Luxury: React.FC<LuxuryProps> = ({ salonName }) => {
  // Имитируем расчеты на основе выгрузки 1С для выбранного салона
  const luxuryData: ILuxuryBrandRow[] = [
    { brand_fmc: "Ray-Ban • Авиатор • Металл", stock: 15, sales_90_days: 28, efficiency_index: 1.65, action: "Расширить закупку" },
    { brand_fmc: "Gucci • Оверсайз • Пластик", stock: 24, sales_90_days: 4, efficiency_index: 0.38, action: "Вывести (Ротация)" },
    { brand_fmc: "Tom Ford • Квадрат • Ацетат", stock: 10, sales_90_days: 12, efficiency_index: 1.05, action: "Оставить бестселлер" }
  ];

  // Рендеринг иконок и цветов для решений AI
  const getActionStyle = (action: ILuxuryBrandRow['action']) => {
    switch (action) {
      case 'Расширить закупку':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-800 flex items-center w-max gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> Расширить</span>;
      case 'Вывести (Ротация)':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-rose-100 text-rose-800 flex items-center w-max gap-1"><ArrowDownRight className="w-3.5 h-3.5" /> Сократить / Ротация</span>;
      case 'Оставить бестселлер':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 flex items-center w-max gap-1"><Minus className="w-3.5 h-3.5" /> Бестселлеры</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Анализ премиального сегмента и люкса</h2>
        <p className="text-sm text-gray-500">Оценка емкости полки для {salonName} на основе локального профиля покупателя.</p>
      </div>

      {/* Верхняя панель KPI Метрик из ТЗ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-lg"><Layers className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase">Доля люкса в остатках</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">41.2%</p>
            <span className="text-[10px] text-red-500 font-medium">⚠️ Риск заморозки капитала</span>
          </div>
        </div>

        <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg"><Gem className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase">Доля люкса в выручке</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">24.5%</p>
            <span className="text-[10px] text-emerald-600 font-medium">▲ +2.1% к прошлому мес.</span>
          </div>
        </div>

        <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-lg"><Hourglass className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase">Оборачиваемость премиума</p>
            <p className="text-xl font-bold text-gray-900 mt-0.5">145 дней</p>
            <span className="text-[10px] text-amber-600 font-medium">Целевой показатель: &lt; 90 дней</span>
          </div>
        </div>
      </div>

      {/* Таблица анализа брендов */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <h3 className="text-sm font-bold text-gray-700">Индекс эффективности работы с люксом (Sales-to-Stock Index)</h3>
        </div>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-400">
              <th className="p-4">Премиум-модель / Бренд</th>
              <th className="p-4 text-center">Текущий сток</th>
              <th className="p-4 text-center">Продажи (90 дн)</th>
              <th className="p-4 text-center">Индекс полки</th>
              <th className="p-4">Решение AI</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {luxuryData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-semibold text-gray-800">{row.brand_fmc}</td>
                <td className="p-4 text-center font-medium text-gray-600">{row.stock} шт</td>
                <td className="p-4 text-center font-bold text-gray-800">{row.sales_90_days} шт</td>
                <td className="p-4 text-center">
                  <span className={`font-bold ${row.efficiency_index >= 1.0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {row.efficiency_index.toFixed(2)}
                  </span>
                </td>
                <td className="p-4">{getActionStyle(row.action)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="p-3 bg-gray-50 text-[11px] text-gray-400 border-t border-gray-100">
          * Индекс &gt; 1.0 указывает на высокую скорость генерации выручки относительно занимаемого места на полке салона.
        </div>
      </div>
    </div>
  );
};
