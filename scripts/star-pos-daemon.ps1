# ===================================================================
#  BONBON FLOWERS HOUSTON - STAR MICRONICS TSP143IIILAN DAEMON (PowerShell)
#  100% Nativo de Windows 10/11 - Sin dependencias externas
# ===================================================================

[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$Host.UI.RawUI.WindowTitle = "Bonbon Flowers - Star TSP100III LAN Daemon"

function Get-ActivePrinterIp {
    if ($env:PRINTER_IP) { return $env:PRINTER_IP }
    $candidates = @('10.0.0.72', '169.254.198.78', '10.0.0.200', '192.168.1.150')
    foreach ($cand in $candidates) {
        try {
            $t = New-Object System.Net.Sockets.TcpClient
            if ($t.ConnectAsync($cand, 9100).Wait(1200)) {
                $t.Close()
                return $cand
            }
            $t.Close()
        } catch {}
    }
    return "10.0.0.72"
}

$PRINTER_IP = Get-ActivePrinterIp
$PRINTER_PORT = 9100
$API_BASE = if ($env:STAR_API_URL) { $env:STAR_API_URL } else { "https://www.bonbonflowershouston.com/api/pos/printer" }
$POLL_INTERVAL_SEC = 4

Write-Host ""
Write-Host "===================================================================" -ForegroundColor Green
Write-Host "   🌹 BONBON FLOWERS HOUSTON - STAR TSP143III TICKET DAEMON 🌹" -ForegroundColor Cyan
Write-Host "   Impresora LAN:    $PRINTER_IP:$PRINTER_PORT (TCP RAW)" -ForegroundColor Yellow
Write-Host "   Modo:             Star GraphicMode Raster (576 dots / Eco-Paper)" -ForegroundColor Yellow
Write-Host "   Nube API:         $API_BASE" -ForegroundColor Yellow
Write-Host "===================================================================" -ForegroundColor Green
Write-Host ""

function Send-BytesToPrinter([byte[]]$bytes, [string]$ip, [int]$port) {
    try {
        $client = New-Object System.Net.Sockets.TcpClient
        $connectTask = $client.ConnectAsync($ip, $port)
        if (-not $connectTask.Wait(4000)) {
            $client.Close()
            throw "Timeout conectando a $ip`:$port"
        }
        $stream = $client.GetStream()
        $stream.Write($bytes, 0, $bytes.Length)
        $stream.Flush()
        Start-Sleep -Milliseconds 350
        $stream.Close()
        $client.Close()
        return $true
    } catch {
        Write-Host "[-] Error enviando a impresora: $_" -ForegroundColor Red
        return $false
    }
}

function Run-TestPrint {
    Write-Host "[*] Descargando ticket de prueba Star Graphic Raster..." -ForegroundColor Cyan
    try {
        $testUrl = "$API_BASE`?test=true&format=raw"
        $wc = New-Object System.Net.WebClient
        $rawBytes = $wc.DownloadData($testUrl)
        Write-Host "[*] Enviando $( $rawBytes.Length ) bytes a $PRINTER_IP`:$PRINTER_PORT..." -ForegroundColor Cyan
        $ok = Send-BytesToPrinter $rawBytes $PRINTER_IP $PRINTER_PORT
        if ($ok) {
            Write-Host "[+] ¡Ticket de prueba impreso y cortado exitosamente!" -ForegroundColor Green
        }
    } catch {
        Write-Host "[-] Error en ticket de prueba: $_" -ForegroundColor Red
    }
}

if ($args -contains "--test") {
    Run-TestPrint
    exit 0
}

Write-Host "[1] Iniciando escucha de pedidos en tiempo real..." -ForegroundColor Green
Write-Host "    (Deja esta ventana abierta. Cada pedido se imprimirá solo)" -ForegroundColor DarkGray
Write-Host "    Presiona Ctrl+C para detener.`n" -ForegroundColor DarkGray

# Probar conexión inicial
Write-Host "[*] Verificando conexion con la impresora en $PRINTER_IP`:$PRINTER_PORT..." -ForegroundColor Gray
try {
    $testSock = New-Object System.Net.Sockets.TcpClient
    $con = $testSock.ConnectAsync($PRINTER_IP, $PRINTER_PORT)
    if ($con.Wait(2500)) {
        $testSock.Close()
        Write-Host "[+] Impresora Star TSP100III LAN ONLINE en $PRINTER_IP`:$PRINTER_PORT" -ForegroundColor Green
    } else {
        $testSock.Close()
        Write-Host "[!] Advertencia: La impresora no respondió en $PRINTER_IP`:$PRINTER_PORT en 2.5s. Revisa cable de red." -ForegroundColor Yellow
    }
} catch {
    Write-Host "[!] Advertencia de red: $_" -ForegroundColor Yellow
}

$loopCount = 0
while ($true) {
    try {
        $loopCount++
        $wc = New-Object System.Net.WebClient
        $wc.Headers.Add("User-Agent", "Star-POS-Daemon/1.0")
        $jsonStr = $wc.DownloadString("$API_BASE`?limit=5")
        $data = $jsonStr | ConvertFrom-Json

        if ($data.success -and $data.orders -and $data.orders.Count -gt 0) {
            Write-Host "`n[!] Detectadas $( $data.orders.Count ) ordenes pendientes!" -ForegroundColor Magenta
            foreach ($order in $data.orders) {
                $orderId = $order.orderId
                Write-Host "[*] Procesando orden #$orderId ($($order.customerName))..." -ForegroundColor Cyan
                
                # Descargar binario raster
                $rawUrl = "$API_BASE`?orderId=$orderId&format=raw"
                $orderBytes = $wc.DownloadData($rawUrl)
                
                $sent = Send-BytesToPrinter $orderBytes $PRINTER_IP $PRINTER_PORT
                if ($sent) {
                    Write-Host "[+] Ticket impreso para orden #$orderId" -ForegroundColor Green
                    # Confirmar ACK
                    $ackBody = @{ action = "ack"; orderId = $orderId } | ConvertTo-Json
                    $wcAck = New-Object System.Net.WebClient
                    $wcAck.Headers.Add("Content-Type", "application/json")
                    $null = $wcAck.UploadString($API_BASE, "POST", $ackBody)
                    Write-Host "[+] Orden #$orderId confirmada (ACK) en la nube." -ForegroundColor Green
                } else {
                    Write-Host "[-] No se pudo imprimir la orden #$orderId. Se reintentará en el próximo ciclo." -ForegroundColor Red
                }
            }
        } else {
            if ($loopCount % 15 -eq 0) {
                Write-Host "[-] Esperando nuevos pedidos... ($([DateTime]::Now.ToString('HH:mm:ss')))" -ForegroundColor DarkGray
            }
        }
    } catch {
        # Error silencioso en polling
    }

    Start-Sleep -Seconds $POLL_INTERVAL_SEC
}
