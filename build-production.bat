@echo off
REM Production Build Script for SmartQ Launchpad (Windows)
echo 🚀 Building SmartQ Launchpad for Production...

REM Clean previous builds
echo 🧹 Cleaning previous builds...
if exist dist rmdir /s /q dist
if exist .vite rmdir /s /q .vite

REM Install dependencies if needed
echo 📦 Installing dependencies...
npm install

REM Build the application
echo 🔨 Building application...
npm run build

REM Check if build was successful
if %ERRORLEVEL% EQU 0 (
    echo ✅ Build successful!
    echo 📁 Build output in 'dist' folder
    echo 🌐 Ready for deployment to production
    
    REM Show build stats
    echo 📊 Build Statistics:
    dir dist /s
    
    echo.
    echo 🎉 Production build completed successfully!
) else (
    echo ❌ Build failed!
    pause
    exit /b 1
)
