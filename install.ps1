# Install both frontend and backend dependencies
Write-Host "📦 Installing backend dependencies..." -ForegroundColor Cyan
Set-Location backend
npm install
Set-Location ..

Write-Host "📦 Installing frontend dependencies..." -ForegroundColor Cyan
Set-Location frontend
npm install
Set-Location ..

Write-Host "✅ All dependencies installed!" -ForegroundColor Green
Write-Host ""
Write-Host "⚠️  IMPORTANT: Update backend\.env with your Razorpay keys!" -ForegroundColor Yellow
Write-Host "   Get keys from: https://dashboard.razorpay.com/app/keys" -ForegroundColor Yellow
Write-Host ""
Write-Host "🚀 Run start.ps1 to launch the app" -ForegroundColor Cyan
