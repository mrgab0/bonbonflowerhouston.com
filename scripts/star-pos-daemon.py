#!/usr/bin/env python3
"""
================================================================================
 BONBON FLOWERS HOUSTON - STAR MICRONICS TSP143IIILAN DAEMON
 Impresión Automática en Red Local (Ethernet / LAN) para Tickets de 80mm
================================================================================
 Modelo: Star Micronics TSP100III (TSP143IIILAN futurePRNT)
 Modo de hardware: Star GraphicMode (StarPRNT / Raster) a 576 dots / 203 DPI
 Conexión: Cable Ethernet (RJ45), Socket RAW TCP Puerto 9100 (Single-Session)
 MAC Address de Fábrica: 00:11:62:4D:A8:30
 Variable de entorno: PRINTER_IP o STAR_PRINTER_IP
 Requisitos: Python 3.x (Utiliza exclusivamente la librería estándar, sin pip).
================================================================================
"""

import sys
import os
import time
import json
import socket
import subprocess
import re
import urllib.request
import urllib.error
import argparse

DEFAULT_API_URL = "https://www.bonbonflowershouston.com/api/pos/printer"
DEFAULT_PORT = 9100
POLL_INTERVAL_SECONDS = 4
HARDWARE_MAC = "00:11:62:4D:A8:30"


def print_banner():
    banner = """
===================================================================
   🌹 BONBON FLOWERS HOUSTON - TICKET DAEMON STAR MICRONICS 🌹
      Impresora Térmica Star TSP143IIILAN (Ethernet LAN)
      Modo: Star GraphicMode / Raster (576 dots / 203 DPI)
===================================================================
    """
    print(banner)


def scan_arp_for_mac(target_mac=HARDWARE_MAC):
    """
    Escanea la tabla ARP local buscando la dirección MAC de la Star Micronics.
    Funciona de forma transparente en Windows, macOS y Linux.
    """
    target_clean = re.sub(r"[-:]", "", target_mac.lower())
    try:
        res = subprocess.run(["arp", "-a"], capture_output=True, text=True, timeout=3)
        if res.returncode == 0:
            for line in res.stdout.splitlines():
                clean_line = re.sub(r"[-:]", "", line.lower())
                if target_clean in clean_line:
                    ip_match = re.search(r"\b(?:\d{1,3}\.){3}\d{1,3}\b", line)
                    if ip_match:
                        return ip_match.group(0)
    except Exception:
        pass
    return None


def discover_printer_ip(default_ip="10.0.0.72"):
    """
    Obtiene la IP de la impresora en este orden de prioridad:
    1. Variable de entorno PRINTER_IP o STAR_PRINTER_IP.
    2. Detección automática en tabla ARP por MAC 00:11:62:4D:A8:30.
    3. Archivo printer_config.json local guardado previamente.
    4. Consulta interactiva al usuario con valor por defecto.
    """
    env_ip = os.environ.get("PRINTER_IP") or os.environ.get("STAR_PRINTER_IP")
    if env_ip and env_ip.strip():
        print(f"[✔] Usando IP desde variable de entorno: {env_ip.strip()}")
        return env_ip.strip()

    print(f"[*] Buscando Star Micronics (MAC {HARDWARE_MAC}) en la red local...")
    arp_ip = scan_arp_for_mac(HARDWARE_MAC)
    if arp_ip:
        print(f"[✔] ¡Impresora detectada automáticamente en la red! IP: {arp_ip}")
        return arp_ip

    config_file = os.path.join(os.path.dirname(__file__), "printer_config.json")
    if os.path.exists(config_file):
        try:
            with open(config_file, "r") as f:
                saved = json.load(f)
                if saved.get("printer_ip"):
                    print(f"[✔] Usando IP guardada: {saved['printer_ip']}")
                    return saved["printer_ip"]
        except Exception:
            pass

    # Diagnóstico de subred local para guiar al operador
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        subnet_prefix = ".".join(local_ip.split(".")[:3])
        print(f"[*] Subred local detectada: {subnet_prefix}.x (Tu PC: {local_ip})")
    except Exception:
        subnet_prefix = "192.168.1"

    print("\n[?] Ingrese la dirección IP asignada a la impresora Star Micronics.")
    print("    (Puedes obtenerla apagando la impresora, manteniendo presionado")
    print("     el botón FEED y encendiéndola; imprimirá la hoja de red con su IP).")
    user_input = input(f"    IP [{default_ip}]: ").strip()
    chosen_ip = user_input if user_input else default_ip

    # Guardar en archivo para ejecuciones posteriores
    try:
        with open(config_file, "w") as f:
            json.dump({"printer_ip": chosen_ip, "mac": HARDWARE_MAC}, f, indent=2)
        print(f"[✔] Configuración guardada en printer_config.json")
    except Exception:
        pass

    return chosen_ip


