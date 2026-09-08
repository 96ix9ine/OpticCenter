import React, { useState } from 'react';
import { AlertTriangle, ArrowUpRight, ShieldAlert, CheckCircle2 } from 'lucide-react';

// Локальный интерфейс для строк таблицы
interface IRecRow {
  fmc_class: string;
  stock: number;
  forecast: number;
  action: 'Заказать закупку' | 'Избыток / Ротация' | 'Держать остаток' | 'Критический дефицит';
  qty: number;
}

interface IAnomalyRow {
  fmc_class: string;
  type: string;
  desc: string;
}

interface RecommendationsProps {
  salonName: string;
}

export const Recommendations: React.FC<RecommendationsProps> = ({ salonName }) => {
  // Фейковые данные, полностью повторяющие будущую структуру бэкенда/1С из ТЗ
  const mockData: IRecRow[] = [
    { fmc_class: "Квадрат–Металл–Черный", stock: 2, forecast: 15, action: "Заказать закупку", qty: 13 },
    { fmc_class: "Круг–Пластик–Леопард", stock: 42, forecast: 8, action: "Избыток / Ротация", qty: -34 },
    { fmc_class: "Овал–Металл–Золото", stock: 10, forecast: 11, action: "Держать остаток", qty: 0 },
    { fmc_class: "Авиатор–Пластик–Коричневый", stock: 0, forecast: 18, action: "Критический дефицит", qty: 18 }
  ];

  const mockAnomalies: IAnomalyRow[] = [
    { fmc_class: "Авиатор–Пластик–Коричневый", type: "Всплеск спроса", desc: "Продажи за неделю выросли в 3 раза относительно исторического тренда Prophet." }
  ];

  // Стилизация плашек статусов (AI Решения)
  const getActionBadge = (action: IRecRow['action']) => {
    switch (action) {
      case 'Критический дефицит':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center w-max gap-1"><ShieldAlert className="w-3.5 h-3.5" /> Критический дефицит</span>;
      case 'Заказать закупку':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 flex items-center w-max gap-1"><ArrowUpRight className="w-3.5 h-3.5" /> Заказать закупку</span>;
      case 'Избыток / Ротация':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-amber-100 text-amber-800 flex items-center w-max gap-1"><AlertTriangle className="w-3.5 h-3.5" /> Избыток / Ротация</span>;
      case 'Держать остаток':
        return <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center w-max gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Держать остаток</span>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Рекомендации по ассортименту матрицы</h2>
        <p className="text-sm text-gray-500">Автоматические действия на основе сравнения текущих остатков и прогноза Prophet.</p>
      </div>

      {/* Блок Аномалий из ТЗ */}
      {mockAnomalies.length > 0 && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 shadow-sm">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="w-full">
            <h4 className="text-sm font-bold text-red-800">Обнаружены критические аномалии спроса: {mockAnomalies.length}</h4>
            <div className="mt-2 divide-y divide-red-100">
              {mockAnomalies.map((anomaly, idx) => (
                <div key={idx} className="text-xs text-red-700 py-1 flex justify-between items-center">
                  <span><strong>{anomaly.fmc_class}</strong>: {anomaly.desc}</span>
                  <span className="font-semibold bg-red-100 px-2 py-0.5 rounded text-[10px] uppercase">{anomaly.type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Таблица Рекомендаций из ТЗ */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold uppercase text-gray-400">
              <th className="p-4">Класс ФМЦ (Форма–Материал–Цвет)</th>
              <th className="p-4 text-center">Текущий сток</th>
              <th className="p-4 text-center">Прогноз спроса (30д)</th>
              <th className="p-4">Решение AI</th>
              <th className="p-4 text-center">Необходимый объем</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {mockData.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50 transition-colors">
                <td className="p-4 font-semibold text-gray-800">{row.fmc_class}</td>
                <td className="p-4 text-center font-medium text-gray-600">{row.stock} шт</td>
                <td className="p-4 text-center font-bold text-blue-600">{row.forecast} шт</td>
                <td className="p-4">{getActionBadge(row.action)}</td>
                <td className="p-4 text-center font-bold">
                  {row.qty > 0 ? (
                    <span className="text-red-600">+{row.qty} шт</span>
                  ) : row.qty < 0 ? (
                    <span className="text-amber-600">{row.qty} шт</span>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
