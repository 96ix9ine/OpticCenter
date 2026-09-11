/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./src/components/Sidebar.tsx",   
  ],
  theme: {
    extend: {
      colors: {
        optic: {
          // Основные цвета
          red: '#cb1b24',       // Насыщенный красный (Pantone 1797 C)
          lightRed: '#e4002b',  // Светло-красный для градиентов (Pantone 185 C)
          black: '#000000',     // Чистый черный
          dark: '#323232',      // Темно-серый (Cool Gray 11 C)
          gray: '#ecebeb',      // Светло-серый (Cool Gray 1 C)
          
          // Дополнительные цвета
          green: '#3e8a27',     // Зеленый (Pantone 363 C)
          yellow: '#f08a00',    // Желтый (Pantone 138 C)
          blue: '#0038a8',      // Синий (Pantone 286 C)
          lightBlue: '#009cd3', // Голубой (Pantone 2925 C)
          purple: '#722485',    // Фиолетовый (Pantone 2602 C)
          magenta: '#e4007f',   // Пурпурный (Pantone Pro. Mag. C)
        }
      }
    },
  },
  plugins: [],
}
