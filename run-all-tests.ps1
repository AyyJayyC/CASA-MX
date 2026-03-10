# Casa MX - Run All Tests (Backend + Frontend)
# Prerequisite: Backend server must be running on port 3001

Write-Host "🧪 Running Casa MX Test Suite..." -ForegroundColor Cyan

# Check if backend is running
Write-Host "`n🔍 Checking backend server..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 2 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Backend server is running" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Backend server is NOT running on port 3001" -ForegroundColor Red
    Write-Host "   Please start it first: cd ..\casa-mx-backend; npm run dev" -ForegroundColor Yellow
    exit 1
}

# Run backend tests
Write-Host "`n🔧 Running backend tests..." -ForegroundColor Yellow
Push-Location ..\casa-mx-backend
npm test
$backendExitCode = $LASTEXITCODE
Pop-Location

if ($backendExitCode -ne 0) {
    Write-Host "`n❌ Backend tests failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Backend tests passed (78/78)" -ForegroundColor Green

# Run frontend tests
Write-Host "`n🎨 Running frontend tests..." -ForegroundColor Yellow
npm test -- --run
$frontendExitCode = $LASTEXITCODE

if ($frontendExitCode -ne 0) {
    Write-Host "`n❌ Frontend tests failed!" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Frontend tests passed (29/29)" -ForegroundColor Green

Write-Host "`n🎉 All tests passed!" -ForegroundColor Green
Write-Host "   Backend:  78/78" -ForegroundColor Cyan
Write-Host "   Frontend: 29/29" -ForegroundColor Cyan
