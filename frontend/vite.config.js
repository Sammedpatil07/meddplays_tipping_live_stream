import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const BACKEND = 'https://meddplays-backend.onrender.com'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: BACKEND,
        changeOrigin: true,
        secure: true,
      },
      '/socket.io': {
        target: BACKEND,
        changeOrigin: true,
        ws: true,
        secure: true,
      },
    },
  },
})

