import React, { useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import { Sparkles, Home, Zap, Loader2 } from 'lucide-react';

interface IServerClusterData {
  salon_cluster_map: {
    [key: string]: {
      style: number;
      size: number;
      full: number;
    }
  }
}

export const Clusters: React.FC = () => {
  const [data, setData] = useState<IServerClusterData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeClusterType, setActiveTab] = useState<'style' | 'size' | 'full'>('full');
  const [isMobile, setIsMobile] = useState<boolean>(false);

  // Отслеживаем размер экрана для кастомизации ECharts опций
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

    fetch(`${backendUrl}/api/clusters`)
      .then(res => res.json())
      .then((apiData) => {
        setData(apiData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 sm:p-12 flex justify-center items-center gap-2 text-gray-500 min-h-[200px]">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span className="text-sm">Загрузка карты кластеризации KMeans...</span>
      </div>
    );
  }

  const premiumSalons: string[] = [];
  const budgetSalons: string[] = [];
  const activeSalons: string[] = [];

  if (data?.salon_cluster_map) {
    Object.entries(data.salon_cluster_map).forEach(([salonName, clusterMetrics]) => {
      const clusterIdx = clusterMetrics[activeClusterType];
      if (clusterIdx === 0) premiumSalons.push(salonName);
      else if (clusterIdx === 1) budgetSalons.push(salonName);
      else activeSalons.push(salonName);
    });
  }

  const premiumPoints = premiumSalons.map((name, idx) => [45 + idx * 8, 28000 + idx * 3000, name]);
  const budgetPoints = budgetSalons.map((name, idx) => [120 + idx * 10, 4200 + idx * 400, name]);
  const youthPoints = activeSalons.map((name, idx) => [70 + idx * 12, 13500 + idx * 1200, name]);

  const option = {
    title: {
      text: `Группировка: ${activeClusterType === 'style' ? 'По Моде' : activeClusterType === 'size' ? 'По Анатомии' : 'Полный ФМЦ'}`,
      left: 'center',
      top: 5,
      textStyle: { fontSize: 12, color: '#374151', fontFamily: 'sans-serif' }
    },
    legend: {
      data: ['Центр-Премиум', 'Спальный район-Бюджет', 'ТЦ-Молодёжный'],
      top: isMobile ? 25 : 30,
      itemGap: isMobile ? 8 : 10,
      textStyle: { fontSize: isMobile ? 10 : 12 }
    },
    // Динамические отступы для предотвращения обрезания подписей на смартфонах
    grid: { 
      left: isMobile ? '4%' : '3%', 
      right: isMobile ? '12%' : '7%', 
      bottom: '5%', 
      top: isMobile ? 85 : 65,
      containLabel: true 
    },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#111827',
      textStyle: { color: '#fff', fontSize: 12 },
      borderWidth: 0,
      confine: true, // Предотвращает выход тултипа за границы экрана смартфона
      formatter: (params: any) => {
        return `
          <div style="font-weight:bold; margin-bottom:4px;">${params.data[2]}</div>
          <div style="font-size:11px; opacity:0.8;">Группа: ${params.seriesName}</div>
        `;
      }
    },
    xAxis: {
      type: 'value',
      name: isMobile ? 'Оборачиваемость' : 'Индекс оборачиваемости',
      nameLocation: 'middle',
      nameGap: 25,
      nameTextStyle: { fontSize: 10, color: '#9ca3af' },
      splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } }
    },
    yAxis: {
      type: 'value',
      name: isMobile ? 'Чек (₽)' : 'Емкость чека (₽)',
      nameTextStyle: { fontSize: 10, color: '#9ca3af' },
      splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } }
    },
    series: [
      {
        name: 'Центр-Премиум',
        type: 'scatter',
        data: premiumPoints,
        symbolSize: isMobile ? 14 : 22, // Уменьшаем размер точек на мобильных
        itemStyle: { color: '#10b981', shadowBlur: 10, shadowColor: 'rgba(16, 185, 129, 0.3)' }
      },
      {
        name: 'Спальный район-Бюджет',
        type: 'scatter',
        data: budgetPoints,
        symbolSize: isMobile ? 14 : 22,
        itemStyle: { color: '#ef4444', shadowBlur: 10, shadowColor: 'rgba(239, 68, 68, 0.3)' }
      },
      {
        name: 'ТЦ-Молодёжный',
        type: 'scatter',
        data: youthPoints,
        symbolSize: isMobile ? 14 : 22,
        itemStyle: { color: '#3b82f6', shadowBlur: 10, shadowColor: 'rgba(59, 130, 246, 0.3)' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Изменено: flex-col на мобильных, flex-row на десктопах */}
      <div className="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Карта кластеризации сети</h2>
          <p className="text-sm text-gray-500 mt-0.5">Автоматическое распределение точек Челябинска на основе алгоритмов scikit-learn.</p>
        </div>
        
        {/* Изменено: кнопки теперь растягиваются (w-full) на мобилках */}
        <div className="flex w-full lg:w-auto border border-gray-200 rounded-lg p-0.5 bg-gray-100 text-xs font-medium shadow-sm">
          <button onClick={() => setActiveTab('full')} className={`flex-1 lg:flex-none text-center px-2.5 py-1.5 rounded-md transition-all ${activeClusterType === 'full' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>Комбинированный</button>
          <button onClick={() => setActiveTab('style')} className={`flex-1 lg:flex-none text-center px-2.5 py-1.5 rounded-md transition-all ${activeClusterType === 'style' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>По Моде</button>
          <button onClick={() => setActiveTab('size')} className={`flex-1 lg:flex-none text-center px-2.5 py-1.5 rounded-md transition-all ${activeClusterType === 'size' ? 'bg-white shadow-sm text-blue-600 font-semibold' : 'text-gray-500 hover:text-gray-700'}`}>По Анатомии</button>
        </div>
      </div>

      {/* Высота контейнера графика теперь слегка уменьшается на мобильных смартфонах для лучшего UX */}
      <div className="border border-gray-200 rounded-xl p-2 sm:p-4 bg-white shadow-sm">
        <ReactECharts option={option} style={{ height: isMobile ? '320px' : '380px', width: '100%' }} />
      </div>

      {/* Сетка карточек: на мобильных идет в 1 колонку, с md: брейкпоинта в 3 колонки */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-emerald-100 rounded-xl bg-emerald-50/50 flex flex-col">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-2">
            <Sparkles className="w-4 h-4 flex-shrink-0" /> 
            <span>Центр-Премиум ({premiumSalons.length})</span>
          </div>
          <div className="text-xs text-emerald-700 space-y-1.5 flex-1">
            <p className="font-semibold mb-1 opacity-90">Салоны группы:</p>
            {premiumSalons.length > 0 ? (
              premiumSalons.map(name => <div key={name} className="bg-white/80 p-2 rounded border border-emerald-100/50 shadow-sm break-words">{name}</div>)
            ) : (
              <p className="text-gray-400 italic">Нет салонов в группе</p>
            )}
          </div>
        </div>

        <div className="p-4 border border-rose-100 rounded-xl bg-rose-50/50 flex flex-col">
          <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm mb-2">
            <Home className="w-4 h-4 flex-shrink-0" /> 
            <span>Спальный район-Бюджет ({budgetSalons.length})</span>
          </div>
          <div className="text-xs text-rose-700 space-y-1.5 flex-1">
            <p className="font-semibold mb-1 opacity-90">Салоны группы:</p>
            {budgetSalons.length > 0 ? (
              budgetSalons.map(name => <div key={name} className="bg-white/80 p-2 rounded border border-rose-100/50 shadow-sm break-words">{name}</div>)
            ) : (
              <p className="text-gray-400 italic">Нет салонов в группе</p>
            )}
          </div>
        </div>

        <div className="p-4 border border-blue-100 rounded-xl bg-blue-50/50 flex flex-col">
          <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm mb-2">
            <Zap className="w-4 h-4 flex-shrink-0" /> 
            <span>ТЦ-Молодёжный ({activeSalons.length})</span>
          </div>
          <div className="text-xs text-blue-700 space-y-1.5 flex-1">
            <p className="font-semibold mb-1 opacity-90">Салоны группы:</p>
            {activeSalons.length > 0 ? (
              activeSalons.map(name => <div key={name} className="bg-white/80 p-2 rounded border border-blue-100/50 shadow-sm break-words">{name}</div>)
            ) : (
              <p className="text-gray-400 italic">Нет салонов в группе</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
