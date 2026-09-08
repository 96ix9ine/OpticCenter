import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react';
import { ArrowLeftRight } from 'lucide-react';

const salonsList = Array.from({ length: 26 }, (_, i) => `Салон №${i + 1}`);
const fmcClasses = ['Квадрат–Металл–Черный', 'Круг–Пластик–Леопард', 'Овал–Металл–Золото', 'Авиатор–Пластик–Коричневый', 'Прямоугольник–Пластик–Синий'];

export const Compare: React.FC<{ defaultSalonA: string }> = ({ defaultSalonA }) => {
  const [salonA, setSalonA] = useState<string>(defaultSalonA);
  const [salonB, setSalonB] = useState<string>("Салон №2");

  // Данные для Apache ECharts
  const option = {
    title: {
      text: `Профиль матрицы: ${salonA} vs ${salonB} (Доля продаж, %)`,
      left: 'center',
      textStyle: { fontSize: 13, color: '#374151', fontFamily: 'sans-serif' }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      backgroundColor: '#111827',
      textStyle: { color: '#fff' },
      borderWidth: 0
    },
    legend: {
      data: [salonA, salonB],
      top: 30
    },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: [
      {
        type: 'category',
        data: fmcClasses,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#9ca3af' } },
        axisLabel: { fontSize: 10, rotate: 15 }
      }
    ],
    yAxis: [
      {
        type: 'value',
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#f3f4f6' } }
      }
    ],
    series: [
      {
        name: salonA,
        type: 'bar',
        barGap: 0,
        label: { show: true, position: 'top', formatter: '{c}%', fontSize: 10 },
        emphasis: { focus: 'series' },
        data: [34, 8, 22, 14, 22],
        itemStyle: { color: '#2563eb', borderRadius: [4, 4, 0, 0] }
      },
      {
        name: salonB,
        type: 'bar',
        label: { show: true, position: 'top', formatter: '{c}%', fontSize: 10 },
        emphasis: { focus: 'series' },
        data: [34, 8, 22, 14, 22],
        itemStyle: { color: '#93c5fd', borderRadius: [4, 4, 0, 0] }
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Сравнение структуры продаж по классам</h2>
        <p className="text-sm text-gray-500">Анализ поведенческих различий покупателей в разных локациях.</p>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Первая точка (А)</label>
          <select value={salonA} onChange={(e) => setSalonA(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none">
            {salonsList.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="flex justify-center text-gray-400 mt-5 hidden md:flex"><ArrowLeftRight className="w-5 h-5" /></div>
        <div>
          <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Вторая точка (Б)</label>
          <select value={salonB} onChange={(e) => setSalonB(e.target.value)} className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none">
            {salonsList.map((s) => <option key={s} value={s} disabled={s === salonA}>{s}</option>)}
          </select>
        </div>
      </div>

      <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />
      </div>
    </div>
  );
};
