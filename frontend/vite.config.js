import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'react-vendor';
            if (id.includes('recharts')) return 'charts';
            if (id.includes('lucide-react') || id.includes('react-hot-toast')) return 'ui';
            if (id.includes('react-hook-form') || id.includes('@hookform/resolvers') || id.includes('zod')) return 'forms';
            if (id.includes('axios') || id.includes('@tanstack/react-query') || id.includes('zustand')) return 'data';
          }
        }
      }
    }
  }
})