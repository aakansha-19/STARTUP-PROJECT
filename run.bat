@echo off
title AI Placement Readiness Predictor Launcher
echo ====================================================
echo Starting AI Placement Readiness Predictor
echo ====================================================
echo.

echo [1/2] Launching FastAPI Backend on http://127.0.0.1:8000...
start "FastAPI Backend" cmd /k "cd /d "%~dp0backend" && ".\venv\Scripts\python.exe" -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

echo [2/2] Launching React Vite Frontend on http://localhost:5173...
start "React Frontend" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo ====================================================
echo Both servers are starting up!
echo Frontend: http://localhost:5173/
echo Backend Docs: http://127.0.0.1:8000/docs
echo ====================================================
echo.
pause
