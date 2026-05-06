# Casa MX - Start Backend and Frontend Servers

param(
    [switch]$SkipDocker
)

$frontendPath = (Resolve-Path -Path $PSScriptRoot).Path
$workspaceRoot = Split-Path -Path $frontendPath -Parent
$backendPath = Join-Path -Path $workspaceRoot -ChildPath 'casa-mx-backend'
$checkNodeScript = Join-Path -Path $frontendPath -ChildPath 'scripts\check-node-version.js'

if (-not (Test-Path $backendPath)) {
    Write-Host "Backend folder not found: $backendPath" -ForegroundColor Red
    exit 1
}

Write-Host "Starting Casa MX servers..." -ForegroundColor Cyan

# Attempt to switch to Node 20 automatically via nvm-windows (if installed)
$nvmExe = Join-Path -Path $env:LOCALAPPDATA -ChildPath 'nvm\nvm.exe'
if (Test-Path $nvmExe) {
    Write-Host "`nnvm detected. Switching to Node 20.19.0..." -ForegroundColor Yellow
    $env:NVM_HOME = Join-Path -Path $env:LOCALAPPDATA -ChildPath 'nvm'
    $env:NVM_SYMLINK = 'C:\nvm4w\nodejs'
    $env:Path = "$env:NVM_HOME;$env:NVM_SYMLINK;" + $env:Path
    & $nvmExe use 20.19.0 | Out-Null
}

# Validate Node version for both apps (requires 18-20)
Write-Host "`nValidating Node.js version compatibility..." -ForegroundColor Yellow
node $checkNodeScript
if ($LASTEXITCODE -ne 0) {
    Write-Host "Incompatible Node version detected. Use Node 18-20 and retry." -ForegroundColor Red
    exit 1
}
Write-Host "Node.js version is compatible" -ForegroundColor Green

if (-not $SkipDocker) {
    Write-Host "`nStarting PostgreSQL and Redis via Docker..." -ForegroundColor Yellow
    Push-Location $backendPath
    docker compose up -d postgres redis
    $composeExitCode = $LASTEXITCODE
    Pop-Location

    if ($composeExitCode -ne 0) {
        Write-Host "Failed to start Docker services. Use -SkipDocker if services are already running." -ForegroundColor Red
        exit 1
    }

    Write-Host "Docker services started" -ForegroundColor Green
    Write-Host "`nWaiting for services to initialize..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
}

# Start backend server
Write-Host "`nStarting backend server on port 3001..." -ForegroundColor Yellow
Start-Process -FilePath 'powershell' -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$backendPath'; npm run dev"
) -WindowStyle Normal

# Give backend a short head start
Start-Sleep -Seconds 3

# Start frontend server
Write-Host "`nStarting frontend server on port 3000..." -ForegroundColor Yellow
Start-Process -FilePath 'powershell' -ArgumentList @(
    '-NoExit',
    '-Command',
    "Set-Location '$frontendPath'; npm run dev"
) -WindowStyle Normal

Write-Host "`nAll servers start commands executed." -ForegroundColor Green
Write-Host "Backend:  http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Use Ctrl+C in each launched PowerShell window to stop servers." -ForegroundColor Yellow
