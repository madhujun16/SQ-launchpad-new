import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
          
          // UI component libraries
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
          
          // Data and state management
          'data-layer': ['@supabase/supabase-js', '@tanstack/react-query'],
          
          // Utility libraries
          'utils': ['lucide-react', 'clsx', 'tailwind-merge'],
          
          // Page-specific chunks
          'dashboard': ['./src/pages/Dashboard.tsx'],
          'sites': ['./src/pages/Sites.tsx', './src/pages/Site.tsx', './src/pages/SiteCreation.tsx'],
          'platform-config': [
            './src/pages/OrganizationsManagement.tsx',
            './src/pages/UserManagement.tsx',
            './src/pages/SoftwareHardwareManagement.tsx',
            './src/pages/AuditLogs.tsx'
          ],
          'approvals': [
            './src/pages/ApprovalsProcurement.tsx',
            './src/pages/HardwareApprovals.tsx',
            './src/pages/HardwareScoping.tsx'
          ],
          'assets': [
            './src/pages/Assets.tsx',
            './src/pages/Inventory.tsx',
            './src/pages/LicenseManagement.tsx',
            './src/pages/HardwareMaster.tsx'
          ]
        }
      }
    },
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    // Optimize chunk loading
    target: 'esnext',
    modulePreload: {
      polyfill: false
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@radix-ui/react-dialog',
      '@radix-ui/react-dropdown-menu',
      '@radix-ui/react-label',
      '@radix-ui/react-radio-group',
      '@radix-ui/react-select',
      '@radix-ui/react-slot',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@supabase/supabase-js',
      '@tanstack/react-query',
      'lucide-react'
    ],
    exclude: [],
    force: false
  },
  server: {
    port: 8080,
    host: true,
    // Optimize dev server performance
    hmr: {
      overlay: false
    }
  },
  preview: {
    port: 8080,
    host: true
  }
})
