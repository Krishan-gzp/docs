@echo off
title 3D BIM Viewer - Quick Setup

echo.
echo ==========================================
echo    3D BIM VIEWER - QUICK SETUP
echo ==========================================
echo.

:: Check if Node.js is installed
echo [1/4] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not found! Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
) else (
    echo ✅ Node.js found
)

:: Check if npm is available
echo [2/4] Checking npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not found!
    pause
    exit /b 1
) else (
    echo ✅ npm found
)

:: Install dependencies
echo [3/4] Installing dependencies...
echo This may take a few minutes...
npm install --no-fund --no-audit

if errorlevel 1 (
    echo ❌ Failed to install dependencies
    echo.
    echo Try running manually:
    echo   npm cache clean --force
    echo   npm install
    pause
    exit /b 1
) else (
    echo ✅ Dependencies installed successfully
)

:: Start the application
echo [4/4] Starting the application...
echo.
echo 🚀 Starting 3D BIM Viewer...
echo.
echo Frontend will be available at: http://localhost:3000
echo Backend API will be available at: http://localhost:5000
echo.
echo Press Ctrl+C to stop the application
echo.

start "" "http://localhost:3000"
npm run dev

pause