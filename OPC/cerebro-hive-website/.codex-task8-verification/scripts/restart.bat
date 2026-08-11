@echo off
echo ==============================================
echo [CerebroHive] Stopping and Restarting Next.js
echo ==============================================
echo.

echo [1/2] Looking for processes on port 3000...
set "pid_found="
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3000 ^| findstr LISTENING') do (
    set "pid_found=%%a"
)

if defined pid_found (
    echo Found process with PID %pid_found% listening on port 3000.
    echo Stopping PID %pid_found%...
    taskkill /F /PID %pid_found%
) else (
    echo No process found listening on port 3000.
)

echo.
echo [2/2] Starting CerebroHive website (npm run dev)...
npm run dev
