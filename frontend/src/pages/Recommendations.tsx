import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Loader2, AlertCircle, Package, TrendingUp, ShoppingCart, Cpu } from 'lucide-react';
import type { IRecommendationsResponse, IRecItem } from '../types';

export const Recommendations: React.FC<{ salonId: number, category: string }> = ({ salonId, category  }) => {
  const [data, setData] = useState<IRecommendationsResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'mode' | 'anatomy' | 'combined'>('mode');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Следим за шириной экрана для графиков
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const backendUrl = import.meta.env.VITE_API_URL || '';

    fetch(`${backendUrl}/api/recommendations/${salonId}?category=${category}`)
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
  }, [salonId, category]);

  const getActiveRows = (): IRecItem[] => {
    if (!data) return [];
    if (activeTab === 'mode') return data.style || [];
    if (activeTab === 'anatomy') return data.size || [];
    return data.combined || [];
  };

  const getGraphOption = () => {
    const rows = data?.combined || [];
    return {
      title: { text: 'Спрос vs Сток по классам ФМЦ', left: 'center', textStyle: { fontSize: 12 } },
      tooltip: { trigger: 'axis', confine: true },
      legend: { bottom: 0, type: 'scroll', textStyle: { fontSize: 10 } },
      grid: { left: '3%', right: '4%', bottom: isMobile ? 70 : 40, containLabel: true },
      xAxis: { 
        type: 'category', 
        data: rows.map(r => r.class_name || 'Класс'),
        axisLabel: {
          fontSize: isMobile ? 8 : 10,
          rotate: isMobile ? 45 : 0,
          interval: 'auto'
        }
      },
      yAxis: { type: 'value' },
      series: [
        { name: 'Текущий сток', type: 'bar', data: rows.map(r => r.current_stock || 0), itemStyle: { color: '#323232' } },
        { name: 'Прогноз Prophet', type: 'line', data: rows.map(r => r.forecast_1m || 0), itemStyle: { color: '#cb1b24' }, lineStyle: { width: 3 } }
      ]
    };
  };

  if (loading) return <div className="p-6 sm:p-12 flex justify-center items-center gap-2 text-gray-500 min-h-[200px] text-sm"><Loader2 className="w-5 h-5 animate-spin text-optic-red" /> Загрузка матриц Prophet из ClickHouse...</div>;
  if (error) return <div className="p-4 sm:p-6 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">❌ Не удалось связаться с API: {error}</div>;

  const rows = getActiveRows();

  return (
    <div className="space-y-6">
      {/* Навигационные табы с горизонтальным скроллом для мобильных */}
      <div className="flex border-b border-gray-200 gap-4 overflow-x-auto no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <button onClick={() => setActiveTab('mode')} className={`pb-2 font-bold text-sm transition-colors whitespace-nowrap focus:outline-none ${activeTab === 'mode' ? 'border-b-2 border-optic-red text-optic-red' : 'text-gray-400 hover:text-gray-600'}`}>По Моде</button>
        <button onClick={() => setActiveTab('anatomy')} className={`pb-2 font-bold text-sm transition-colors whitespace-nowrap focus:outline-none ${activeTab === 'anatomy' ? 'border-b-2 border-optic-red text-optic-red' : 'text-gray-400 hover:text-gray-600'}`}>По Анатомии</button>
        <button onClick={() => setActiveTab('combined')} className={`pb-2 font-bold text-sm transition-colors whitespace-nowrap focus:outline-none ${activeTab === 'combined' ? 'border-b-2 border-optic-red text-optic-red' : 'text-gray-400 hover:text-gray-600'}`}>Комбинированные</button>
      </div>

      {rows.length === 0 ? (
        <div className="p-8 border border-dashed border-gray-200 rounded-xl flex flex-col justify-center items-center text-center bg-gray-50 text-gray-500">
          <AlertCircle className="w-6 h-6 text-amber-500 mb-2" />
          <h4 className="font-bold text-sm text-gray-700">Нет данных для этого сочетания</h4>
          <p className="text-xs mt-1">Данные для выбранного фильтра подгружаются...</p>
        </div>
      ) : (
        <>
          {/* ДЕСКТОПНЫЙ ВАРИАНТ: Показывается от md брейкпоинта */}
          <div className="hidden md:block bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold border-b border-gray-200 tracking-wider">
                  <th className="p-4 w-1/3">Классификатор</th>
                  <th className="p-4 text-center">Сток</th>
                  <th className="p-4 text-center">Прогноз ИИ (30д)</th>
                  <th className="p-4">AI Решение</th>
                  <th className="p-4 text-center">Объем закупки</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row, idx) => {
                  const stock = row.current_stock;
                  const forecast = row.forecast_1m;
                  const calculatedQty = Math.round(forecast - stock);

                  return (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-colors">
                      <td className="p-4 font-semibold text-gray-800 break-all max-w-xs">{row.class_name}</td>
                      <td className="p-4 text-center text-gray-600 font-medium">{stock} шт</td>
                      <td className="p-4 text-center text-optic-red font-bold">{Math.round(forecast)} шт</td>
                      <td className="p-4">
                        <span 
                        className="px-2.5 py-1 text-xs font-semibold rounded-full bg-optic-red/5 text-optic-red border border-optic-red/10"
                        style={{color: '#0038a8'}}>
                          {row.recommendation}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold">
                        {calculatedQty > 0 ? (
                            <span 
                            style={{color: '#3e8a27'}}>
                              +{calculatedQty} шт
                            </span>
                          ) : calculatedQty < 0 ? (
                            <span
                            style={{color: '#cb1b24'}}>
                              {calculatedQty} шт
                            </span>
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

          {/* МОБИЛЬНЫЙ ВАРИАНТ: Карточки вместо таблицы (экран < md) */}
          <div className="block md:hidden space-y-4">
            {rows.map((row, idx) => {
              const stock = row.current_stock;
              const forecast = row.forecast_1m;
              const calculatedQty = Math.round(forecast - stock);

              return (
                <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="border-b border-gray-100 pb-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5">Классификатор</span>
                    <div className="text-sm font-bold text-gray-900 break-words">{row.class_name}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2">
                      <Package className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <div>
                        <span className="text-[10px] block text-gray-400 uppercase">Текущий Сток</span>
                        <span className="font-semibold text-gray-700">{stock} шт</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-2 rounded-lg flex items-center gap-2">
                      <TrendingUp className="w-3.5 h-3.5 text-optic-red flex-shrink-0" />
                      <div>
                        <span className="text-[10px] block text-gray-400 uppercase">Прогноз ИИ</span>
                        <span className="font-bold text-optic-red">{Math.round(forecast)} шт</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-1">
                    <div className="flex-1 bg-gray-50 p-2.5 rounded-lg flex items-start gap-2">
                      <Cpu className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-[10px] block font-bold text-gray-400 uppercase tracking-wide">AI Решение</span>
                        <p 
                          className="text-xs font-semibold text-gray-700 mt-0.5"
                          style={{color: '#0038a8'}}>
                            {row.recommendation}
                        </p>
                      </div>
                    </div>

                    <div className="sm:w-1/3 bg-gray-50 p-2.5 rounded-lg flex items-start gap-2">
                      <ShoppingCart className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <span className="text-[10px] block font-bold text-gray-400 uppercase tracking-wide">Закупка</span>
                        <div className="text-xs font-extrabold mt-0.5">
                          {calculatedQty > 0 ? (
                            <span 
                            style={{color: '#3e8a27'}}>
                              +{calculatedQty} шт
                            </span>
                          ) : calculatedQty < 0 ? (
                            <span
                            style={{color: '#cb1b24'}}>
                              {calculatedQty} шт
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* График ECharts под таблицей комбинированных классов */}
      {activeTab === 'combined' && rows.length > 0 && (
        <div className="p-2 sm:p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
          <ReactECharts option={getGraphOption()} style={{ height: isMobile ? '300px' : '360px', width: '100%' }} />
        </div>
      )}
    </div>
  );
};