@echo off
:: CerebroHive — Stop Server (double-click to run)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop-server.ps1"
pause
