# Start Vision Service in background
Write-Host "Starting Vision Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot'; python vision-service.py"

Start-Sleep -Seconds 3

# Start Backend in background
Write-Host "Starting Backend Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend-gemini'; npm start"

Start-Sleep -Seconds 3

# Start Frontend in background
Write-Host "Starting Frontend Service..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; npm run dev"

Write-Host "`nAll services started!" -ForegroundColor Cyan
Write-Host "Vision Service: http://localhost:5000" -ForegroundColor Yellow
Write-Host "Backend: http://localhost:3000" -ForegroundColor Yellow
Write-Host "Frontend: Check the frontend terminal for the URL" -ForegroundColor Yellow
Write-Host "`nPress any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
