#!/bin/bash

# Production Build Script for SmartQ Launchpad
echo "🚀 Building SmartQ Launchpad for Production..."

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf dist
rm -rf .vite

# Install dependencies if needed
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📁 Build output in 'dist' folder"
    echo "🌐 Ready for deployment to production"
    
    # Show build stats
    echo "📊 Build Statistics:"
    du -sh dist/*
    
    # List all built files
    echo "📋 Built files:"
    find dist -type f -name "*.js" -o -name "*.css" -o -name "*.html" | head -20
    
else
    echo "❌ Build failed!"
    exit 1
fi
