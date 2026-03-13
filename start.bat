@echo off
REM Exam Guardrail - Quick Start Script (Windows)
REM This script sets up and runs the entire application

setlocal enabledelayedexpansion

echo.
echo 🛡️  Exam Guardrail - Quick Start
echo =================================
echo.

REM Check if running from correct directory
if not exist "requirements.txt" (
    echo ❌ Error: Run this script from the project root directory
    exit /b 1
)

REM Menu
echo Select what to do:
echo 1. Quick Start (requires Supabase setup)
echo 2. Backend only
echo 3. Frontend only
echo 4. Install dependencies and run seed
echo 5. Install dependencies only
echo.
set /p choice="Enter choice (1-5): "

if "%choice%"=="1" (
    echo.
    echo Quick Start Mode
    echo ================
    
    if not exist ".env.backend" (
        echo ❌ .env.backend not found!
        echo Please create .env.backend with your Supabase credentials:
        echo.
        echo   SUPABASE_URL=https://your-project-id.supabase.co
        echo   SUPABASE_KEY=your-anon-key-here
        echo.
        echo See SUPABASE_SETUP.md for detailed instructions
        exit /b 1
    )
    
    echo 📦 Installing Python dependencies...
    pip install -q -r requirements.txt
    
    echo 📦 Installing Frontend dependencies...
    cd interface-companion && npm install --quiet && cd ..
    
    echo.
    echo Starting Backend...
    cd backend
    start cmd /k python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
    cd ..
    
    timeout /t 2
    
    echo Starting Frontend...
    cd interface-companion
    start cmd /k npm run dev
    cd ..
    
    echo.
    echo ✓ Application started!
    echo Backend:  http://localhost:8000
    echo Frontend: http://localhost:5173
    echo.
) else if "%choice%"=="2" (
    echo.
    echo Docker MongoDB Setup
    echo ====================
    
    where docker-compose >nul 2>nul
    if errorlevel 1 (
        echo ❌ Docker Compose is not installed!
        echo Please install Docker Desktop from: https://www.docker.com/products/docker-desktop
        exit /b 1
    )
    
    echo 🐳 Starting MongoDB with Docker Compose...
    docker-compose up -d
    
    timeout /t 3
    
    if not exist ".env.backend" (
        echo 📝 Creating .env.backend for local MongoDB...
        (
            echo MONGODB_URI=mongodb://admin:password@localhost:27017/exam_guardrail?authSource=admin
            echo API_HOST=0.0.0.0
            echo API_PORT=8000
        ) > .env.backend
        echo ✓ .env.backend created
    )
    
    if not exist "interface-companion\.env.local" (
        echo 📝 Creating .env.local for frontend...
        echo VITE_API_URL=http://localhost:8000 > interface-companion\.env.local
        echo ✓ .env.local created
    )
    
    echo.
    echo ✓ MongoDB is running!
    echo MongoDB URL: mongodb://admin:password@localhost:27017/
    echo MongoDB Express: http://localhost:8081
    echo.
    
    set /p start_apps="Would you like to start Backend and Frontend? (y/n): "
    
    if /i "%start_apps%"=="y" (
        echo 📦 Installing Python dependencies...
        pip install -q -r requirements.txt
        
        echo 📦 Installing Frontend dependencies...
        cd interface-companion && npm install --quiet && cd ..
        
        echo Starting Backend...
        cd backend
        start cmd /k python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
        cd ..
        
        timeout /t 2
        
        echo Starting Frontend...
        cd interface-companion
        start cmd /k npm run dev
        cd ..
        
        echo.
        echo ✓ Application started!
        echo Frontend: http://localhost:5173
        echo Backend:  http://localhost:8000
    )
) else if "%choice%"=="3" (
    echo.
    echo Backend Only
    echo ============
    
    echo 📦 Installing Python dependencies...
    pip install -q -r requirements.txt
    
    echo.
    echo Starting Backend...
    cd backend
    python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
) else if "%choice%"=="4" (
    echo.
    echo Frontend Only
    echo =============
    
    echo 📦 Installing dependencies...
    cd interface-companion
    npm install --quiet
    
    echo.
    echo Starting Frontend...
    npm run dev
) else if "%choice%"=="5" (
    echo.
    echo Installing Dependencies
    echo =======================
    
    echo 📦 Installing Python dependencies...
    pip install -q -r requirements.txt
    echo ✓ Python dependencies installed
    
    echo 📦 Installing Frontend dependencies...
    cd interface-companion
    npm install --quiet
    echo ✓ Frontend dependencies installed
    
    echo.
    echo ✓ All dependencies installed!
) else (
    echo Invalid choice!
    exit /b 1
)
