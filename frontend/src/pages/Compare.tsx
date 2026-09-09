import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { ISalon, ICompareResponse } from '../types';

export const Compare: React.FC<{ defaultSalonId: number, salons: ISalon[]; category: string }> = ({ defaultSalonId, salons, category }) => {
  const [s1, setS1] = useState<number>(defaultSalonId);
  const [s2, setS2] = useState<number>(salons[1]?.id || 2);
  const [compareData, setCompareData] = useState<ICompareResponse | null>(null);

  useEffect(() => {
    fetch(`http://localhost:8000/api/compare?salon1=${s1}&salon2=${s2}&category=${category}`)
      .then(res => res.json())
      .then(setCompareData);
  }, [s1, s2, category]);

  const getOption = (type: 'mode' | 'anatomy') => {
    const list = type === 'mode' ? compareData?.style_comparison : compareData?.size_comparison;
    if (!list) return {};
    
    return {
      tooltip: { trigger: 'axis' },
      legend: { top: 10 },
      xAxis: { type: 'category', data: list.map((item: any) => item.name || item.class_name || 'Класс') },
      yAxis: { type: 'value' },
      series: [
        { 
          name: salons.find(s => s.id === s1)?.name || 'Точка 1', 
          type: 'bar', 
          data: list.map((item: any) => item.salon1_value || item.stock_s1 || 0), 
          itemStyle: { color: '#2563eb' } 
        },
        { 
          name: salons.find(s => s.id === s2)?.name || 'Точка 2', 
          type: 'bar', 
          data: list.map((item: any) => item.salon2_value || item.stock_s2 || 0), 
          itemStyle: { color: '#93c5fd' } 
        }
      ]
    };
  };


  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
        <div>
          <label className="block text-xs text-gray-400 font-bold mb-1 uppercase">Салон А</label>
          <select value={s1} onChange={(e) => setS1(Number(e.target.value))} className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm">
            {salons.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 font-bold mb-1 uppercase">Салон Б</label>
          <select value={s2} onChange={(e) => setS2(Number(e.target.value))} className="w-full bg-white border border-gray-300 rounded px-2 py-1.5 text-sm">
            {salons.map(s => <option key={s.id} value={s.id} disabled={s.id === s1}>{s.name}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border p-4 rounded-xl">
          <h3 className="text-sm font-bold text-gray-700 mb-4 text-center">Сравнение по структуре Моды</h3>
          <ReactECharts option={getOption('mode')} />
        </div>
        <div className="border p-4 rounded-xl">
          <h3 className="text-sm font-bold text-gray-700 mb-4 text-center">Сравнение по структуре Анатомии</h3>
          <ReactECharts option={getOption('anatomy')} />
        </div>
      </div>
    </div>
  );
};
