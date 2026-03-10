# Casa MX - Start Backend and Frontend Servers
# Run this script from the casa-mx directory

Write-Host "🚀 Starting Casa MX Servers..." -ForegroundColor Cyan

# Start PostgreSQL via Docker in backend
Write-Host "`n📦 Starting PostgreSQL database..." -ForegroundColor Yellow
Push-Location ..\casa-mx-backend
docker compose up -d
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start PostgreSQL" -ForegroundColor Red
    Pop-Location
    exit 1
}
Write-Host "✅ PostgreSQL started" -ForegroundColor Green

# Wait for database to be ready
Write-Host "`n⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Start backend server
Write-Host "`n🔧 Starting backend server on port 3001..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd ..\casa-mx-backend; npm run dev" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 5

Pop-Location

# Start frontend server
Write-Host "`n🎨 Starting frontend server on port 3000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd $PWD; npm run dev" -WindowStyle Normal

Write-Host "`n✅ All servers started!" -ForegroundColor Green
Write-Host "`nBackend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "`nPress Ctrl+C in each PowerShell window to stop servers" -ForegroundColor Yellow
