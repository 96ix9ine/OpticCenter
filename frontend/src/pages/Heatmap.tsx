import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Loader2 } from 'lucide-react';
import type { IHeatmapData } from '../types';

export const Heatmap: React.FC<{ salonId: number; category: string }> = ({ salonId, category }) =>  {
  const [matrix, setMatrix] = useState<IHeatmapData[]>([]);
  const [viewType, setViewType] = useState<'sales' | 'stock'>('sales');
  const [loading, setLoading] = useState<boolean>(true);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Отслеживаем ширину экрана для динамической конфигурации зума матрицы
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
      <div className="p-6 sm:p-12 flex justify-center items-center gap-2 text-gray-500 min-h-[300px]">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="text-sm">Построение панорамы распределения матриц сети...</span>
      </div>
    );
  }

  const uniqueStyles = Array.from(new Set(matrix.map(m => m.style)));
  const uniqueSalons = Array.from(new Set(matrix.map(m => m.size)));

  const heatmapData = matrix.map(item => [
    uniqueStyles.indexOf(item.style),
    uniqueSalons.indexOf(item.size),
    viewType === 'sales' ? item.sales : item.stock
  ]);

  const maxVal = heatmapData.length > 0 ? Math.max(...heatmapData.map(d => Number(d[2]))) : 100;

  const option = {
    title: {
      text: isMobile ? 'Тепловая карта сети' : `Тепловая карта всей сети: Салоны × Классы стилей`,
      subtext: isMobile ? `Категория: ${category}` : '',
      left: 'center',
      textStyle: { fontSize: 13, color: '#111827', fontFamily: 'sans-serif' }
    },
    tooltip: {
      position: 'top',
      confine: true, // Защищает всплывающее окно от выхода за экраны смартфонов
      formatter: (params: any) => {
        const styleName = uniqueStyles[params.data[0]];
        const salonName = uniqueSalons[params.data[1]];
        const val = params.data[2];
        return `
          <div style="font-weight:bold; margin-bottom:4px; font-size:12px;">${salonName}</div>
          <div style="font-size:11px;">Класс: ${styleName}</div>
          <div style="font-size:11px; font-weight:bold; color:#3b82f6; margin-top:2px;">
            ${viewType === 'sales' ? 'Продажи' : 'Остатки'}: ${val} шт.
          </div>
        `;
      }
    },
    // Динамическая адаптация отступов сетки для мобильных устройств
    grid: { 
      height: isMobile ? '55%' : '65%', 
      top: isMobile ? '18%' : '15%', 
      bottom: isMobile ? '25%' : '20%', 
      left: isMobile ? '22%' : '15%', 
      right: '4%',
      containLabel: true 
    },
    xAxis: {
      type: 'category',
      data: uniqueStyles,
      splitArea: { show: true },
      axisLabel: {
        rotate: 45,
        fontSize: isMobile ? 8 : 10,
        interval: isMobile ? 'auto' : 0 // На мобилках автоматически скрываем пересекающиеся подписи
      }
    },
    yAxis: {
      type: 'category',
      data: uniqueSalons,
      splitArea: { show: true },
      axisLabel: { 
        fontSize: isMobile ? 9 : 11, 
        fontWeight: 'bold',
        width: isMobile ? 70 : 150, // Ограничиваем ширину названий салонов, чтобы не сжимать график
        overflow: 'truncate' // Если название слишком длинное, ставится троеточие
      }
    },
    // АКТИВИРОВАНО И АДАПТИРОВАНО: скролл и зум жестами на телефонах
    dataZoom: [
      { 
        type: 'inside', 
        xAxisIndex: 0, 
        start: 0, 
        end: isMobile ? 25 : 100 // На мобильных показываем сначала 25% матрицы, остальное доступно по свайпу
      }, 
      { 
        type: 'slider', 
        xAxisIndex: 0, 
        start: 0, 
        end: isMobile ? 25 : 100, 
        bottom: '2%',
        height: 15,
        textStyle: { fontSize: 9 }
      }
    ],
    visualMap: {
      min: 0,
      max: maxVal || 100,
      calculable: true,
      orient: 'horizontal',
      left: 'center',
      bottom: isMobile ? '8%' : '12%',
      itemWidth: isMobile ? 10 : 14,
      itemHeight: isMobile ? 120 : 200,
      textStyle: { fontSize: isMobile ? 9 : 11 },
      inRange: {
        color: ['#fff7bc', '#fec44f', '#d95f02', '#91003f']
      }
    },
    series: [{
      name: viewType === 'sales' ? 'Продажи (90д)' : 'Текущий сток',
      type: 'heatmap',
      data: heatmapData,
      label: { show: false }, 
      emphasis: {
        itemStyle: { shadowBlur: 10, shadowColor: 'rgba(0, 0, 0, 0.5)' }
      }
    }]
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex justify-between items-center bg-gray-50 p-2 sm:p-3 rounded-xl border border-gray-100">
        {/* Изменено: на мобильных кнопка растягивается на всю ширину для удобства тапа */}
        <div className="flex w-full sm:w-auto border border-gray-200 rounded-lg p-0.5 bg-gray-100 text-xs font-semibold shadow-sm">
          <button 
            onClick={() => setViewType('sales')} 
            className={`flex-1 sm:flex-none text-center px-3 sm:px-4 py-2 rounded-md transition-all ${viewType === 'sales' ? 'bg-white shadow-sm text-blue-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Продажи
          </button>
          <button 
            onClick={() => setViewType('stock')} 
            className={`flex-1 sm:flex-none text-center px-3 sm:px-4 py-2 rounded-md transition-all ${viewType === 'stock' ? 'bg-white shadow-sm text-red-600 font-bold' : 'text-gray-500 hover:text-gray-700'}`}
          >
            Остатки на полках
          </button>
        </div>
      </div>
      
      <div className="border border-gray-200 rounded-xl p-1 sm:p-4 bg-white shadow-sm overflow-x-hidden">
        <ReactECharts option={option} style={{ height: isMobile ? '420px' : '500px', width: '100%' }} />
      </div>
    </div>
  );
};
