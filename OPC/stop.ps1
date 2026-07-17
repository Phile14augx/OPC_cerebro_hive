Write-Host "Stopping Cerebro Hive ecosystem..." -ForegroundColor Cyan

$apiPidFile = Join-Path $PSScriptRoot ".api.pid"
if (Test-Path $apiPidFile) {
    $apiPid = Get-Content $apiPidFile
    Write-Host "Stopping Go API (PID: $apiPid)..." -ForegroundColor Yellow
    # /T kills the process tree, /F forces termination
    taskkill /T /F /PID $apiPid 2>$null | Out-Null
    Remove-Item $apiPidFile -Force
    Write-Host "Go API stopped." -ForegroundColor Green
} else {
    Write-Host "Go API PID file not found." -ForegroundColor Gray
}

$webPidFile = Join-Path $PSScriptRoot ".web.pid"
if (Test-Path $webPidFile) {
    $webPid = Get-Content $webPidFile
    Write-Host "Stopping Next.js Web (PID: $webPid)..." -ForegroundColor Yellow
    taskkill /T /F /PID $webPid 2>$null | Out-Null
    Remove-Item $webPidFile -Force
    Write-Host "Next.js Web stopped." -ForegroundColor Green
} else {
    Write-Host "Next.js PID file not found." -ForegroundColor Gray
}

Write-Host "`nAll services successfully stopped!" -ForegroundColor Cyan
