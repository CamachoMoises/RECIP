import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ['@react-pdf/renderer'],
  },
  define: {
    // Suppress MT v2 DOM prop warnings in development
    __SUPPRESS_MT_WARNINGS__: true,
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
    },
  },
})