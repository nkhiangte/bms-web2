import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  define: {
    // This makes environment variables available in the client-side code.
    'process.env.API_KEY': JSON.stringify(process.env.API_KEY),
    'process.env.VITE_RAZORPAY_KEY_ID': JSON.stringify(process.env.VITE_RAZORPAY_KEY_ID),
    'process.env.VITE_PHONEPE_MERCHANT_ID': JSON.stringify(process.env.VITE_PHONEPE_MERCHANT_ID),
    'process.env.VITE_PHONEPE_SALT_KEY': JSON.stringify(process.env.VITE_PHONEPE_SALT_KEY),
    'process.env.VITE_PHONEPE_SALT_INDEX': JSON.stringify(process.env.VITE_PHONEPE_SALT_INDEX)
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