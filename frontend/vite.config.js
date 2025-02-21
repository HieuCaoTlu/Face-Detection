import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,       // Đặt port là 5000
    host: '0.0.0.0',
    watch: {
      usePolling: true,
    },   // Để Vite có thể truy cập từ bên ngoài container
  }
})
