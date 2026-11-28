@echo off
title Aevora Backend & AI Intelligence Platform
color 0B

echo ============================================
echo   Aevora - Backend & AI Platform Launcher
echo ============================================
echo.

:: Check MySQL
echo [1/3] Checking MySQL...
mysqladmin ping -h localhost >nul 2>&1
if errorlevel 1 (
    echo [WARN] MySQL service check failed. Make sure MySQL is running on port 3306.
    echo.
)
echo [OK] MySQL check done.
echo.

:: Start Backend
echo [2/3] Starting Backend (port 5000)...
start "Aevora Backend API" cmd /k "cd /d "%~dp0backend" && npm run dev"
timeout /t 3 >nul

:: Start AI Service
echo [3/3] Starting AI Service (port 8000)...
start "Aevora AI Service" cmd /k "cd /d "%~dp0ai-services" && ..\.venv\Scripts\activate && uvicorn main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 >nul

echo.
echo ============================================
echo   All backend services started!
echo   Backend API: http://localhost:5000
echo   AI Service:  http://localhost:8000
echo ============================================
echo.
