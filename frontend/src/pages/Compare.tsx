import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ISalon, ICompareResponse } from '../types';

export const Compare: React.FC<{ defaultSalonId: number, salons: ISalon[]; category: string }> = ({ defaultSalonId, salons, category }) => {
  const [s1, setS1] = useState<number>(defaultSalonId);
  const [s2, setS2] = useState<number>(salons[1]?.id || 2);
  const [compareData, setCompareData] = useState<ICompareResponse | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Отслеживаем ширину экрана для адаптации легенды и шрифтов ECharts
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

    fetch(`${backendUrl}/api/compare?salon1=${s1}&salon2=${s2}&category=${category}`)
      .then(res => res.json())
      .then(setCompareData);
  }, [s1, s2, category]);

  const getOption = (type: 'mode' | 'anatomy') => {
    const list = type === 'mode' ? compareData?.style_comparison : compareData?.size_comparison;
    if (!list) return {};
    
    const salon1Name = salons.find(s => s.id === s1)?.name || 'Точка 1';
    const salon2Name = salons.find(s => s.id === s2)?.name || 'Точка 2';

    return {
      tooltip: { 
        trigger: 'axis',
        confine: true // Предотвращает выход всплывающего окна за границы смартфона
      },
      legend: { 
        bottom: 0, // Переносим легенду вниз, чтобы длинные названия салонов не мешали графику
        top: 'auto',
        left: 'center',
        type: 'scroll', // Если названия не влезут, появится горизонтальная прокрутка легенды
        textStyle: { fontSize: isMobile ? 10 : 12 }
      },
      // Увеличиваем отступ снизу под легенду и включаем авто-расчет границ
      grid: { 
        left: '3%', 
        right: '4%', 
        bottom: isMobile ? 65 : 50, 
        top: 25, 
        containLabel: true 
      },
      xAxis: { 
        type: 'category', 
        data: list.map((item: any) => item.name || item.class_name || 'Класс'),
        axisLabel: {
          fontSize: isMobile ? 9 : 11,
          interval: 0,
          rotate: isMobile ? 30 : 0 // На мобильных наклоняем текст осей, чтобы не накладывался
        }
      },
      yAxis: { 
        type: 'value',
        axisLabel: { fontSize: isMobile ? 10 : 12 }
      },
      series: [
        { 
          name: salon1Name, 
          type: 'bar', 
          data: list.map((item: any) => item.salon1_value || item.stock_s1 || 0), 
          itemStyle: { color: '#cb1b24' }
        },
        { 
          name: salon2Name, 
          type: 'bar', 
          data: list.map((item: any) => item.salon2_value || item.stock_s2 || 0), 
          itemStyle: { color: '#323232' }
        }
      ]
    };
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-optic-gray/25 p-4 rounded-xl border border-gray-200">
        <div>
          <label className="block text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">Салон А</label>
          <select 
            value={s1} 
            onChange={(e) => setS1(Number(e.target.value))} 
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-optic-red cursor-pointer transition-colors"
          >
            {salons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 font-bold mb-1 uppercase tracking-wider">Салон Б</label>
          <select 
            value={s2} 
            onChange={(e) => setS2(Number(e.target.value))} 
            className="w-full bg-white border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-optic-red cursor-pointer transition-colors"
          >
            {salons.map(s => <option key={s.id} value={s.id} disabled={s.id === s1}>{s.name}</option>)}
          </select>
        </div>
      </div>

      {/* Сетка графиков: на мобильных друг под друга, на lg — в 2 колонки */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-100 p-3 sm:p-4 rounded-xl bg-white shadow-sm">
          <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-3 text-center uppercase tracking-wide">Сравнение по структуре Моды</h3>
          <ReactECharts option={getOption('mode')} style={{ height: isMobile ? '280px' : '340px', width: '100%' }} />
        </div>
        <div className="border border-gray-100 p-3 sm:p-4 rounded-xl bg-white shadow-sm">
          <h3 className="text-xs sm:text-sm font-bold text-gray-700 mb-3 text-center uppercase tracking-wide">Сравнение по структуре Анатомии</h3>
          <ReactECharts option={getOption('anatomy')} style={{ height: isMobile ? '280px' : '340px', width: '100%' }} />
        </div>
      </div>
    </div>
  );
};
