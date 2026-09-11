import React from 'react';
import { LayoutDashboard, Grid, Gem, ArrowLeftRight, TrendingUp, Network } from 'lucide-react';
import { type ISalon, type SectionType } from '../types';

interface SidebarProps {
  salons: ISalon[];
  currentSalonId: number;
  setCurrentSalonId: (id: number) => void;
  currentSection: SectionType;
  setCurrentSection: (section: SectionType) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  salons,
  currentSalonId,
  setCurrentSalonId,
  currentSection,
  setCurrentSection
}) => {
  
  const menuItems = [
    { id: "Рекомендации" as SectionType, label: "Рекомендации", icon: LayoutDashboard },
    { id: "Тепловая карта" as SectionType, label: "Тепловая карта", icon: Grid },
    { id: "Дорогие oправы" as SectionType, label: "Дорогие оправы", icon: Gem },
    { id: "Сравнение салонов" as SectionType, label: "Сравнение салонов", icon: ArrowLeftRight },
    { id: "Динамика" as SectionType, label: "Динамика продаж", icon: TrendingUp },
  ];

  return (
    <aside className="w-full h-full bg-gray-900 text-white p-4 flex flex-col justify-between shadow-xl">
      
      {/* Добавлена обертка с возможностью вертикального скролла для мобильных экранов */}
      <div className="overflow-y-auto flex-1 pr-1 pb-4">
        <div className="mb-8 px-2 py-3 border-b border-gray-800">
          <h1 className="text-xl font-bold tracking-tight text-blue-400">AI Optics Assistant</h1>
          <p className="text-xs text-gray-400 mt-1">Панель категорийного менеджера</p>
        </div>

        {/* Выпадающий список из 1С */}
        <div className="mb-6 px-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">
            Выберите салон
          </label>
          <select
            value={currentSalonId}
            onChange={(e) => setCurrentSalonId(Number(e.target.value))}
            className="w-full bg-gray-800 text-white border border-gray-700 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            {salons.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>

        {/* Навигация */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-800 pt-4 px-2 text-[10px] text-gray-500 uppercase tracking-wider bg-gray-900 sticky bottom-0">
        Контур: Локальная БД ClickHouse
      </div>
    </aside>
  );
};
