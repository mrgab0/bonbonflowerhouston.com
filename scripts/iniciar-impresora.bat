@echo off
TITLE Bonbon Flowers - Star Micronics TSP143III LAN Daemon
COLOR 0A
SET PRINTER_IP=10.0.0.72
SET PRINTER_PORT=9100

echo ===================================================================
echo     BONBON FLOWERS HOUSTON - STAR MICRONICS TSP143III LAN POS
echo ===================================================================
echo   IP Configurada: %PRINTER_IP%:%PRINTER_PORT% (Star Graphic Raster)
echo ===================================================================
echo.
echo   [1] Iniciar Monitor de Pedidos Automatico (Recomendado)
echo   [2] Imprimir Ticket de Prueba Inmediato (Test)
echo   [3] Cambiar IP de la Impresora
echo.
set /p opt="Selecciona una opcion (1, 2 o 3, Enter para 1): "

if "%opt%"=="2" goto test_print
if "%opt%"=="3" goto change_ip
goto run_daemon

:change_ip
set /p NEW_IP="Ingresa la nueva direccion IP (ej. 10.0.0.72): "
if not "%NEW_IP%"=="" set PRINTER_IP=%NEW_IP%
echo IP actualizada a %PRINTER_IP%
pause
goto run_daemon

:test_print
echo.
echo [TEST] Enviando ticket de calibracion Eco-Paper a %PRINTER_IP%...
where powershell >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0star-pos-daemon.ps1" --test
    pause
    exit /b
)
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python "%~dp0star-pos-daemon.py" --test
    pause
    exit /b
)
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    node "%~dp0star-pos-daemon.js" --test
    pause
    exit /b
)
pause
exit /b

:run_daemon
echo.
echo [*] Conectando con la nube de Bonbon Flowers...
where powershell >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0star-pos-daemon.ps1"
    pause
    exit /b
)
where python >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    python "%~dp0star-pos-daemon.py"
    pause
    exit /b
)
where node >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    node "%~dp0star-pos-daemon.js"
    pause
    exit /b
)

echo [ERROR] No se encontro PowerShell, Python ni Node.js.
pause
