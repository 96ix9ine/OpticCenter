import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      host: 'p2pm.ru', 
      protocol: 'wss'
    },
    allowedHosts: ['p2pm.ru', '.p2pm.ru', 'localhost'] 
  }
});
