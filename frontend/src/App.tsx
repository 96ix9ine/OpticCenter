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
import { TrendingUp, Layers, Package, Loader2, Glasses, Sun } from 'lucide-react';

export default function App() {
  const [salons, setSalons] = useState<ISalon[]>([]);
  const [currentSalon, setCurrentSalon] = useState<ISalon | null>(null);
  const [currentSection, setCurrentSection] = useState<SectionType>("Рекомендации");
  const [category, setCategory] = useState<"оптика" | "солнцезащитные">("оптика");
  const [stats, setStats] = useState({ revenue: '0 ₽', stock: '0 шт', deadstock: '0 шт' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // window.location.hostname автоматически подставит p2pm.ru на сервере или localhost дома
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
      <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500 mb-4" />
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
      // case "Кластеры":
      //   return <Clusters category={category} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-800">
      <Sidebar 
        salons={salons}
        currentSalonId={currentSalon?.id || 1} 
        setCurrentSalonId={(id) => setCurrentSalon(salons.find(s => s.id === id) || null)}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      />

      <main className="flex-1 ml-64 p-8 min-h-screen">
        <header className="mb-6 border-b border-gray-200 pb-4 flex justify-between items-end gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">Челябинская сеть</span>
              
              {/* ИСПРАВЛЕНО: КНОПКА-ПЕРЕКЛЮЧАТЕЛЬ ТОВАРНЫХ КОНТУРОВ ИЗ ТЗ ЛЕОНИДА */}
              <div className="flex border border-gray-200 rounded-lg p-0.5 bg-gray-200 text-xs font-bold shadow-sm">
                <button 
                  onClick={() => setCategory("оптика")} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${category === "оптика" ? "bg-white shadow-sm text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <Glasses className="w-3.5 h-3.5" /> Корригирующие оправы
                </button>
                <button 
                  onClick={() => setCategory("солнцезащитные")} 
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${category === "солнцезащитные" ? "bg-white shadow-sm text-amber-600" : "text-gray-500 hover:text-gray-700"}`}
                >
                  <Sun className="w-3.5 h-3.5" /> Солнцезащитные очки
                </button>
              </div>
            </div>
            
            <h1 className="text-2xl font-extrabold text-gray-900 mt-3">{currentSalon?.name}</h1>
            <p className="text-xs text-gray-400 mt-1">{currentSalon?.address}</p>
          </div>

          {/* Статистика салона */}
          <div className="flex gap-4">
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1"><TrendingUp className="w-3 h-3 text-emerald-500" /> Выручка</span>
              <span className="text-sm font-bold text-gray-800 block mt-1">{stats.revenue}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1"><Package className="w-3 h-3 text-blue-500" /> Остатки</span>
              <span className="text-sm font-bold text-gray-800 block mt-1">{stats.stock}</span>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm text-center min-w-[120px]">
              <span className="text-[10px] font-bold text-gray-400 uppercase flex items-center justify-center gap-1"><Layers className="w-3 h-3 text-red-500" /> Неликвиды</span>
              <span className="text-sm font-bold text-red-600 block mt-1">{stats.deadstock}</span>
            </div>
          </div>
        </header>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {renderSection()}
        </section>
      </main>
    </div>
  );
}
