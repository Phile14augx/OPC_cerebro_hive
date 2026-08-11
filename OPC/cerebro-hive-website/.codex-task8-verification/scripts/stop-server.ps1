# ==============================================================================
# CerebroHive -- Stop / Kill Server
# Terminates any Node.js process using port 3000
# ==============================================================================

$ErrorActionPreference = "SilentlyContinue"

Write-Host ""
Write-Host "  [STOP] Looking for processes on port 3000..." -ForegroundColor Yellow

$port = 3000
$connections = netstat -ano | Select-String ":$port\s" | Select-String "LISTENING"

if (-not $connections) {
    Write-Host "  [INFO] No server running on port $port" -ForegroundColor Gray
    Write-Host ""
    exit 0
}

$pids = $connections | ForEach-Object {
    ($_ -split "\s+")[-1]
} | Sort-Object -Unique

foreach ($processId in $pids) {
    if ($processId -match "^\d+$") {
        $proc = Get-Process -Id $processId -ErrorAction SilentlyContinue
        if ($proc) {
            Write-Host "  [KILL] Stopping process: $($proc.Name) (PID $processId)" -ForegroundColor Red
            Stop-Process -Id $processId -Force
        }
    }
}

Write-Host "  [DONE] Server stopped. Port 3000 is now free." -ForegroundColor Green
Write-Host ""
