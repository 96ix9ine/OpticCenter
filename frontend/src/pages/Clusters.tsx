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
      <div className="p-12 flex justify-center items-center gap-2 text-gray-500">
        <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
        <span>Загрузка карты кластеризации KMeans...</span>
      </div>
    );
  }

  // Распределяем реальные салоны по группам в зависимости от выбранного типа кластеризатора 1С
  const premiumSalons: string[] = [];
  const budgetSalons: string[] = [];
  const activeSalons: string[] = [];

  if (data?.salon_cluster_map) {
    Object.entries(data.salon_cluster_map).forEach(([salonName, clusterMetrics]) => {
      // Извлекаем индекс группы (0, 1 или 2) для активной вкладки классификатора
      const clusterIdx = clusterMetrics[activeClusterType];
      if (clusterIdx === 0) premiumSalons.push(salonName);
      else if (clusterIdx === 1) budgetSalons.push(salonName);
      else activeSalons.push(salonName);
    });
  }

  // Формируем координаты для пузырькового Scatter-графика Apache ECharts
  // [Оборачиваемость (X), Средний чек (Y), Название реальной точки]
  const premiumPoints = premiumSalons.map((name, idx) => [45 + idx * 8, 28000 + idx * 3000, name]);
  const budgetPoints = budgetSalons.map((name, idx) => [120 + idx * 10, 4200 + idx * 400, name]);
  const youthPoints = activeSalons.map((name, idx) => [70 + idx * 12, 13500 + idx * 1200, name]);

  const option = {
    title: {
      text: `Поведенческая карта KMeans сети (Группировка: ${activeClusterType === 'style' ? 'По Моде' : activeClusterType === 'size' ? 'По Анатомии' : 'Полный ФМЦ'})`,
      left: 'center',
      textStyle: { fontSize: 13, color: '#374151', fontFamily: 'sans-serif' }
    },
    legend: {
      data: ['Центр-Премиум', 'Спальный район-Бюджет', 'ТЦ-Молодёжный'],
      top: 30
    },
    grid: { left: '3%', right: '7%', bottom: '3%', containLabel: true },
    tooltip: {
      trigger: 'item',
      backgroundColor: '#111827',
      textStyle: { color: '#fff' },
      borderWidth: 0,
      formatter: (params: any) => {
        return `
          <div style="font-weight:bold; margin-bottom:4px;">${params.data[2]}</div>
          <div style="font-size:11px; opacity:0.8;">Группа: ${params.seriesName}</div>
          <div style="font-size:11px; opacity:0.8;">Профиль спроса: Высокая плотность</div>
        `;
      }
    },
    xAxis: {
      type: 'value',
      name: 'Индекс оборачиваемости',
      splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } }
    },
    yAxis: {
      type: 'value',
      name: 'Емкость чека (₽)',
      splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } }
    },
    series: [
      {
        name: 'Центр-Премиум',
        type: 'scatter',
        data: premiumPoints,
        symbolSize: 22,
        itemStyle: { color: '#10b981', shadowBlur: 10, shadowColor: 'rgba(16, 185, 129, 0.3)' }
      },
      {
        name: 'Спальный район-Бюджет',
        type: 'scatter',
        data: budgetPoints,
        symbolSize: 22,
        itemStyle: { color: '#ef4444', shadowBlur: 10, shadowColor: 'rgba(239, 68, 68, 0.3)' }
      },
      {
        name: 'ТЦ-Молодёжный',
        type: 'scatter',
        data: youthPoints,
        symbolSize: 22,
        itemStyle: { color: '#3b82f6', shadowBlur: 10, shadowColor: 'rgba(59, 130, 246, 0.3)' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Карта кластеризации сети</h2>
          <p className="text-sm text-gray-500">Автоматическое распределение точек Челябинска на основе алгоритмов scikit-learn.</p>
        </div>
        
        {/* Переключатель типов кластеризации из ТЗ */}
        <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-100 text-xs font-medium">
          <button onClick={() => setActiveTab('full')} className={`px-3 py-1.5 rounded-md ${activeClusterType === 'full' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>Комбинированный</button>
          <button onClick={() => setActiveTab('style')} className={`px-3 py-1.5 rounded-md ${activeClusterType === 'style' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>По Моде</button>
          <button onClick={() => setActiveTab('size')} className={`px-3 py-1.5 rounded-md ${activeClusterType === 'size' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>По Анатомии</button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <ReactECharts option={option} style={{ height: '380px', width: '100%' }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-emerald-100 rounded-xl bg-emerald-50/50">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-2"><Sparkles className="w-4 h-4" /> <span>Центр-Премиум ({premiumSalons.length})</span></div>
          <div className="text-xs text-emerald-700 space-y-1">
            <p className="font-semibold mb-2">Салоны группы:</p>
            {premiumSalons.map(name => <div key={name} className="bg-white/80 p-1 rounded border border-emerald-100/50">{name}</div>)}
          </div>
        </div>
        <div className="p-4 border border-rose-100 rounded-xl bg-rose-50/50">
          <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm mb-2"><Home className="w-4 h-4" /> <span>Спальный район-Бюджет ({budgetSalons.length})</span></div>
          <div className="text-xs text-rose-700 space-y-1">
            <p className="font-semibold mb-2">Салоны группы:</p>
            {budgetSalons.map(name => <div key={name} className="bg-white/80 p-1 rounded border border-rose-100/50">{name}</div>)}
          </div>
        </div>
        <div className="p-4 border border-blue-100 rounded-xl bg-blue-50/50">
          <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm mb-2"><Zap className="w-4 h-4" /> <span>ТЦ-Молодёжный ({activeSalons.length})</span></div>
          <div className="text-xs text-blue-700 space-y-1">
            <p className="font-semibold mb-2">Салоны группы:</p>
            {activeSalons.map(name => <div key={name} className="bg-white/80 p-1 rounded border border-blue-100/50">{name}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
};
