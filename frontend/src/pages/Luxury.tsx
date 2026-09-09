import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import type { ILuxuryAnalysis } from '../types';

export const Luxury: React.FC<{ salonId: number }> = ({ salonId }) => {
  const [data, setData] = useState<ILuxuryAnalysis | null>(null);
  const [tab, setTab] = useState<'mode' | 'anatomy'>('mode');

  useEffect(() => {
    fetch(`http://localhost:8000/api/luxury/${salonId}`)
      .then(res => res.json())
      .then(setData);
  }, [salonId]);

  if (!data) return null;

  const rows = tab === 'mode' ? data.style_recommendations : data.size_recommendations;

  // Проверяем, пустая ли таблица пришла от бэкенда
  const isDataEmpty = !rows || rows.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Анализ премиального сегмента люкс</h2>
        <p className="text-sm text-gray-400 mt-1">Оборачиваемость люкса на этой точке составляет: <strong>{data.turnover} дней</strong></p>
      </div>

      <div className="flex border-b border-gray-200 gap-4">
        <button onClick={() => setTab('mode')} className={`pb-2 font-bold text-sm ${tab === 'mode' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}>Таблица по Моде</button>
        <button onClick={() => setTab('anatomy')} className={`pb-2 font-bold text-sm ${tab === 'anatomy' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}>Таблица по Анатомии</button>
      </div>

      {isDataEmpty ? (
        // Красивая плашка-предупреждение, если в чеках 1С не нашлось продаж дорогого сегмента
        <div className="p-8 border border-dashed border-gray-200 rounded-xl flex flex-col justify-center items-center text-center bg-gray-50 text-gray-500">
          <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
          <h4 className="font-bold text-sm text-gray-700">Недостаточно данных</h4>
          <p className="text-xs max-w-sm mt-1">В выбранном салоне отсутствуют продажи по классам люкс за указанный период времени.</p>
        </div>
      ) : (
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 border-b text-xs font-bold text-gray-400 uppercase">
              <th className="p-3">Характеристика Люкса</th>
              <th className="p-3 text-center">Остаток</th>
              <th className="p-3 text-center">Прогноз (1м)</th>
              <th className="p-3">AI Решение</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {rows.map((row, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="p-3 font-semibold text-gray-700">{row.class_name}</td>
                <td className="p-3 text-center">{row.current_stock} шт</td>
                <td className="p-3 text-center">{row.forecast_1m} шт</td>
                <td className="p-3"><span className="text-xs font-medium text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">{row.recommendation}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-2">Резюме премиум-контура:</h4>
        <p className="text-xs text-purple-900 leading-relaxed">{data.summary}</p>
      </div>
    </div>
  );
};