@echo off
echo ========================================
echo   Matgarco AI Service - Starting
echo ========================================
echo.

call venv\Scripts\activate.bat

echo Starting AI service on http://localhost:8000
echo Press Ctrl+C to stop
echo.
echo API Docs: http://localhost:8000/docs
echo Health:   http://localhost:8000/health
echo.

python main.py
