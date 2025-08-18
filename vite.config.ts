import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

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
    }
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
  }
}))
