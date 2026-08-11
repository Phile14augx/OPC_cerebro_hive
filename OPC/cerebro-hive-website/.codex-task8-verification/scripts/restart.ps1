Write-Host "==============================================" -ForegroundColor Cyan
Write-Host "[CerebroHive] Stopping and Restarting Next.js" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Find process on port 3000
Write-Host "[1/2] Looking for process on port 3000..." -ForegroundColor Yellow
$connection = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($connection) {
    foreach ($conn in $connection) {
        $pidToKill = $conn.OwningProcess
        Write-Host "Found process with PID $pidToKill listening on port 3000." -ForegroundColor Yellow
        Write-Host "Stopping PID $pidToKill..." -ForegroundColor Red
        Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
    }
} else {
    Write-Host "No process found listening on port 3000." -ForegroundColor Green
}

# Start the dev server
Write-Host ""
Write-Host "[2/2] Starting CerebroHive website (npm run dev)..." -ForegroundColor Green
npm run dev
