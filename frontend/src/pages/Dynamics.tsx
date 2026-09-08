import React, { useState } from 'react';
import ReactECharts from 'echarts-for-react'; // Импортируем Apache ECharts
import { TrendingUp, Info } from 'lucide-react';

const fmcClasses = ["Квадрат–Металл–Черный", "Круг–Пластик–Леопард", "Овал–Металл–Золото", "Авиатор–Пластик–Коричневый"];

export const Dynamics: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>(fmcClasses[0]);

  // Конфигурация графика в стиле Apache ECharts (option)
  const option = {
    title: {
      text: `Динамика и Прогноз для: ${selectedClass}`,
      textStyle: { fontSize: 13, color: '#374151', fontFamily: 'sans-serif' },
      left: 'center'
    },
    tooltip: {
      trigger: 'axis',
      backgroundColor: '#111827',
      textStyle: { color: '#fff' },
      borderWidth: 0
    },
    legend: {
      data: ['Исторический факт', 'Прогноз Prophet'],
      top: 30
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: ['Окт 25', 'Ноя 25', 'Дек 25', 'Янв 26', 'Фев 26', 'Мар 26', 'Апр 26', 'Май 26', 'Июн 26', 'Июл 26', 'Авг 26', 'Сен 26 (П)'],
      axisLine: { lineStyle: { color: '#9ca3af' } }
    },
    yAxis: {
      type: 'value',
      splitLine: { lineStyle: { color: '#f3f4f6' } },
      axisLine: { show: false }
    },
    series: [
      {
        name: 'Исторический факт',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        data: [12, 14, 19, 15, 22, 24, 30, 28, 25, 21, 18, null],
        itemStyle: { color: '#2563eb' },
        lineStyle: { width: 3 }
      },
      {
        name: 'Прогноз Prophet',
        type: 'line',
        smooth: true,
        symbolSize: 8,
        // Точка нахлеста на Августе (18), далее прогноз на Сентябрь (23)
        data: [null, null, null, null, null, null, null, null, null, null, 18, 23], 
        itemStyle: { color: '#93c5fd' },
        lineStyle: { width: 3, type: 'dashed' }
      }
    ]
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">История и Прогноз Prophet</h2>
        <p className="text-sm text-gray-500">Визуализация временных рядов продаж с использованием Apache ECharts.</p>
      </div>

      <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 max-w-md">
        <label className="block text-xs font-semibold text-gray-400 uppercase mb-2">Выберите класс ФМЦ</label>
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 cursor-pointer font-medium text-gray-700"
        >
          {fmcClasses.map((fmc) => (
            <option key={fmc} value={fmc}>{fmc}</option>
          ))}
        </select>
      </div>

      <div className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm">
        {/* Рендерим компонент Apache ECharts */}
        <ReactECharts option={option} style={{ height: '400px', width: '100%' }} />

        <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg flex items-start gap-2 text-xs">
          <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
          <span>
            График переведен на движок **Apache ECharts**, обеспечивающий плавное масштабирование таймсерий и встроенную поддержку экспорта.
          </span>
        </div>
      </div>
    </div>
  );
};
