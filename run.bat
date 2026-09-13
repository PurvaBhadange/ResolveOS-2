@echo off
title ResolveAI Launcher
echo ==========================================================
echo   Starting ResolveAI Autonomous Customer Resolution Engine
echo ==========================================================

echo [1/2] Launching FastAPI Backend on http://localhost:8001...
start "ResolveAI Backend" powershell -NoExit -Command "cd '%~dp0backend'; .\.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

timeout /t 2 /nobreak >nul

echo [2/2] Launching Next.js Frontend on http://localhost:3000...
start "ResolveAI Frontend" powershell -NoExit -Command "cd '%~dp0frontend'; npm run dev"

echo.
echo [SUCCESS] ResolveAI services launched!
echo   - Frontend Portal:  http://localhost:3000
echo   - Backend Swagger:  http://localhost:8001/docs
echo.
