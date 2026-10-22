@echo off
TITLE Bonbon Flowers - Star Micronics TSP143III LAN POS
COLOR 0A
SET PRINTER_IP=10.0.0.100
SET ALT_IP=10.0.0.72
SET PRINTER_PORT=9100

:menu
cls
echo ===================================================================
echo     BONBON FLOWERS HOUSTON - STAR MICRONICS TSP143III LAN POS
echo ===================================================================
echo   IP Principal: %PRINTER_IP%:%PRINTER_PORT%
echo   IP Alterna:   %ALT_IP%:%PRINTER_PORT%
echo   Hardware MAC: 00:11:62:4D:A8:30 (Star TSP100III LAN)
echo ===================================================================
echo.
echo   [1] Iniciar Monitor de Pedidos Automatico (Segundo Plano)
echo   [2] Probar Ticket en IP Principal (%PRINTER_IP%)
echo   [3] Probar Ticket en IP Alterna   (%ALT_IP%)
echo   [4] Auto-Escanear Red y Detectar Impresora (Puerto 9100)
echo   [5] Cambiar IP Manualmente
echo   [6] Salir
echo.
set /p opt="Selecciona una opcion (1-6, Enter para 1): "

if "%opt%"=="2" goto test_primary
if "%opt%"=="3" goto test_alt
if "%opt%"=="4" goto scan_network
if "%opt%"=="5" goto change_ip
if "%opt%"=="6" exit /b
goto run_daemon

:change_ip
echo.
set /p NEW_IP="Ingresa la nueva direccion IP: "
if not "%NEW_IP%"=="" set PRINTER_IP=%NEW_IP%
echo IP Principal actualizada a %PRINTER_IP%
timeout /t 2 >nul
goto menu

:test_primary
set TARGET_IP=%PRINTER_IP%
goto do_print_test

:test_alt
set TARGET_IP=%ALT_IP%
goto do_print_test

