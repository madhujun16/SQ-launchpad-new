import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
    // Add bundle analyzer in development
    mode === 'development' && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          
          // UI component chunks
          'ui-core': [
            '@radix-ui/react-dialog', 
            '@radix-ui/react-dropdown-menu', 
            '@radix-ui/react-select', 
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
            '@radix-ui/react-tooltip'
          ],
          'ui-forms': [
            '@radix-ui/react-checkbox',
            '@radix-ui/react-radio-group',
            '@radix-ui/react-switch',
            'react-hook-form',
            '@hookform/resolvers',
            'zod'
          ],
          'ui-layout': [
            '@radix-ui/react-accordion',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-scroll-area',
            'react-resizable-panels'
          ],
          
          // Utility chunks
          'utils': ['date-fns', 'clsx', 'class-variance-authority', 'tailwind-merge'],
          'icons': ['lucide-react'],
          
          // Feature chunks - split by functionality
          'dashboard': [
            './src/components/dashboards/AdminDashboard.tsx',
            './src/components/dashboards/OpsManagerDashboard.tsx',
            './src/components/dashboards/DeploymentEngineerDashboard.tsx'
          ],
          'inventory': [
            './src/components/inventory/DeployInventoryForm.tsx',
            './src/components/inventory/InventoryFiltersPanel.tsx',
            './src/components/inventory/InventoryItemDetails.tsx',
            './src/components/inventory/InventoryItemForm.tsx',
            './src/components/inventory/LicenseForm.tsx'
          ],
          'services': [
            './src/services/dashboardService.ts',
            './src/services/inventoryService.ts'
          ],
          
          // Heavy libraries that should be loaded separately
          'charts': ['recharts'],
          'carousel': ['embla-carousel-react'],
          'auth': ['@supabase/supabase-js'],
          'query': ['@tanstack/react-query']
        },
        // Optimize chunk naming
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    chunkSizeWarningLimit: 1000,
    sourcemap: false,
    minify: 'esbuild',
    esbuild: {
      drop: ['console', 'debugger']
    },
    // Optimize asset handling
    assetsInlineLimit: 4096, // 4kb - inline small assets
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-select',
      '@radix-ui/react-tabs',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      'clsx',
      'class-variance-authority',
      'tailwind-merge'
    ],
    // Exclude heavy libraries from pre-bundling
    exclude: ['recharts', 'embla-carousel-react']
  },
  // Enable CSS code splitting
  css: {
    devSourcemap: false
  }
}));
