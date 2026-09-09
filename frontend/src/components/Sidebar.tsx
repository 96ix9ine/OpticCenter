import React from 'react';
import { LayoutDashboard, Grid, Gem, ArrowLeftRight, TrendingUp, Network } from 'lucide-react';
import { type ISalon, type SectionType } from '../types'; // Исправлено: явный импорт типов

interface SidebarProps {
  salons: ISalon[]; // Исправлено: теперь компонент принимает реальные салоны
  currentSalonId: number;
  setCurrentSalonId: (id: number) => void; // Исправлено: типизировали параметр id вместо any
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
    { id: "Тепловая карта" as SectionType, label: "Тепловая карта", icon: Grid }, // Исправлено: добавлен новый раздел
    { id: "Дорогие oправы" as SectionType, label: "Дорогие оправы", icon: Gem },
    { id: "Сравнение салонов" as SectionType, label: "Сравнение салонов", icon: ArrowLeftRight },
    { id: "Динамика" as SectionType, label: "Динамика спроса", icon: TrendingUp },
    { id: "Кластеры" as SectionType, label: "Кластеры сети", icon: Network },
  ];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen p-4 flex flex-col justify-between fixed left-0 top-0 z-50 shadow-xl">
      <div>
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
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-gray-800 pt-4 px-2 text-[10px] text-gray-500 uppercase tracking-wider">
        Контур: Локальная БД 1С
      </div>
    </aside>
  );
};