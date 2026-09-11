// frontend/src/App.tsx
import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { Recommendations } from './pages/Recommendations.tsx';
import { Heatmap } from './pages/Heatmap.tsx';
import { Luxury } from './pages/Luxury.tsx';
import { Compare } from './pages/Compare.tsx';
import { Dynamics } from './pages/Dynamics.tsx';
import { Clusters } from './pages/Clusters.tsx';
import type { ISalon, SectionType } from './types'; 
import { TrendingUp, Layers, Package, Loader2, Glasses, Sun, Menu, X } from 'lucide-react';

export default function App() {
  const [salons, setSalons] = useState<ISalon[]>([]);
  const [currentSalon, setCurrentSalon] = useState<ISalon | null>(null);
  const [currentSection, setCurrentSection] = useState<SectionType>("Рекомендации");
  const [category, setCategory] = useState<"оптика" | "солнцезащитные">("оптика");
  const [stats, setStats] = useState({ revenue: '0 ₽', stock: '0 шт', deadstock: '0 шт' });
  const [loading, setLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const backendUrl = import.meta.env.VITE_API_URL || '';

    fetch(`${backendUrl}/api/salons`)
      .then(res => res.json())
      .then((data: ISalon[]) => {
        setSalons(data);

        if (data.length > 0) {
          setCurrentSalon(data[0]); 
        }
        
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!currentSalon) return;
    const isRegular = currentSalon.id % 2 === 0;
    const isOptics = category === "оптика";
    
    setStats({
      revenue: isOptics ? (isRegular ? "1,240,000 ₽" : "2,450,000 ₽") : (isRegular ? "890,000 ₽" : "1,680,000 ₽"),
      stock: isOptics ? (isRegular ? "342 шт" : "612 шт") : (isRegular ? "210 шт" : "415 шт"),
      deadstock: isOptics ? (isRegular ? "0 шт" : "0 шт") : (isRegular ? "0 шт" : "0 шт")
    });
  }, [currentSalon, category]);

  if (loading) {
    return (
      <div className="min-h-screen bg-optic-dark flex flex-col justify-center items-center text-white p-4 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-optic-red mb-4" />
        <p className="text-sm tracking-wide">Подгрузка готовых матриц Prophet + XYZ с локального контура...</p>
      </div>
    );
  }

  const renderSection = () => {
    if (!currentSalon) return null;
    switch (currentSection) {
      case "Рекомендации":
        return <Recommendations salonId={currentSalon.id} category={category} />;
      case "Тепловая карта":
        return <Heatmap salonId={currentSalon.id} category={category} />;
      case "Дорогие oправы":
        return <Luxury salonId={currentSalon.id} category={category} />;
      case "Сравнение салонов":
        return <Compare defaultSalonId={currentSalon.id} salons={salons} category={category} />;
      case "Динамика":
        return <Dynamics salonId={currentSalon.id} category={category} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-optic-gray/40 flex text-gray-800 relative overflow-x-hidden">
      
      {/* Кнопка Гамбургер для мобильных */}
      <button 
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-optic-red text-white rounded-full shadow-lg md:hidden hover:bg-optic-lightRed transition-all focus:outline-none"
        aria-label="Toggle menu"
        style={{backgroundColor: '#e4002b'}}
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Оверлей для закрытия меню по тапу на экран на мобилках */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Контейнер Сайдбара с адаптивным позиционированием */}
      <div className={`fixed inset-y-0 left-0 z-40 transform transition-transform duration-300 md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:w-64`}>
        <Sidebar 
          salons={salons}
          currentSalonId={currentSalon?.id || 1} 
          setCurrentSalonId={(id) => {
            setCurrentSalon(salons.find(s => s.id === id) || null);
            setIsMobileMenuOpen(false); 
          }}
          currentSection={currentSection}
          setCurrentSection={(section) => {
            setCurrentSection(section);
            setIsMobileMenuOpen(false); 
          }}
        />
      </div>

      {/* Основной контент */}
      <main className="flex-1 w-full md:ml-64 p-4 sm:p-6 md:p-8 min-h-screen transition-all duration-300">
        <header className="mb-6 border-b border-gray-200 pb-4 flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-end">
          <div className="w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <span className="self-start text-xs font-semibold uppercase tracking-wider text-optic-red bg-optic-red/10 px-2.5 py-1 rounded">Челябинская сеть</span>
              
              <div className="flex w-full sm:w-auto border border-gray-200 rounded-lg p-0.5 bg-gray-200 text-xs font-bold shadow-sm">
                <button 
                  onClick={() => setCategory("оптика")} 
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${category === "оптика" ? "bg-white shadow-sm text-optic-red" : "text-gray-500 hover:text-gray-700"}`}
                  style={{color: '#009cd3'}}
                >
                  <Glasses className="w-3.5 h-3.5" /> Корригирующие
                </button>
                <button 
                  onClick={() => setCategory("солнцезащитные")} 
                  className={`flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${category === "солнцезащитные" ? "bg-white shadow-sm text-optic-red" : "text-gray-500 hover:text-gray-700"}`}
                  style={{color: '#f08a00'}}
                >
                  <Sun className="w-3.5 h-3.5" /> Солнцезащитные
                </button>
              </div>
            </div>
            
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-3 break-words">{currentSalon?.name}</h1>
            <p className="text-xs text-gray-400 mt-1 break-words">{currentSalon?.address}</p>
          </div>

          {/* Статистика салона с горизонтальным скроллом на мобильных */}
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 lg:mx-0 lg:px-0 lg:overflow-x-visible w-[calc(100%+2rem)] lg:w-auto no-scrollbar snap-x">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-center min-w-[110px] sm:min-w-[120px] flex-1 lg:flex-none snap-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1 whitespace-nowrap"><TrendingUp className="w-3 h-3 text-emerald-500" /> Выручка</span>
              <span 
                className="text-xs sm:text-sm font-bold text-gray-800 block mt-1"
                style={{color: '#3e8a27'}}>
                  {stats.revenue}
                </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-center min-w-[110px] sm:min-w-[120px] flex-1 lg:flex-none snap-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1 whitespace-nowrap"><Package className="w-3 h-3 text-optic-dark" /> Остатки</span>
              <span 
                className="text-xs sm:text-sm font-bold text-gray-800 block mt-1"
                style={{color: '#0038a8'}}>
                  {stats.stock}
              </span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-center min-w-[110px] sm:min-w-[120px] flex-1 lg:flex-none snap-start">
              <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1 whitespace-nowrap"><Layers className="w-3 h-3 text-optic-red" /> Неликвиды</span>
              <span 
                className="text-xs sm:text-sm font-bold block mt-1"
                style={{color: '#cb1b24'}}>
                  {stats.deadstock}
              </span>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 overflow-x-hidden">
          {renderSection()}
        </section>
      </main>
    </div>
  );
}