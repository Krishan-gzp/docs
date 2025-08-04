import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  root: 'frontend',
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://localhost:5000'
    }
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'three': ['three'],
          'thatopen': ['@thatopen/components', '@thatopen/components-front', '@thatopen/fragments'],
          'web-ifc': ['web-ifc']
        }
      }
    }
  },
  optimizeDeps: {
    include: ['three', '@thatopen/components', '@thatopen/components-front', '@thatopen/fragments', 'web-ifc']
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
})