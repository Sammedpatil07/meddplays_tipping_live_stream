# MEDDplays Tipping Platform - Start Script
# Set Node.js path
$env:PATH = "E:\Apps\nodejs\node-v20.17.0-win-x64;" + $env:PATH

Write-Host ""
Write-Host "Starting MEDDplays Tipping Platform..." -ForegroundColor Magenta
Write-Host ""

# Start Backend
Write-Host "Starting Backend on port 5000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `$env:PATH = 'E:\Apps\nodejs\node-v20.17.0-win-x64;' + `$env:PATH; Set-Location 'E:\MEDDplays_Tipping\backend'; npm run dev"

# Wait for backend to start
Start-Sleep -Seconds 3

# Start Frontend
Write-Host "Starting Frontend on port 5173..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit -Command `$env:PATH = 'E:\Apps\nodejs\node-v20.17.0-win-x64;' + `$env:PATH; Set-Location 'E:\MEDDplays_Tipping\frontend'; npm run dev"

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host ""
Write-Host "Audience Tip Page   ->  http://localhost:5173"       -ForegroundColor Yellow
Write-Host "Streamer Login      ->  http://localhost:5173/login"  -ForegroundColor Yellow
Write-Host "Streamer Dashboard  ->  http://localhost:5173/dashboard" -ForegroundColor Yellow
Write-Host ""
Write-Host "Dashboard password: meddplays2024" -ForegroundColor Gray
Write-Host "(Change it in backend\.env -> STREAMER_PASSWORD)" -ForegroundColor Gray
Write-Host ""
