import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { IForecastData } from '../types';

export const Dynamics: React.FC<{ salonId: number, category: string }> = ({ salonId, category }) => {
  const [classifierType, setClassifierType] = useState<'style' | 'size' | 'full'>('style');
  const [classValue, setClassValue] = useState<string>('бабочка');
  const [forecast, setForecast] = useState<IForecastData[]>([]);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Отслеживаем ширину экрана для адаптации графиков
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || '';
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
    tooltip: { 
      trigger: 'axis',
      confine: true // Не дает тултипу выходить за края экрана смартфона
    },
    legend: { 
      data: ['Прогноз Prophet', 'Верхняя граница', 'Нижняя граница'],
      bottom: 0, // Переносим легенду вниз
      top: 'auto',
      type: 'scroll', // Скролл легенды на мобильных устройствах
      textStyle: { fontSize: isMobile ? 10 : 12 }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: isMobile ? 70 : 50, // Даем больше места снизу под наклоненные даты и легенду
      top: 20,
      containLabel: true
    },
    xAxis: { 
      type: 'category', 
      data: forecast.map(f => f.ds),
      axisLabel: {
        fontSize: isMobile ? 9 : 11,
        rotate: isMobile ? 45 : 0, // Поворачиваем даты на мобилках, чтобы не слипались
        interval: 'auto' // Автоматически скрывает лишние даты, если их много
      }
    },
    yAxis: { 
      type: 'value',
      axisLabel: { fontSize: isMobile ? 10 : 12 }
    },
    series: [
      { name: 'Прогноз Prophet', type: 'line', data: forecast.map(f => f.yhat), smooth: true, itemStyle: { color: '#cb1b24' } },
      { name: 'Верхняя граница', type: 'line', data: forecast.map(f => f.yhat_upper), smooth: true, lineStyle: { type: 'dashed', opacity: 0.4 }, itemStyle: { color: '#323232' } },
      { name: 'Нижняя граница', type: 'line', data: forecast.map(f => f.yhat_lower), smooth: true, lineStyle: { type: 'dashed', opacity: 0.4 }, itemStyle: { color: '#323232' } }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Селекторы */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Классификатор</label>
          <select 
            value={classifierType} 
            onChange={(e) => { 
              const val = e.target.value as any;
              setClassifierType(val); 
              setClassValue(val === 'style' ? 'бабочка' : val === 'size' ? '140' : 'бабочка_металл_черный/золотой_M_L_M'); 
            }} 
            className="w-full bg-white border border-gray-300 text-sm rounded-lg p-2.5 focus:outline-none focus:border-optic-red cursor-pointer transition-colors"
          >
            <option value="style">Мода (Style)</option>
            <option value="size">Анатомия (Size)</option>
            <option value="full">Комбинированный (Full FMC)</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Значение класса</label>
          <select 
            value={classValue} 
            onChange={(e) => setClassValue(e.target.value)} 
            className="w-full bg-white border border-gray-300 text-sm rounded-lg p-2.5 focus:outline-none focus:border-optic-red cursor-pointer truncate transition-colors"
          >
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

      <div className="border border-gray-200 p-2 sm:p-4 rounded-xl bg-white shadow-sm">
        <ReactECharts option={option} style={{ height: isMobile ? '300px' : '380px', width: '100%' }} />
      </div>
    </div>
  );
};
