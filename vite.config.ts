import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages: use '/SQ-launchpad-new/' if deploying to repository subdirectory
  // Use '/' if using custom domain or deploying to root
  base: process.env.VITE_BASE_PATH || (process.env.NODE_ENV === 'production' ? '/SQ-launchpad-new/' : '/'),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
