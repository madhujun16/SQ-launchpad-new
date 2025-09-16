#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple bundle analyzer script
function analyzeBundle() {
  const distPath = path.join(__dirname, '../dist');
  
  if (!fs.existsSync(distPath)) {
    console.log('❌ No dist folder found. Run "npm run build" first.');
    return;
  }

  const assetsPath = path.join(distPath, 'assets');
  if (!fs.existsSync(assetsPath)) {
    console.log('❌ No assets folder found in dist.');
    return;
  }

  const files = fs.readdirSync(assetsPath);
  const jsFiles = files.filter(file => file.endsWith('.js'));
  const cssFiles = files.filter(file => file.endsWith('.css'));

  console.log('📊 Bundle Analysis:');
  console.log('==================');

  // Analyze JS files
  console.log('\n📦 JavaScript Files:');
  jsFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const sizeInKB = (stats.size / 1024).toFixed(2);
    console.log(`  ${file}: ${sizeInKB} KB`);
  });

  // Analyze CSS files
  console.log('\n🎨 CSS Files:');
  cssFiles.forEach(file => {
    const filePath = path.join(assetsPath, file);
    const stats = fs.statSync(filePath);
    const sizeInKB = (stats.size / 1024).toFixed(2);
    console.log(`  ${file}: ${sizeInKB} KB`);
  });

  // Total size
  const totalSize = jsFiles.reduce((total, file) => {
    const filePath = path.join(assetsPath, file);
    return total + fs.statSync(filePath).size;
  }, 0) + cssFiles.reduce((total, file) => {
    const filePath = path.join(assetsPath, file);
    return total + fs.statSync(filePath).size;
  }, 0);

  console.log(`\n📈 Total Bundle Size: ${(totalSize / 1024).toFixed(2)} KB`);

  // Recommendations
  console.log('\n💡 Optimization Recommendations:');
  console.log('  • Use React.lazy() for route-based code splitting');
  console.log('  • Import only needed icons from lucide-react');
  console.log('  • Consider lazy loading heavy libraries (charts, carousels)');
  console.log('  • Use dynamic imports for rarely used features');
  console.log('  • Optimize images and assets');
}

analyzeBundle(); 