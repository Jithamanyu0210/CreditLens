import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            if (err.code === 'ECONNREFUSED') {
              console.warn('\n[CreditLens Proxy] Cannot connect to backend at http://127.0.0.1:5000 (ECONNREFUSED).');
              console.warn('[Resolution] Ensure backend is running in another terminal: `cd backend && npm start`\n');
            }
          });
        }
      }
    }
  }
})
