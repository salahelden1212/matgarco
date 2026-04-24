@echo off
echo ========================================
echo   Matgarco AI Service - Setup
echo ========================================
echo.

echo [1/3] Checking Python installation...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Python is not installed or not in PATH
    echo Download from: https://www.python.org/downloads/
    pause
    exit /b 1
)
echo OK: Python found
echo.

echo [2/3] Creating virtual environment...
if not exist "venv" (
    python -m venv venv
    echo OK: Virtual environment created
) else (
    echo OK: Virtual environment already exists
)
echo.

echo [3/3] Installing dependencies...
call venv\Scripts\activate.bat
pip install -r requirements.txt
echo.

echo ========================================
echo   Setup Complete!
echo ========================================
echo.
echo To start the AI service, run: start.bat
echo.
pause
