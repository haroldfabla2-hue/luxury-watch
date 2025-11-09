import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: process.env.NODE_ENV === 'production' ? [
          ['transform-remove-console', { 
            exclude: ['error', 'warn']
          }]
        ] : []
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    }
  },
  build: {
    target: 'es2018',
    minify: 'esbuild',
    sourcemap: false,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    reportCompressedSize: true,
    
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/three/')) {
            return 'three'
          }
          if (id.includes('node_modules/react/')) {
            return 'react'
          }
          if (id.includes('node_modules/@supabase/')) {
            return 'supabase'
          }
          if (id.includes('node_modules/@stripe/')) {
            return 'stripe'
          }
          if (id.includes('node_modules/@radix-ui/')) {
            return 'ui'
          }
          if (id.includes('node_modules/zustand')) {
            return 'state'
          }
          return null
        }
      }
    },
    
    chunkSizeWarningLimit: 1000,
  },
  
  optimizeDeps: {
    include: ['three', 'react', 'react-dom', 'zustand', '@supabase/supabase-js']
  },
  
  esbuild: {
    drop: process.env.NODE_ENV === 'development' ? [] : ['console', 'debugger'],
    treeShaking: true,
    minifyIdentifiers: true,
    minifySyntax: true,
    minifyWhitespace: true
  },
  
  base: './',
})
