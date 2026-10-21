@echo off
TITLE Bonbon Flowers - Star Micronics TSP143III Daemon
COLOR 0A
echo ===================================================================
echo     BONBON FLOWERS HOUSTON - STAR MICRONICS TSP143III POS
echo ===================================================================
echo.

where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Iniciando con Python...
    python "%~dp0star-pos-daemon.py"
    pause
    exit /b
)

where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Iniciando con Node.js...
    node "%~dp0star-pos-daemon.js"
    pause
    exit /b
)

echo [ERROR] No se encontro Python ni Node.js instalado en tu computadora.
echo Por favor instala Python 3 (python.org) o Node.js para ejecutar el daemon.
pause
