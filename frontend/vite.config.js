import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteObfuscateFile } from 'vite-plugin-obfuscator'

export default defineConfig({
  plugins: [
    react(),
    {
      ...viteObfuscateFile({
        compact: true,
        controlFlowFlattening: false,     // true rompe React, dejarlo en false
        deadCodeInjection: false,         // idem
        debugProtection: false,
        disableConsoleOutput: true,       // eliminar console.log en producción
        identifierNamesGenerator: 'mangled',
        renameGlobals: false,
        selfDefending: false,             // puede romper Vite, dejarlo en false
        stringArray: true,
        stringArrayEncoding: ['base64'],
        stringArrayThreshold: 0.75,
        splitStrings: true,
        splitStringsChunkLength: 10,
        unicodeEscapeSequence: false,
      }),
      apply: 'build', // solo en producción, nunca en dev
    },
  ],
  esbuild: {
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : []
  },
  build: {
    // Minificación agresiva con esbuild (ya viene con Vite, activar opciones)
    minify: 'esbuild',
    target: 'es2015',
    rollupOptions: {
      output: {
        // Nombres de chunks sin información semántica
        chunkFileNames: 'assets/[hash].js',
        entryFileNames: 'assets/[hash].js',
        assetFileNames: 'assets/[hash].[ext]',
        // Code splitting para dificultar análisis del bundle completo
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'charts': ['recharts'],
          'ui': ['lucide-react', 'react-hot-toast'],
          'forms': ['react-hook-form', '@hookform/resolvers', 'zod'],
          'data': ['axios', '@tanstack/react-query', 'zustand'],
        },
      },
    },
    // Eliminar sourcemaps en producción (CRÍTICO para seguridad)
    sourcemap: false,
    chunkSizeWarningLimit: 600,
  },
})
