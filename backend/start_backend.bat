@echo off
echo Starting SEBI PIT Engine Backend on http://localhost:8000...
cd /d "%~dp0"
call venv\Scripts\activate.bat
python -m uvicorn app.main:app --reload --port 8000
