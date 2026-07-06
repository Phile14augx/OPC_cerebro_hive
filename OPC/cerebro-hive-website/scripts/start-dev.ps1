# ==============================================================================
# CerebroHive -- Development Server
# Starts the Next.js dev server (API routes + frontend together on port 3000)
# ==============================================================================

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host "   CerebroHive  --  DEV SERVER                               " -ForegroundColor Cyan
Write-Host "  ============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "  [DEV]  Starting development server..." -ForegroundColor Yellow
Write-Host "  [INFO] Frontend + API routes both served at http://localhost:3000" -ForegroundColor Gray
Write-Host "  [INFO] Hot-reload enabled via Turbopack" -ForegroundColor Gray
Write-Host "  [INFO] Data persists to: $ProjectRoot\data\db.json" -ForegroundColor Gray
Write-Host "  [TIP]  Press Ctrl+C to stop the server" -ForegroundColor DarkGray
Write-Host ""

# Ensure node_modules exists
if (-not (Test-Path "$ProjectRoot\node_modules")) {
    Write-Host "  [WARN] node_modules not found. Running npm install first..." -ForegroundColor Yellow
    Set-Location $ProjectRoot
    npm install
}

# Ensure data directory exists (so DB can write on first request)
if (-not (Test-Path "$ProjectRoot\data")) {
    New-Item -ItemType Directory -Path "$ProjectRoot\data" | Out-Null
    Write-Host "  [INFO] Created data/ directory for JSON database" -ForegroundColor Gray
}

Set-Location $ProjectRoot
npm run dev
