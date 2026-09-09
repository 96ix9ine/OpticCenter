import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Loader2, AlertCircle } from 'lucide-react';
import type { IRecommendationsResponse, IRecItem } from '../types';

export const Recommendations: React.FC<{ salonId: number }> = ({ salonId }) => {
  const [data, setData] = useState<IRecommendationsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'mode' | 'anatomy' | 'combined'>('mode');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:8000/api/recommendations/${salonId}`)
      .then(res => {
        if (!res.ok) throw new Error(`Ошибка сервера: ${res.status}`);
        return res.json();
      })
      .then((apiData) => {
        setData(apiData);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [salonId]);

  const getActiveRows = (): IRecItem[] => {
    if (!data) return [];
    if (activeTab === 'mode') return data.style || [];
    if (activeTab === 'anatomy') return data.size || [];
    return data.combined || [];
  };

  const getGraphOption = () => {
    const rows = data?.combined || [];
    return {
      title: { text: 'Спрос vs Сток по Комбинированным классам ФМЦ', left: 'center', textStyle: { fontSize: 12 } },
      tooltip: { trigger: 'axis' },
      xAxis: { type: 'category', data: rows.map(r => r.class_name || 'Класс') },
      yAxis: { type: 'value' },
      series: [
        { name: 'Текущий сток', type: 'bar', data: rows.map(r => r.current_stock || 0), itemStyle: { color: '#93c5fd' } },
        { name: 'Прогноз Prophet', type: 'line', data: rows.map(r => r.forecast_1m || 0), itemStyle: { color: '#2563eb' } }
      ]
    };
  };

  if (loading) return <div className="p-12 flex justify-center items-center gap-2 text-gray-500"><Loader2 className="w-5 h-5 animate-spin text-blue-500" /> Загрузка матриц Prophet из ClickHouse...</div>;
  if (error) return <div className="p-6 bg-red-50 text-red-700 rounded-xl border border-red-200">❌ Не удалось связаться с API: {error}</div>;

  const rows = getActiveRows();

  return (
    <div className="space-y-6">
      {/* Навигационные табы из ТЗ */}
      <div className="flex border-b border-gray-200 gap-4">
        <button onClick={() => setActiveTab('mode')} className={`pb-2 font-bold text-sm transition-colors ${activeTab === 'mode' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>По Моде</button>
        <button onClick={() => setActiveTab('anatomy')} className={`pb-2 font-bold text-sm transition-colors ${activeTab === 'anatomy' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>По Анатомии</button>
        <button onClick={() => setActiveTab('combined')} className={`pb-2 font-bold text-sm transition-colors ${activeTab === 'combined' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'}`}>Комбинированные</button>
      </div>

      {rows.length === 0 ? (
        <div className="p-8 border border-dashed border-gray-200 rounded-xl flex flex-col justify-center items-center text-center bg-gray-50 text-gray-500">
          <AlertCircle className="w-6 h-6 text-amber-500 mb-2" />
          <h4 className="font-bold text-sm text-gray-700">Нет данных для этого сочетания</h4>
          <p className="text-xs mt-1">Данные для выбранного фильтра подгружаются...</p>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-200">
                <th className="p-4 w-1/3">Классификатор (Геометрия Леонида)</th>
                <th className="p-4 text-center">Сток</th>
                <th className="p-4 text-center">Прогноз ИИ (30д)</th>
                <th className="p-4">AI Решение</th>
                <th className="p-4 text-center">Объем закупки</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, idx) => {
                // Строго берем оригинальные значения, пришедшие из Pydantic-модели бэкенда
                const stock = row.current_stock;
                const forecast = row.forecast_1m;
                const calculatedQty = Math.round(forecast - stock);

                return (
                  <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                    {/* Столбец 1: Название FMC-класса */}
                    <td className="p-4 font-semibold text-gray-800 break-all max-w-xs">
                      {row.class_name}
                    </td>
                    
                    {/* Столбец 2: Текущий Сток */}
                    <td className="p-4 text-center text-gray-600 font-medium">
                      {stock} шт
                    </td>
                    
                    {/* Столбец 3: Прогноз Prophet */}
                    <td className="p-4 text-center text-blue-600 font-bold">
                      {Math.round(forecast)} шт
                    </td>
                    
                    {/* Столбец 4: Текстовый статус-решение */}
                    <td className="p-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                        row.recommendation === "Заказать закупку" 
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                          : "bg-blue-50 text-blue-700 border border-blue-100"
                      }`}>
                        {row.recommendation}
                      </span>
                    </td>
                    
                    {/* Столбец 5: Необходимый объем закупки (Разница) */}
                    <td className="p-4 text-center font-bold">
                      {calculatedQty > 0 ? (
                        <span className="text-red-600">+{calculatedQty} шт</span>
                      ) : calculatedQty < 0 ? (
                        <span className="text-amber-600">{calculatedQty} шт</span>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Вывод графика ECharts под таблицей комбинированных классов */}
      {activeTab === 'combined' && rows.length > 0 && (
        <div className="p-4 border border-gray-100 rounded-xl bg-white shadow-sm">
          <ReactECharts option={getGraphOption()} />
        </div>
      )}
    </div>
  );
};