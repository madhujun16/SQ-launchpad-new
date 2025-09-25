import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { initializeChromeOptimizations } from './utils/chromeOptimizations'

// Initialize Chrome optimizations before React
initializeChromeOptimizations();

createRoot(document.getElementById("root")!).render(<App />);
