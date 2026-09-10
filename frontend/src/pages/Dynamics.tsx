import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { IForecastData } from '../types';

export const Dynamics: React.FC<{ salonId: number, category: string }> = ({ salonId, category }) => {
  const [classifierType, setClassifierType] = useState<'style' | 'size' | 'full'>('style');
  const [classValue, setClassValue] = useState<string>('квадратная');
  const [forecast, setForecast] = useState<IForecastData[]>([]);

  useEffect(() => {

    const backendUrl = window.location.hostname === 'localhost' ? 'http://localhost:8000' : `https://${window.location.hostname}:8000`;

    const url = `${backendUrl}/api/forecast/${salonId}/${classifierType}?class_value=${encodeURIComponent(classValue)}&category=${category}`;
    
    fetch(url)
      .then(res => {
        if (!res.ok) throw new Error(`Ошибка: ${res.status}`);
        return res.json();
      })
      .then(setForecast)
      .catch(err => console.error("Ошибка загрузки таймсерии Prophet:", err));
  }, [salonId, classifierType, classValue, category]);

  const option = {
    tooltip: { trigger: 'axis' },
    legend: { data: ['Прогноз Prophet', 'Верхняя граница', 'Нижняя граница'] },
    xAxis: { type: 'category', data: forecast.map(f => f.ds) },
    yAxis: { type: 'value' },
    series: [
      { name: 'Прогноз Prophet', type: 'line', data: forecast.map(f => f.yhat), smooth: true, itemStyle: { color: '#2563eb' } },
      { name: 'Верхняя граница', type: 'line', data: forecast.map(f => f.yhat_upper), smooth: true, lineStyle: { type: 'dashed', opacity: 0.5 }, itemStyle: { color: '#93c5fd' } },
      { name: 'Нижняя граница', type: 'line', data: forecast.map(f => f.yhat_lower), smooth: true, lineStyle: { type: 'dashed', opacity: 0.5 }, itemStyle: { color: '#93c5fd' } }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 max-w-xl">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Классификатор</label>
          <select value={classifierType} onChange={(e) => { setClassifierType(e.target.value as any); setClassValue(e.target.value === 'style' ? 'квадратная' : e.target.value === 'size' ? '140' : 'квадратная_пластик_черный'); }} className="w-full bg-white border text-sm rounded p-2">
            <option value="style">Мода (Style)</option>
            <option value="size">Анатомия (Size)</option>
            <option value="full">Комбинированный (Full FMC)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1 uppercase">Значение класса</label>
          <select 
            value={classValue} 
            onChange={(e) => setClassValue(e.target.value)} 
            className="w-full bg-white border text-sm rounded p-2 focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {/* ИСПРАВЛЕНО: Подставляем боевые формы и размерные сетки Леонида из файлов динамики спроса */}
            {classifierType === 'style' && (
              ['бабочка', 'прямоугольная', 'круглая', 'овальная'].map(v => <option key={v} value={v}>{v}</option>)
            )}
            {classifierType === 'size' && (
              ['M_L_M', 'S_M_S', '140', '145'].map(v => <option key={v} value={v}>{v}</option>)
            )}
            {classifierType === 'full' && (
              ['бабочка_металл_черный/золотой_M_L_M', 'прямоугольная_пластик_черный_M_L_M'].map(v => <option key={v} value={v}>{v}</option>)
            )}
          </select>
        </div>
      </div>

      <div className="border p-4 rounded-xl bg-white shadow-sm">
        <ReactECharts option={option} style={{ height: '380px' }} />
      </div>
    </div>
  );
};