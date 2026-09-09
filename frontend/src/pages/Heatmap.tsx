import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import type { IHeatmapData } from '../types';

export const Heatmap: React.FC<{ salonId: number }> = ({ salonId }) => {
  const [matrix, setMatrix] = useState<IHeatmapData[]>([]);
  const [viewType, setViewType] = useState<'sales' | 'stock'>('sales');

  useEffect(() => {
    fetch(`http://localhost:8000/api/heatmap/${salonId}`)
      .then(res => res.json())
      .then(setMatrix);
  }, [salonId]);

  const uniqueModes = Array.from(new Set(matrix.map(m => m.style)));
  const uniqueAnatomies = Array.from(new Set(matrix.map(m => m.size)));

  // Формируем координаты ячеек [X, Y, Значение] под Apache ECharts Heatmap
  const heatmapData = matrix.map(item => [
    uniqueModes.indexOf(item.style),
    uniqueAnatomies.indexOf(item.size),
    viewType === 'sales' ? item.sales : item.stock
  ]);

  const option = {
    tooltip: { position: 'top' },
    grid: { height: '70%', top: '10%' },
    xAxis: { type: 'category', data: uniqueModes, splitArea: { show: true } },
    yAxis: { type: 'category', data: uniqueAnatomies, splitArea: { show: true } },
    visualMap: {
      min: 0,
      max: viewType === 'sales' ? 150 : 50,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '0%',
      inRange: { color: viewType === 'sales' ? ['#eff6ff', '#2563eb'] : ['#fef2f2', '#dc2626'] }
    },
    series: [{
      name: viewType === 'sales' ? 'Продажи (шт)' : 'Остатки (шт)',
      type: 'heatmap',
      data: heatmapData,
      label: { show: true },
      emphasis: { itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' } }
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Тепловая карта матриц</h2>
        <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-100 text-xs">
          <button onClick={() => setViewType('sales')} className={`px-3 py-1.5 rounded-md font-medium ${viewType === 'sales' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Продажи</button>
          <button onClick={() => setViewType('stock')} className={`px-3 py-1.5 rounded-md font-medium ${viewType === 'stock' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500'}`}>Остатки</button>
        </div>
      </div>
      <ReactECharts option={option} style={{ height: '400px' }} />
    </div>
  );
};
