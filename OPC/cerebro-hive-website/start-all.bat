@echo off
REM Starts both the website and the AgentOS backend, then opens the live-runtime page.
cd /d "%~dp0"

call "%~dp0start-agentos-backend.bat"
call "%~dp0start-website.bat"
