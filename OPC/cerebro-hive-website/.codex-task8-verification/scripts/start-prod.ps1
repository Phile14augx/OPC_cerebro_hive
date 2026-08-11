# ==============================================================================
# CerebroHive -- Production Build + Start
# Compiles a production-optimised bundle, then serves it on port 3000
# Run this on the server / before deploying
# ==============================================================================

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot

Write-Host ""
Write-Host "  ============================================================" -ForegroundColor Magenta
Write-Host "   CerebroHive  --  PRODUCTION  BUILD  +  START              " -ForegroundColor Magenta
Write-Host "  ============================================================" -ForegroundColor Magenta
Write-Host ""

# -- Pre-flight checks ---------------------------------------------------------

if (-not (Test-Path "$ProjectRoot\node_modules")) {
    Write-Host "  [WARN] node_modules missing. Installing dependencies..." -ForegroundColor Yellow
    Set-Location $ProjectRoot
    npm install
}

if (-not (Test-Path "$ProjectRoot\data")) {
    New-Item -ItemType Directory -Path "$ProjectRoot\data" | Out-Null
    Write-Host "  [INFO] Created data/ directory" -ForegroundColor Gray
}

Set-Location $ProjectRoot

# -- Build ---------------------------------------------------------------------

Write-Host "  [BUILD] Compiling production bundle..." -ForegroundColor Cyan
Write-Host "  [INFO]  This may take 30-60 seconds on first run" -ForegroundColor Gray
Write-Host ""

$buildStart = Get-Date
npm run build
$buildDuration = [math]::Round(((Get-Date) - $buildStart).TotalSeconds, 1)

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "  [ERROR] Build failed. Fix the errors above and try again." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "  [BUILD] Completed in ${buildDuration}s" -ForegroundColor Green

# -- Start ---------------------------------------------------------------------

Write-Host ""
Write-Host "  [START] Launching production server on http://localhost:3000" -ForegroundColor Green
Write-Host "  [INFO]  API routes + frontend are both served by Next.js" -ForegroundColor Gray
Write-Host "  [INFO]  Data persists to: $ProjectRoot\data\db.json" -ForegroundColor Gray
Write-Host "  [TIP]   Press Ctrl+C to stop" -ForegroundColor DarkGray
Write-Host ""

npm run start
