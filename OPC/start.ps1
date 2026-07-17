param (
    [switch]$Hide
)

$windowStyle = if ($Hide) { "Hidden" } else { "Normal" }

Write-Host "Starting Cerebro Hive ecosystem..." -ForegroundColor Cyan

# Start the Go API Backend
$apiDir = Join-Path $PSScriptRoot "cerebroarchive\apps\api"
$apiProcess = Start-Process -FilePath "go" -ArgumentList "run cmd/api/main.go" -WorkingDirectory $apiDir -PassThru -WindowStyle $windowStyle
$apiProcess.Id | Out-File -FilePath (Join-Path $PSScriptRoot ".api.pid")
Write-Host "Go API started (PID: $($apiProcess.Id))" -ForegroundColor Green

# Start the Next.js Frontend
$webDir = Join-Path $PSScriptRoot "cerebro-hive-website"
$webProcess = Start-Process -FilePath "npm" -ArgumentList "run dev" -WorkingDirectory $webDir -PassThru -WindowStyle $windowStyle
$webProcess.Id | Out-File -FilePath (Join-Path $PSScriptRoot ".web.pid")
Write-Host "Next.js Web started (PID: $($webProcess.Id))" -ForegroundColor Green

Write-Host "`nAll services are running!" -ForegroundColor Cyan
Write-Host "API URL: http://localhost:8080"
Write-Host "Web URL: http://localhost:3000"
Write-Host "`nTo stop all services, run: .\stop.ps1" -ForegroundColor Yellow
