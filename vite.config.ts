import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8080,
    hmr: {
      port: 24678,
      fastRefresh: true
    },
    watch: {
      usePolling: false,
      interval: 100
    },
    middlewareMode: false,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    }
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    },
    // Production optimizations
    minify: 'esbuild',
    sourcemap: false,
    // Ensure proper chunk splitting
    chunkSizeWarningLimit: 1000,
    // Optimize CSS
    cssCodeSplit: true,
    // Optimize assets
    assetsInlineLimit: 4096
  },
  optimizeDeps: {
    include: ['@supabase/supabase-js'],
    force: true
  },
  esbuild: {
    target: 'esnext'
  },
  define: {
    __DEV__: mode === 'development'
  },
  // Production-specific optimizations
  ...(mode === 'production' && {
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'ui-vendor': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-select',
              '@radix-ui/react-tabs',
              '@radix-ui/react-toast',
              '@radix-ui/react-tooltip'
            ],
            'supabase-vendor': ['@supabase/supabase-js'],
            'query-vendor': ['@tanstack/react-query']
          }
        }
      }
    }
  })
}))
