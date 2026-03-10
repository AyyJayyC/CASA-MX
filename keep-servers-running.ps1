# Script to keep both frontend and backend servers running
# Run this script in PowerShell to maintain continuous server operation

$BackendDir = "c:\Users\axelj\casa-mx-backend"
$FrontendDir = "c:\Users\axelj\casa-mx"
$MaxRestarts = 0  # Unlimited restarts

$BackendProcess = $null
$FrontendProcess = $null

function Start-Backend {
    Write-Host "🚀 Starting Backend Server..." -ForegroundColor Green
    Push-Location $BackendDir
    $global:BackendProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow -PassThru
    Pop-Location
    Write-Host "✓ Backend started (PID: $($global:BackendProcess.Id))" -ForegroundColor Green
    Start-Sleep -Seconds 3
}

function Start-Frontend {
    Write-Host "🚀 Starting Frontend Server..." -ForegroundColor Green
    Push-Location $FrontendDir
    $global:FrontendProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -NoNewWindow -PassThru
    Pop-Location
    Write-Host "✓ Frontend started (PID: $($global:FrontendProcess.Id))" -ForegroundColor Green
    Start-Sleep -Seconds 3
}

function Monitor-Servers {
    while ($true) {
        $BackendRunning = $global:BackendProcess -and -not $global:BackendProcess.HasExited
        $FrontendRunning = $global:FrontendProcess -and -not $global:FrontendProcess.HasExited
        
        if (-not $BackendRunning) {
            Write-Host "❌ Backend crashed or not running. Restarting..." -ForegroundColor Red
            Start-Backend
        }
        
        if (-not $FrontendRunning) {
            Write-Host "❌ Frontend crashed or not running. Restarting..." -ForegroundColor Red
            Start-Frontend
        }
        
        # Verify ports are listening
        $Backend3001 = Get-NetTCPConnection -LocalPort 3001 -State Listen -ErrorAction SilentlyContinue
        $Frontend3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
        
        if (-not $Backend3001) {
            Write-Host "⚠️  Backend port 3001 not listening. Restarting..." -ForegroundColor Yellow
            if ($global:BackendProcess) { Stop-Process -Id $global:BackendProcess.Id -Force -ErrorAction SilentlyContinue }
            Start-Backend
        }
        
        if (-not $Frontend3000) {
            Write-Host "⚠️  Frontend port 3000 not listening. Restarting..." -ForegroundColor Yellow
            if ($global:FrontendProcess) { Stop-Process -Id $global:FrontendProcess.Id -Force -ErrorAction SilentlyContinue }
            Start-Frontend
        }
        
        # Check every 10 seconds
        Start-Sleep -Seconds 10
    }
}

# Cleanup function
function Stop-Servers {
    Write-Host "`n🛑 Stopping servers..." -ForegroundColor Yellow
    if ($global:BackendProcess) { Stop-Process -Id $global:BackendProcess.Id -Force -ErrorAction SilentlyContinue }
    if ($global:FrontendProcess) { Stop-Process -Id $global:FrontendProcess.Id -Force -ErrorAction SilentlyContinue }
    Write-Host "✓ Servers stopped" -ForegroundColor Green
}

# Register cleanup on exit
$null = Register-EngineEvent -SourceIdentifier PowerShell.Exiting -Action { Stop-Servers }

# Main execution
Clear-Host
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     CASA MX - Server Monitor & Auto-Restart Script         ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Blue
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Blue
Write-Host ""
Write-Host "This script will keep both servers running and restart them if they crash." -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow
Write-Host ""

# Start both servers
Start-Backend
Start-Frontend

# Monitor servers
Monitor-Servers
