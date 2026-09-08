import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Sparkles, Home, Zap } from 'lucide-react';

export const Clusters: React.FC = () => {
  // Формат для ECharts Scatter: [Оборачиваемость (X), Средний чек (Y), Название салона]
  const premiumData = [
    [55, 32000, 'Салон №1'], [60, 28500, 'Салон №3'], [48, 35000, 'Салон №7']
  ];
  const budgetData = [
    [120, 4500, 'Салон №2'], [145, 3800, 'Салон №4'], [110, 5200, 'Салон №5'], [130, 4100, 'Салон №8']
  ];
  const youthData = [
    [75, 14000, 'Салон №6'], [82, 16500, 'Салон №9'], [68, 15000, 'Салон №10']
  ];

  const option = {
    title: {
      text: 'Распределение салонов сети: Оборачиваемость vs Средний чек люкса',
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
          <div style="font-size:11px; opacity:0.8;">Кластер: ${params.seriesName}</div>
          <div style="font-size:11px; opacity:0.8;">Оборачиваемость: ${params.data[0]} дн.</div>
          <div style="font-size:11px; opacity:0.8;">Ср. чек люкса: ${params.data[1].toLocaleString()} ₽</div>
        `;
      }
    },
    xAxis: {
      type: 'value',
      name: 'Оборачиваемость (дней)',
      nameLocation: 'middle',
      nameGap: 25,
      splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } }
    },
    yAxis: {
      type: 'value',
      name: 'Ср. чек люкса (₽)',
      splitLine: { lineStyle: { type: 'dashed', color: '#f3f4f6' } }
    },
    series: [
      {
        name: 'Центр-Премиум',
        type: 'scatter',
        data: premiumData,
        symbolSize: 18,
        itemStyle: { color: '#10b981', shadowBlur: 10, shadowColor: 'rgba(16, 185, 129, 0.3)' }
      },
      {
        name: 'Спальный район-Бюджет',
        type: 'scatter',
        data: budgetData,
        symbolSize: 18,
        itemStyle: { color: '#ef4444', shadowBlur: 10, shadowColor: 'rgba(239, 68, 68, 0.3)' }
      },
      {
        name: 'ТЦ-Молодёжный',
        type: 'scatter',
        data: youthData,
        symbolSize: 18,
        itemStyle: { color: '#3b82f6', shadowBlur: 10, shadowColor: 'rgba(59, 130, 246, 0.3)' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Карта кластеризации сети</h2>
        <p className="text-sm text-gray-500">Группы салонов на основе схожести структуры продаж классов ФМЦ.</p>
      </div>

      <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 border border-emerald-100 rounded-xl bg-emerald-50/50">
          <div className="flex items-center space-x-2 text-emerald-800 font-bold text-sm mb-2"><Sparkles className="w-4 h-4" /> <span>Центр-Премиум</span></div>
          <p className="text-xs text-emerald-700 leading-relaxed">Высокий спрос на дорогие оправы. Матрица требует глубокого ассортимента люкса.</p>
        </div>
        <div className="p-4 border border-rose-100 rounded-xl bg-rose-50/50">
          <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm mb-2"><Home className="w-4 h-4" /> <span>Спальный район-Бюджет</span></div>
          <p className="text-xs text-rose-700 leading-relaxed">Высокая оборачиваемость базовых классов ФМЦ. Премиум застаивается.</p>
        </div>
        <div className="p-4 border border-blue-100 rounded-xl bg-blue-50/50">
          <div className="flex items-center space-x-2 text-blue-800 font-bold text-sm mb-2"><Zap className="w-4 h-4" /> <span>ТЦ-Молодёжный</span></div>
          <p className="text-xs text-blue-700 leading-relaxed">Быстрая реакция на тренды и выраженная сезонность солнцезащитных очков.</p>
        </div>
      </div>
    </div>
  );
};
