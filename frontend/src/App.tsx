import { useState } from 'react';
import { Sidebar, type SectionType } from './components/Sidebar.tsx';
import { Recommendations } from './pages/Recommendations.tsx';
import { Luxury } from './pages/Luxury.tsx';
import { Compare } from './pages/Compare.tsx';
import { Dynamics } from './pages/Dynamics.tsx';
import { Clusters } from './pages/Clusters.tsx';

export default function App() {
  const [currentSalon, setCurrentSalon] = useState<string>("Салон №1");
  const [currentSection, setCurrentSection] = useState<SectionType>("Рекомендации");

  const renderSection = () => {
    switch (currentSection) {
      case "Рекомендации":
        return <Recommendations salonName={currentSalon} />;
      case "Дорогие oправы":
        return <Luxury salonName={currentSalon} />; // 2. Подставляем реальный компонент вместо заглушки
      case "Сравнение салонов":
        return <Compare defaultSalonA={currentSalon} />;
      case "Динамика":
        return <Dynamics salonName={currentSalon} />;
      case "Кластеры":
        return <Clusters />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex text-gray-800">
      <Sidebar 
        currentSalon={currentSalon} 
        setCurrentSalon={setCurrentSalon}
        currentSection={currentSection}
        setCurrentSection={setCurrentSection}
      />

      <main className="flex-1 ml-64 p-8 min-h-screen">
        <header className="mb-6 border-b border-gray-200 pb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded">
            Текущий фокус
          </span>
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{currentSalon}</h1>
        </header>

        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          {renderSection()}
        </section>
      </main>
    </div>
  );
}
