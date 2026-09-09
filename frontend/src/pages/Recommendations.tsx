import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { IRecommendationsResponse, IRecItem } from '../types';

export const Recommendations: React.FC<{ salonId: number }> = ({ salonId }) => {
  const [data, setData] = useState<IRecommendationsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'mode' | 'anatomy' | 'combined'>('mode');

  useEffect(() => {
    // setLoading(true);
    // setError(null);
    
    fetch(`http://localhost:8000/api/recommendations/${salonId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Ошибка сервера: статус ${res.status}`);
        return res.json();
      })
      .then((apiData) => {
        setData(apiData);
        // setLoading(false);
      })
      .catch((err) => {
        // setError(err.message);
        // setLoading(false);
        return
      });
  }, [salonId]); // Слушаем изменение числового salonId

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
      xAxis: { 
        type: 'category', 
        data: rows.map(r => r.class_name || 'Класс') 
      },
      yAxis: { type: 'value' },
      series: [
        { 
          name: 'Текущий сток', 
          type: 'bar', 
          data: rows.map(r => r.current_stock) 
        },
        { 
          name: 'Прогноз Prophet', 
          type: 'line', 
          data: rows.map(r => r.forecast_1m) 
        }
      ]
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex border-b border-gray-200 gap-4">
        <button onClick={() => setActiveTab('mode')} className={`pb-2 font-bold text-sm ${activeTab === 'mode' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}>По Моде</button>
        <button onClick={() => setActiveTab('anatomy')} className={`pb-2 font-bold text-sm ${activeTab === 'anatomy' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}>По Анатомии</button>
        <button onClick={() => setActiveTab('combined')} className={`pb-2 font-bold text-sm ${activeTab === 'combined' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400'}`}>Комбинированные</button>
      </div>

      <table className="w-full text-left text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold border-b">
            <th className="p-3">Классификатор</th>
            <th className="p-3 text-center">Сток</th>
            <th className="p-3 text-center">Прогноз</th>
            <th className="p-3">AI Решение</th>
            <th className="p-3 text-center">Объем</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {getActiveRows().map((row, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="p-3 text-center font-bold">
                {row.forecast_1m - row.current_stock > 0 ? (
                  <span className="text-red-600">+{Math.round(row.forecast_1m - row.current_stock)} шт</span>
                ) : row.forecast_1m - row.current_stock < 0 ? (
                  <span className="text-amber-600">{Math.round(row.forecast_1m - row.current_stock)} шт</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {activeTab === 'combined' && (
        <div className="p-4 border border-gray-100 rounded-xl mt-6">
          <ReactECharts option={getGraphOption()} />
        </div>
      )}
    </div>
  );
};
