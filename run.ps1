Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Starting AI Placement Readiness Predictor" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host "[1/2] Starting FastAPI Backend on http://127.0.0.1:8000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\backend'; & '$ScriptDir\backend\venv\Scripts\python.exe' -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload"

Write-Host "[2/2] Starting React Vite Frontend on http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Set-Location '$ScriptDir\frontend'; npm run dev"

Write-Host ""
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host " Both servers launched in separate windows!" -ForegroundColor Green
Write-Host " Web Application: http://localhost:5173/" -ForegroundColor White
Write-Host " API Docs:        http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "====================================================" -ForegroundColor Cyan
