import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Loader2, Grid } from 'lucide-react';
import type { IHeatmapData } from '../types';

export const Heatmap: React.FC<{ salonId: number; category: string }> = ({ salonId, category }) =>  {
  const [matrix, setMatrix] = useState<IHeatmapData[]>([]);
  const [viewType, setViewType] = useState<'sales' | 'stock'>('sales');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);

    const backendUrl = import.meta.env.VITE_API_URL || '';

    fetch(`${backendUrl}/api/heatmap/${salonId}?category=${category}`)
      .then(res => res.json())
      .then((data) => {
        setMatrix(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [salonId, category]);

  if (loading) {
    return (
      <div className="p-12 flex justify-center items-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span>Построение панорамы распределения матриц сети...</span>
      </div>
    );
  }

  // Выделяем уникальные оси Х (Стили) и Y (Салоны Челябинска) строго из выгрузки 
  const uniqueStyles = Array.from(new Set(matrix.map(m => m.style)));
  const uniqueSalons = Array.from(new Set(matrix.map(m => m.size))); // В поле size бэк теперь шлет салоны

  const heatmapData = matrix.map(item => [
    uniqueStyles.indexOf(item.style),
    uniqueSalons.indexOf(item.size),
    viewType === 'sales' ? item.sales : item.stock
  ]);

  // Находим максимальное значение для красивого градиента шкалы
  const maxVal = heatmapData.length > 0 ? Math.max(...heatmapData.map(d => Number(d[2]))) : 100;

  const option = {
    title: {
      text: `Тепловая карта всей сети: Салоны × Классы стилей (${category})`,
      left: 'center',
      textStyle: { fontSize: 13, color: '#111827', fontFamily: 'sans-serif' }
    },
    tooltip: {
      position: 'top',
      formatter: (params: any) => {
        const styleName = uniqueStyles[params.data[0]];
        const salonName = uniqueSalons[params.data[1]];
        const val = params.data[2];
        return `
          <div style="font-weight:bold; margin-bottom:4px;">${salonName}</div>
          <div style="font-size:11px;">Класс: ${styleName}</div>
          <div style="font-size:11px; font-weight:bold; color:#3b82f6;">
            ${viewType === 'sales' ? 'Продажи' : 'Остатки'}: ${val} шт.
          </div>
        `;
      }
    },
    grid: { height: '65%', top: '15%', bottom: '20%', left: '15%', right: '5%' },
    xAxis: {
      type: 'category',
      data: uniqueStyles,
      splitArea: { show: true },
      axisLabel: {
        rotate: 45,
        fontSize: 9,
        interval: 0 // Показываем абсолютно все 100+ стилей 
      }
    },
    yAxis: {
      type: 'category',
      data: uniqueSalons,
      splitArea: { show: true },
      axisLabel: { fontSize: 11, fontWeight: 'bold' }
    },
    // dataZoom: [
    //   { type: 'inside', xAxisIndex: 0, start: 0, end: 30 }, // Позволяет зумить и скроллить карту мышкой!
    //   { type: 'slider', xAxisIndex: 0, start: 0, end: 30, bottom: '5%' }
    // ],
    visualMap: {
      min: 0,
      max: maxVal || 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: '12%',
      inRange: {
        // Подставляем фирменные цвета графиков  (от желтого к темно-бордовому)
        color: ['#fff7bc', '#fec44f', '#d95f02', '#91003f']
      }
    },
    series: [{
      name: viewType === 'sales' ? 'Продажи (90д)' : 'Текущий сток',
      type: 'heatmap',
      data: heatmapData,
      label: { show: false }, // Выключаем цифры внутри ячеек, чтобы не было каши при 100+ стилях
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
      }
    }]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-100 text-xs font-semibold">
          <button onClick={() => setViewType('sales')} className={`px-4 py-1.5 rounded-md transition-all ${viewType === 'sales' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}>Продажи (Шкала )</button>
          <button onClick={() => setViewType('stock')} className={`px-4 py-1.5 rounded-md transition-all ${viewType === 'stock' ? 'bg-white shadow-sm text-red-600' : 'text-gray-500 hover:text-gray-700'}`}>Остатки на полках</button>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <ReactECharts option={option} style={{ height: '500px', width: '100%' }} />
      </div>
    </div>
  );
};