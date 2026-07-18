@echo off
REM Starts the CerebroHive Next.js website and opens the AgentOS live-runtime page.
cd /d "%~dp0"

if not exist "node_modules" (
    echo Installing dependencies (first run only)...
    call npm install
)

echo Starting CerebroHive website on http://localhost:3000 ...
start "CerebroHive Website" cmd /k "npm run dev"

timeout /t 6 /nobreak >nul
start "" "http://localhost:3000/platform/live-runtime"
