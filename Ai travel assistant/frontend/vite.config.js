import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@marsidev/react-turnstile',
      '@simplewebauthn/browser',
      'zxcvbn',
      'leaflet',
      'react-leaflet',
      'recharts',
      'three',
      '@react-three/fiber',
      '@react-three/drei'
    ],
  },
  server: {
    port: 5173,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
