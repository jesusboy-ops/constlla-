import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Optimize for production
    minify: 'esbuild',
    sourcemap: false,
    // Remove only console.log in production, keep console.error and console.warn
    esbuild: {
      pure: ['console.log']
    },
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'react-vendor': ['react', 'react-dom'],
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'animation-vendor': ['framer-motion'],
          'state-vendor': ['zustand'],
          'utils-vendor': ['ethers', 'd3-force']
        }
      }
    },
    // Increase chunk size warning limit
    chunkSizeWarningLimit: 1000,
    // Target modern browsers for better optimization
    target: 'es2020'
  },
  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'three',
      '@react-three/fiber',
      '@react-three/drei',
      'framer-motion',
      'zustand'
    ]
  },
  // Server configuration for development
  server: {
    port: 5173,
    host: true
  },
  // Preview configuration
  preview: {
    port: 4173,
    host: true
  }
})