def test_printer_connection(printer_ip, port=DEFAULT_PORT):
    """
    Verifica si el puerto 9100 de la impresora está accesible (Single-Session).
    """
    print(f"[*] Probando conexión con {printer_ip}:{port}...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3.5)
        sock.connect((printer_ip, port))
        sock.close()
        print(f"[✔] ¡Conexión TCP 9100 exitosa con Star TSP143IIILAN!")
        return True
    except Exception as e:
        print(f"[✘] No se pudo conectar a {printer_ip}:{port} -> {e}")
        print("    Verifica que el cable Ethernet esté conectado al router y la impresora encendida.")
        return False


def send_raw_bytes_to_printer(printer_ip, raw_bytes, port=DEFAULT_PORT):
    """
    Envía el stream binario directo al socket RAW puerto 9100 con protocolo single-session.
    Abre la conexión, envía la totalidad del buffer y cierra inmediatamente el socket.
    """
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(8.0)
    sock.connect((printer_ip, port))
    sock.sendall(raw_bytes)
    time.sleep(0.35)
    sock.close()


def generate_local_offline_star_raster_test():
    """
    Genera un buffer binario 100% nativo Star Graphic Raster (576 dots / 72 bytes por línea)
    para pruebas locales de calibración y corte sin requerir conexión a internet.
    """
    chunks = bytearray()

    # 1. Comandos de Inicialización Star Raster
    chunks += b"\x1b\x2a\x72\x52"  # ESC * r R (Reset)
    chunks += b"\x1b\x2a\x72\x41"  # ESC * r A (Enter Raster Mode)
    chunks += b"\x1b\x2a\x72\x43"  # ESC * r C (Clear Buffer)

    line_header = b"\x62\x48\x00"  # 'b', lenL=72 (0x48), lenH=0 (0x00)

    # 2. Patrón de prueba: Línea horizontal sólida superior
    for _ in range(4):
        chunks += line_header + (b"\xff" * 72)

    # 3. Líneas en blanco
    for _ in range(16):
        chunks += line_header + (b"\x00" * 72)

    # 4. Patrón de rayas alternadas (Checkerboard) para verificar densidad a 203 DPI
    for _ in range(40):
        chunks += line_header + (b"\xaa\x55" * 36)

    # 5. Líneas en blanco
    for _ in range(16):
        chunks += line_header + (b"\x00" * 72)

    # 6. Línea horizontal sólida inferior
    for _ in range(4):
        chunks += line_header + (b"\xff" * 72)

    # 7. Finalización de Raster y Corte
    chunks += b"\x1b\x0c\x00"       # ESC FF NUL (Page Execute)
    chunks += b"\x1b\x2a\x72\x42"  # ESC * r B (Exit Raster Mode)
    chunks += b"\n\n\n\n"          # Avance después de cuchilla
    chunks += b"\x1b\x64\x02"      # ESC d 2 (Corte parcial Star)
    chunks += b"\x1d\x56\x41\x00"  # GS V 65 0 (Corte universal respaldo)

    return bytes(chunks)


def print_test_ticket(printer_ip, api_url=DEFAULT_API_URL, port=DEFAULT_PORT):
    """
    Imprime un ticket de prueba Star Graphic Raster (576 dots / 203 DPI) con corte automático.
    Intenta descargar el ticket renderizado completo desde el servidor; si está offline,
    utiliza el generador de raster local.
    """
    print(f"[*] Generando ticket de prueba Star Graphic Raster para {printer_ip}...")
    raster_bytes = None

    try:
        test_url = f"{api_url}?test=true&format=raw"
        req = urllib.request.Request(test_url, headers={"User-Agent": "BonbonStarDaemon/2.0"})
        with urllib.request.urlopen(req, timeout=6) as res:
            if res.status == 200:
                raster_bytes = res.read()
                print(f"[✔] Payload Star Raster 576 dots obtenido desde el servidor ({len(raster_bytes)} bytes).")
    except Exception as e:
        print(f"[!] Servidor no accesible ({e}). Usando generador Star Raster local de respaldo...")

    if not raster_bytes:
        raster_bytes = generate_local_offline_star_raster_test()

    try:
        send_raw_bytes_to_printer(printer_ip, raster_bytes, port)
        print("[✔] ¡Ticket Star Graphic Raster enviado y cortado con éxito!")
    except Exception as e:
        print(f"[✘] Error imprimiendo ticket de prueba: {e}")


def fetch_pending_orders(api_url):
    """
    Consulta al servidor Next.js las órdenes que aún no han sido impresas.
    """
    url = f"{api_url}?limit=5"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "BonbonStarDaemon/2.0", "Accept": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            if res.status == 200:
                data = json.loads(res.read().decode("utf-8"))
                return data.get("orders", [])
    except Exception:
        return []
    return []


def fetch_raw_ticket_bytes(api_url, order_id):
    """
    Descarga el payload binario Star Graphic Raster (576 dots) desde la API de la tienda.
    """
    url = f"{api_url}?orderId={order_id}&format=star_raster"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "BonbonStarDaemon/2.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=8) as res:
            if res.status == 200:
                return res.read()
    except Exception as e:
        print(f"[✘] Error descargando ticket Star Raster para orden #{order_id}: {e}")
    return None


def send_ack(api_url, order_id):
    """
    Informa al servidor que la orden ya fue impresa para no duplicar tickets.
    """
    data = json.dumps({"action": "ack", "orderId": order_id}).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "BonbonStarDaemon/2.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            return res.status == 200
    except Exception as e:
        print(f"[!] Aviso: No se pudo enviar confirmación ACK para #{order_id}: {e}")
        return False


def main():
    print_banner()
    parser = argparse.ArgumentParser(description="Daemon Star Micronics TSP143IIILAN (Star Graphic Raster)")
    parser.add_argument("--ip", help="Dirección IP de la impresora Star Micronics (LAN)")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Puerto RAW socket (default: 9100)")
    parser.add_argument("--api", default=DEFAULT_API_URL, help="URL del endpoint de órdenes de la tienda")
    parser.add_argument("--test", action="store_true", help="Imprime un ticket de calibración Star Raster y finaliza")
    args = parser.parse_args()

    printer_ip = args.ip or discover_printer_ip()

    if not test_printer_connection(printer_ip, args.port):
        print("\n[!] No se pudo conectar a la impresora. ¿Deseas continuar en modo escucha de todas formas? (s/n)")
        resp = input("    > ").strip().lower()
        if resp != "s":
            sys.exit(1)

    if args.test:
        print_test_ticket(printer_ip, args.api, args.port)
        return

    print("\n" + "=" * 65)
    print(f"[*] DAEMON ACTIVO EN MODO STAR GRAPHIC RASTER (576 DOTS)")
    print(f"[*] Impresora LAN: {printer_ip}:{args.port} (Single-Session)")
    print(f"[*] MAC Identificada: {HARDWARE_MAC}")
    print(f"[*] Endpoint Web:     {args.api}")
    print(f"[*] Intervalo: Cada {POLL_INTERVAL_SECONDS} segundos")
    print("    Presiona Ctrl+C en cualquier momento para detener.")
    print("=" * 65 + "\n")

    consecutive_errors = 0

    while True:
        try:
            pending = fetch_pending_orders(args.api)
            if pending:
                for order in pending:
                    order_id = order.get("orderId")
                    cust_name = order.get("customerName", "Cliente")
                    total = order.get("total", 0)

                    print(f"\n[🔔 NUEVA VENTA] #{order_id} - {cust_name} (${total:.2f})")
                    print(f"[*] Descargando stream Star Graphic Raster (576 dots)...")

                    raw_bytes = fetch_raw_ticket_bytes(args.api, order_id)
                    if raw_bytes:
                        try:
                            send_raw_bytes_to_printer(printer_ip, raw_bytes, args.port)
                            print(f"[✔] ¡Ticket #{order_id} impreso y cortado en Star TSP143III!")
                            send_ack(args.api, order_id)
                        except Exception as p_err:
                            print(f"[✘] Error enviando a la impresora {printer_ip}: {p_err}")
                    else:
                        print(f"[✘] No se pudo obtener el buffer de impresión para #{order_id}")

            consecutive_errors = 0
            time.sleep(POLL_INTERVAL_SECONDS)
        except KeyboardInterrupt:
            print("\n\n[*] Daemon detenido por el usuario. ¡Hasta pronto!")
            break
        except Exception as e:
            consecutive_errors += 1
            if consecutive_errors % 10 == 0:
                print(f"[!] Advertencia: {e} (Reintentando conexión...)")
            time.sleep(POLL_INTERVAL_SECONDS)


if __name__ == "__main__":
    main()
