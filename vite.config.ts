import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`,
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          
          // Data layer
          'data-layer': ['@supabase/supabase-js', '@tanstack/react-query'],
          
          // UI components
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-label',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-select',
            '@radix-ui/react-slot',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          
          // Heavy libraries
          'charts': ['recharts'],
          'icons': ['lucide-react'],
          'date-utils': ['date-fns']
        }
      },
      treeshake: {
        moduleSideEffects: false
      }
    },
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 500, // Reduced from 1000
    cssCodeSplit: true,
    assetsInlineLimit: 2048, // Reduced from 4096
    // Optimize for modern browsers with better Chrome support
    target: ['es2020', 'chrome80', 'firefox78', 'safari14'],
    modulePreload: {
      polyfill: false
    },
    // Better compression
    reportCompressedSize: true
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'clsx',
      'tailwind-merge'
    ],
    exclude: [
      'recharts', // Lazy load charts
      'lucide-react', // Lazy load icons
      'date-fns' // Lazy load date utils
    ],
    force: false
  },
  server: {
    host: "localhost",
    port: 8080,
    // Optimize dev server performance
    hmr: {
      overlay: false
    },
    watch: {
      usePolling: true
    },
    // Better handling of dynamic imports
    fs: {
      strict: false
    }
  },
  preview: {
    port: 8080,
    host: true
  }
}))