:do_print_test
echo.
echo ===================================================================
echo   [TEST] Enviando Ticket Eco-Paper a %TARGET_IP%:%PRINTER_PORT%
echo ===================================================================
echo.
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; Write-Host '[*] Descargando ticket Star Graphic Raster (576 dots)...' -ForegroundColor Cyan; try { $wc = New-Object System.Net.WebClient; $rawBytes = $wc.DownloadData('https://www.bonbonflowershouston.com/api/pos/printer?test=true&format=raw'); Write-Host \"[*] Conectando por cable LAN a %TARGET_IP%:%PRINTER_PORT%...\" -ForegroundColor Cyan; $client = New-Object System.Net.Sockets.TcpClient; $task = $client.ConnectAsync('%TARGET_IP%', %PRINTER_PORT%); if (-not $task.Wait(4500)) { throw 'Timeout conectando a %TARGET_IP%:%PRINTER_PORT%' }; $stream = $client.GetStream(); $stream.Write($rawBytes, 0, $rawBytes.Length); $stream.Flush(); Start-Sleep -Milliseconds 400; $stream.Close(); $client.Close(); Write-Host '' ; Write-Host '[+] EXITO: Ticket impreso y cortado al ras en Star TSP100III!' -ForegroundColor Green; Write-Host '' } catch { Write-Host '' ; Write-Host \"[-] ERROR: $_\" -ForegroundColor Red; Write-Host '[-] La impresora no respondio en %TARGET_IP%. Prueba con la otra opcion del menu.' -ForegroundColor Yellow; Write-Host '' }"
echo.
echo Presiona cualquier tecla para volver al menu...
pause >nul
goto menu

:scan_network
echo.
echo ===================================================================
echo   [*] Escaneando puertos 9100 y tabla ARP local...
echo ===================================================================
powershell -NoProfile -ExecutionPolicy Bypass -Command "$candidates = @('%PRINTER_IP%', '%ALT_IP%', '10.0.0.200', '10.0.0.100', '10.0.0.50', '192.168.1.150'); Write-Host '[*] Buscando impresora termica en puertos RAW 9100...' -ForegroundColor Cyan; $found = $null; foreach ($ip in $candidates) { Write-Host \"    Probando $ip`:9100...\" -NoNewline -ForegroundColor Gray; try { $tcp = New-Object System.Net.Sockets.TcpClient; $t = $tcp.ConnectAsync($ip, 9100); if ($t.Wait(1200)) { $tcp.Close(); Write-Host ' [ENCONTRADA!]' -ForegroundColor Green; $found = $ip; break } else { $tcp.Close(); Write-Host ' (Sin respuesta)' -ForegroundColor DarkGray } } catch { Write-Host ' (No disponible)' -ForegroundColor DarkGray } }; if ($found) { Write-Host ''; Write-Host \"[+] Impresora Star TSP100III LAN ONLINE en: $found\" -ForegroundColor Green; Write-Host \"    Usa esta IP en tu configuracion de Windows o en este script.\" -ForegroundColor Yellow } else { Write-Host ''; Write-Host '[-] No se detecto respuesta en las IPs estandar.' -ForegroundColor Yellow; Write-Host '    Consejo: Realiza el Self-Test fisico en la impresora:' -ForegroundColor Gray; Write-Host '    1. Apagala con el switch lateral.' -ForegroundColor Gray; Write-Host '    2. Manten presionado FEED y enciendela.' -ForegroundColor Gray; Write-Host '    3. Saldra una hoja con la IP exacta asignada por el router.' -ForegroundColor Gray }"
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

if not exist "%~dp0star-pos-daemon.ps1" (
    echo [*] Descargando componente star-pos-daemon.ps1...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; try { (New-Object System.Net.WebClient).DownloadFile('https://www.bonbonflowershouston.com/api/pos/printer?download=ps1', '%~dp0star-pos-daemon.ps1'); Write-Host '[+] Componente descargado exitosamente.' -ForegroundColor Green } catch { Write-Host '[-] No se pudo descargar el archivo auxiliar, ejecutando en modo directo.' -ForegroundColor Yellow }"
)

if exist "%~dp0star-pos-daemon.ps1" (
    powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0star-pos-daemon.ps1"
    pause
    goto menu
)

echo [*] Iniciando escucha directa de pedidos en https://www.bonbonflowershouston.com...
powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; $ip = '%PRINTER_IP%'; $port = %PRINTER_PORT%; $api = 'https://www.bonbonflowershouston.com/api/pos/printer'; Write-Host \"[*] Monitor activo para $ip`:$port\" -ForegroundColor Green; while ($true) { try { $wc = New-Object System.Net.WebClient; $json = $wc.DownloadString(\"$api`?limit=5\") | ConvertFrom-Json; if ($json.success -and $json.orders -and $json.orders.Count -gt 0) { foreach ($ord in $json.orders) { Write-Host \"[+] Imprimiendo pedido #$($ord.orderId)...\" -ForegroundColor Magenta; $bytes = $wc.DownloadData(\"$api`?orderId=$($ord.orderId)&format=raw\"); $tcp = New-Object System.Net.Sockets.TcpClient; if ($tcp.ConnectAsync($ip, $port).Wait(4000)) { $s = $tcp.GetStream(); $s.Write($bytes, 0, $bytes.Length); $s.Flush(); Start-Sleep -Milliseconds 350; $s.Close(); $tcp.Close(); $ack = @{ action = 'ack'; orderId = $ord.orderId } | ConvertTo-Json; $null = $wc.UploadString($api, 'POST', $ack); Write-Host \"[+] Pedido #$($ord.orderId) impreso y confirmado.\" -ForegroundColor Green; } else { $tcp.Close(); Write-Host '[-] Error de conexion con impresora.' -ForegroundColor Red; } } } } catch {} Start-Sleep -Seconds 4 }"

pause
goto menu
