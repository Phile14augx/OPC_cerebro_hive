@echo off
REM Starts the real Python AgentOS backend (agentos/) and opens its API docs.
cd /d "%~dp0agentos"

if not exist ".venv" (
    echo Creating virtual environment...
    python -m venv .venv
)

call .venv\Scripts\activate.bat

echo Installing dependencies (safe to re-run)...
pip install -r requirements.txt --quiet

if not exist "agentos.db" (
    echo Seeding demo agents and policies...
    python scripts\seed.py
)

echo Starting AgentOS backend on http://localhost:8088 ...
start "AgentOS Backend" cmd /k "call .venv\Scripts\activate.bat && uvicorn app.main:app --reload --port 8088"

timeout /t 4 /nobreak >nul
start "" "http://localhost:8088/docs"
