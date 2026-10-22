@echo off
TITLE Bonbon Flowers - Star Micronics TSP143III LAN Daemon
COLOR 0A
SET PRINTER_IP=10.0.0.72
SET PRINTER_PORT=9100

:menu
cls
echo ===================================================================
echo     BONBON FLOWERS HOUSTON - STAR MICRONICS TSP143III LAN POS
echo ===================================================================
echo   IP Configurada: %PRINTER_IP%:%PRINTER_PORT% (Star Graphic Raster)
echo ===================================================================
echo.
echo   [1] Iniciar Monitor de Pedidos Automatico (Recomendado)
echo   [2] Imprimir Ticket de Prueba Inmediato (Test 80mm Eco-Paper)
echo   [3] Cambiar IP de la Impresora
echo   [4] Salir
echo.
set /p opt="Selecciona una opcion (1, 2, 3 o 4, Enter para 1): "

if "%opt%"=="2" goto test_print
if "%opt%"=="3" goto change_ip
if "%opt%"=="4" exit /b
goto run_daemon

:change_ip
echo.
set /p NEW_IP="Ingresa la nueva direccion IP (ej. 10.0.0.72): "
if not "%NEW_IP%"=="" set PRINTER_IP=%NEW_IP%
echo IP actualizada a %PRINTER_IP%
timeout /t 2 >nul
goto menu

:test_print
echo.
echo ===================================================================
echo   [TEST] Enviando Ticket Eco-Paper a %PRINTER_IP%:%PRINTER_PORT%
echo ===================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Write-Host '[*] Descargando ticket Star Graphic Raster (576 dots)...' -ForegroundColor Cyan; try { $wc = New-Object System.Net.WebClient; $rawBytes = $wc.DownloadData('https://www.bonbonflowershouston.com/api/pos/printer?test=true&format=raw'); Write-Host \"[*] Conectando por cable LAN a %PRINTER_IP%:%PRINTER_PORT%...\" -ForegroundColor Cyan; $client = New-Object System.Net.Sockets.TcpClient; $task = $client.ConnectAsync('%PRINTER_IP%', %PRINTER_PORT%); if (-not $task.Wait(4500)) { throw 'Timeout conectando a %PRINTER_IP%:%PRINTER_PORT%' }; $stream = $client.GetStream(); $stream.Write($rawBytes, 0, $rawBytes.Length); $stream.Flush(); Start-Sleep -Milliseconds 400; $stream.Close(); $client.Close(); Write-Host '' ; Write-Host '[+] EXITO: Ticket impreso y cortado al ras en Star TSP100III!' -ForegroundColor Green; Write-Host '' } catch { Write-Host '' ; Write-Host \"[-] ERROR: $_\" -ForegroundColor Red; Write-Host '[-] Verifica que la impresora este encendida y conectada con cable de red en %PRINTER_IP%.' -ForegroundColor Yellow; Write-Host '' }"
echo.
echo Presiona cualquier tecla para volver al menu...
pause >nul
goto menu

:run_daemon
echo.
echo ===================================================================
echo   [*] Preparando Monitor de Pedidos en Segundo Plano...
echo ===================================================================
echo.

REM 1. Si no existe star-pos-daemon.ps1 en la carpeta, descargarlo automaticamente
if not exist "%~dp0star-pos-daemon.ps1" (
    echo [*] Descargando componente star-pos-daemon.ps1...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { (New-Object System.Net.WebClient).DownloadFile('https://www.bonbonflowershouston.com/api/pos/printer?download=ps1', '%~dp0star-pos-daemon.ps1'); Write-Host '[+] Componente descargado exitosamente.' -ForegroundColor Green } catch { Write-Host '[-] No se pudo descargar el archivo auxiliar, ejecutando en modo directo.' -ForegroundColor Yellow }"
)

REM 2. Si existe el archivo .ps1, ejecutarlo con paso de parametros
if exist "%~dp0star-pos-daemon.ps1" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0star-pos-daemon.ps1"
    pause
    goto menu
)

REM 3. Fallback: Ejecutar el bucle de escucha directamente en PowerShell inline
echo [*] Iniciando escucha directa de pedidos en https://www.bonbonflowershouston.com...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ip = '%PRINTER_IP%'; $port = %PRINTER_PORT%; $api = 'https://www.bonbonflowershouston.com/api/pos/printer'; Write-Host \"[*] Monitor activo para $ip`:$port\" -ForegroundColor Green; while ($true) { try { $wc = New-Object System.Net.WebClient; $json = $wc.DownloadString(\"$api`?limit=5\") | ConvertFrom-Json; if ($json.success -and $json.orders -and $json.orders.Count -gt 0) { foreach ($ord in $json.orders) { Write-Host \"[+] Imprimiendo pedido #$($ord.orderId)...\" -ForegroundColor Magenta; $bytes = $wc.DownloadData(\"$api`?orderId=$($ord.orderId)&format=raw\"); $tcp = New-Object System.Net.Sockets.TcpClient; if ($tcp.ConnectAsync($ip, $port).Wait(4000)) { $s = $tcp.GetStream(); $s.Write($bytes, 0, $bytes.Length); $s.Flush(); Start-Sleep -Milliseconds 350; $s.Close(); $tcp.Close(); $ack = @{ action = 'ack'; orderId = $ord.orderId } | ConvertTo-Json; $null = $wc.UploadString($api, 'POST', $ack); Write-Host \"[+] Pedido #$($ord.orderId) impreso y confirmado.\" -ForegroundColor Green; } else { $tcp.Close(); Write-Host '[-] Error de conexion con impresora.' -ForegroundColor Red; } } } } catch {} Start-Sleep -Seconds 4 }"

pause
goto menu
