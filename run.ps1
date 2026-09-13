# ResolveAI / ResolveOS Full-Stack Launcher
Write-Host "==========================================================" -ForegroundColor DarkYellow
Write-Host "  Starting ResolveAI Autonomous Customer Resolution Engine" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor DarkYellow

$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path

# 1. Start FastAPI Backend Server
Write-Host "[1/2] Launching FastAPI Backend on http://localhost:8001..." -ForegroundColor Green
$backendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\backend'; .\.venv\Scripts\uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload" -PassThru

# Wait 2 seconds
Start-Sleep -Seconds 2

# 2. Start Next.js Frontend Dev Server
Write-Host "[2/2] Launching Next.js Frontend on http://localhost:3000..." -ForegroundColor Green
$frontendProcess = Start-Process -FilePath "powershell" -ArgumentList "-NoExit", "-Command", "cd '$scriptPath\frontend'; npm run dev" -PassThru

Write-Host "`n[SUCCESS] ResolveAI is launching!" -ForegroundColor Cyan
Write-Host "  -> Frontend Portal:  http://localhost:3000" -ForegroundColor White
Write-Host "  -> Backend API Docs: http://localhost:8001/docs" -ForegroundColor White
Write-Host "  -> Neon DB Target:   ep-blue-glade-aybcwy7k-pooler.c-5.us-east-2.aws.neon.tech" -ForegroundColor White
Write-Host "  -> LLM Engine:       Mistral AI" -ForegroundColor White
