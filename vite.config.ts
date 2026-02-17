import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',

  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },

  define: {
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(process.env.VITE_RAZORPAY_KEY_ID),
  },

  plugins: [react()],

  build: {
    rollupOptions: {
      external: ['jspdf', 'html2canvas'],
    },
  },

  optimizeDeps: {
    include: [
      'firebase/compat/app',
      'firebase/compat/auth',
      'firebase/compat/firestore',
      'firebase/compat/storage',
    ],
  },
})
