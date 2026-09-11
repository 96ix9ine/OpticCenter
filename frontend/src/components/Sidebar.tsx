import React, { useState } from 'react';
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

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <aside 
      className="w-full h-full text-white p-4 flex flex-col justify-between shadow-xl"
      style={{ backgroundColor: 'rgb(0, 0, 0, 0.9)' }}
    >
      
      <div className="overflow-y-auto flex-1 pr-1 pb-4">
        <div className="mb-8 px-2 py-3 flex items-center gap-3" style={{ borderBottom: '1px solid #323232' }}>
          <div className="relative w-full h-full bg-white rounded-lg p-1 flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0">
            <img 
              src="/logo.jpg"
              alt="Logo" 
              className="w-full h-full object-contain mix-blend-multiply filter contrast-125 saturate-100" 
            />
          </div>
        </div>

        {/* Выпадающий список из 1С */}
        <div className="mb-6 px-2">
          <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Выберите салон
          </label>
          <div className="relative">
            <select
              value={currentSalonId}
              onChange={(e) => setCurrentSalonId(Number(e.target.value))}
              className="w-full text-white border border-transparent rounded px-3 py-2 text-sm focus:outline-none cursor-pointer transition-colors appearance-none"
              style={{ background: '#323232' }}
            >
              {salons.map((s) => (
                <option 
                  key={s.id} 
                  value={s.id}
                  style={{ backgroundColor: '#323232', color: '#ffffff' }}
                >
                  {s.name}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none text-gray-400 z-20">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Навигация */}
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentSection === item.id;
            const isHovered = hoveredId === item.id;

            // Динамически определяем цвет фона кнопки на основе вашей логики
            let buttonBackground = '#323232'; // Статичный базовый цвет для неактивных секций
            
            if (isActive) {
              buttonBackground = '#cb1b24'; // Фирменный красный для активной выбранной секции
            } else if (isHovered) {
              buttonBackground = '#cb1b24'; // Фирменный красный при наведении (hover)
            }

            return (
              <button
                key={item.id}
                onClick={() => setCurrentSection(item.id)}
                onMouseEnter={() => setHoveredId(item.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-white focus:outline-none"
                // Принудительно красим бэкграунд инлайном, обрабатывая ховер, фокус и статику
                style={{ 
                  backgroundColor: buttonBackground,
                  boxShadow: isActive || isHovered ? '0 4px 12px rgba(203, 27, 36, 0.2)' : 'none'
                }}
              >
                <Icon className="w-4 h-4 flex-shrink-0 text-white" />
                <span className="text-white">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      <div 
        className="pt-4 px-2 text-[10px] text-gray-500 uppercase tracking-wider sticky bottom-0"
        style={{ borderTop: '1px solid #323232' }}
      >
        Контур: Локальная БД ClickHouse
      </div>
    </aside>
  );
};