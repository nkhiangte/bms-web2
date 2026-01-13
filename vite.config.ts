import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { URL, fileURLToPath } from 'url'

export default defineConfig({
  define: {
    // This makes environment variables available in the client-side code.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(process.env.VITE_RAZORPAY_KEY_ID),
  },
  plugins: [react()],
  resolve: {
    alias: {
      // FIX: __dirname is not available in ES modules. Using import.meta.url is the modern way to get the current file's path.
      '@': fileURLToPath(new URL('.', import.meta.url)),
    },
  },
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