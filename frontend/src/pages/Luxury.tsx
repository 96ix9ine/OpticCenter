import React, { useState, useEffect } from 'react';
import { AlertCircle, Package, TrendingUp, Cpu } from 'lucide-react';
import type { ILuxuryAnalysis } from '../types';

export const Luxury: React.FC<{ salonId: number, category: string }> = ({ salonId, category }) => {
  const [data, setData] = useState<ILuxuryAnalysis | null>(null);
  const [tab, setTab] = useState<'mode' | 'anatomy'>('mode');

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || '';

    fetch(`${backendUrl}/api/luxury/${salonId}?category=${category}`)
      .then(res => res.json())
      .then(setData);
  }, [salonId, category]);

  if (!data) return null;

  const rows = tab === 'mode' ? data.style_recommendations : data.size_recommendations;

  // Проверяем, пустая ли таблица пришла от бэкенда
  const isDataEmpty = !rows || rows.length === 0;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Анализ премиального сегмента люкс</h2>
        <p className="text-sm text-gray-500 mt-1">Оборачиваемость люкса на этой точке составляет: <strong className="text-gray-800">{data.turnover} дней</strong></p>
      </div>

      <div className="flex border-b border-gray-200 gap-6">
        <button 
          onClick={() => setTab('mode')} 
          className={`pb-3 font-bold text-sm transition-all focus:outline-none ${tab === 'mode' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Таблица по Моде
        </button>
        <button 
          onClick={() => setTab('anatomy')} 
          className={`pb-3 font-bold text-sm transition-all focus:outline-none ${tab === 'anatomy' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}
        >
          Таблица по Анатомии
        </button>
      </div>

      {isDataEmpty ? (
        <div className="p-8 border border-dashed border-gray-200 rounded-xl flex flex-col justify-center items-center text-center bg-gray-50 text-gray-500">
          <AlertCircle className="w-8 h-8 text-amber-500 mb-2" />
          <h4 className="font-bold text-sm text-gray-700">Недостаточно данных</h4>
          <p className="text-xs max-w-sm mt-1">В выбранном салоне отсутствуют продажи по классам люкс за указанный период времени.</p>
        </div>
      ) : (
        <>
          {/* ВАРИАНТ 1: Классическая таблица для десктопов и планшетов (md+) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-gray-50 border-b text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="p-3">Характеристика Люкса</th>
                  <th className="p-3 text-center">Остаток</th>
                  <th className="p-3 text-center">Прогноз (1м)</th>
                  <th className="p-3">AI Решение</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b">
                {rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-semibold text-gray-700">{row.class_name}</td>
                    <td className="p-3 text-center text-gray-600">{row.current_stock} шт</td>
                    <td className="p-3 text-center text-gray-600">{row.forecast_1m} шт</td>
                    <td className="p-3">
                      <span className="inline-block text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full border border-purple-100">
                        {row.recommendation}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ВАРИАНТ 2: Компактные карточки для смартфонов (мобильная адаптация) */}
          <div className="block md:hidden space-y-4">
            {rows.map((row, idx) => (
              <div key={idx} className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                <div className="border-b border-gray-100 pb-2">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Характеристика</span>
                  <div className="text-sm font-bold text-gray-800 break-words">{row.class_name}</div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2">
                    <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] block text-gray-400 uppercase">Остаток</span>
                      <span className="font-semibold text-gray-700">{row.current_stock} шт</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2">
                    <TrendingUp className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <div>
                      <span className="text-[10px] block text-gray-400 uppercase">Прогноз (1м)</span>
                      <span className="font-semibold text-gray-700">{row.forecast_1m} шт</span>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50/50 border border-purple-100/50 p-2.5 rounded-lg flex items-start gap-2">
                  <Cpu className="w-4 h-4 text-purple-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <span className="text-[10px] block font-bold text-purple-500 uppercase tracking-wide">AI Решение</span>
                    <p className="text-xs font-medium text-purple-900 mt-0.5">{row.recommendation}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="p-4 bg-purple-50 border border-purple-100 rounded-xl">
        <h4 className="text-xs font-bold uppercase tracking-wider text-purple-800 mb-2">Резюме премиум-контура:</h4>
        <p className="text-xs text-purple-900 leading-relaxed font-medium">{data.summary}</p>
      </div>
    </div>
  );
};
