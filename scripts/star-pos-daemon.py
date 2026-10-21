#!/usr/bin/env python3
"""
================================================================================
 BONBON FLOWERS HOUSTON - STAR MICRONICS TSP143IIILAN DAEMON
 Impresión Automática en Red Local (Ethernet / LAN) para Tickets de 80mm
================================================================================
 Modelo: Star Micronics TSP100III (TSP143IIILAN futurePRNT)
 Conexión: Cable Ethernet (RJ45), Socket RAW Puerto 9100
 Ancho de papel: 80mm (Área imprimible: 72mm / 48 columnas)
 Requisitos: Python 3.x (Utiliza exclusivamente la librería estándar, sin pip).
================================================================================
"""

import sys
import os
import time
import json
import socket
import urllib.request
import urllib.error
import argparse

DEFAULT_API_URL = "https://www.bonbonflowershouston.com/api/pos/printer"
DEFAULT_PORT = 9100
POLL_INTERVAL_SECONDS = 4


def print_banner():
    banner = """
===================================================================
   🌹 BONBON FLOWERS HOUSTON - TICKET DAEMON STAR MICRONICS 🌹
           Impresora Térmica Star TSP143IIILAN (Ethernet)
===================================================================
    """
    print(banner)


def discover_printer_ip(default_ip="192.168.1.150"):
    """
    Permite ingresar la IP de la impresora o intentar detectar en red local.
    """
    env_ip = os.environ.get("STAR_PRINTER_IP")
    if env_ip:
        return env_ip

    print(f"[*] Buscando impresora Star Micronics en la red local...")
    # Intentar obtener la IP local de esta máquina para sugerir rango
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        subnet_prefix = ".".join(local_ip.split(".")[:3])
        print(f"[*] Red local detectada: {subnet_prefix}.x (Tu PC: {local_ip})")
    except Exception:
        subnet_prefix = "192.168.1"

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

    print("\n[?] Ingrese la dirección IP de la impresora Star Micronics.")
    print("    (Puedes obtenerla apagando la impresora, manteniendo presionado")
    print("     el botón FEED y encendiéndola; imprimirá un ticket con su IP).")
    user_input = input(f"    IP [{default_ip}]: ").strip()
    chosen_ip = user_input if user_input else default_ip

    # Guardar en archivo para no pedirla en cada ejecución
    try:
        with open(config_file, "w") as f:
            json.dump({"printer_ip": chosen_ip}, f)
        print(f"[✔] IP {chosen_ip} guardada en printer_config.json")
    except Exception:
        pass

    return chosen_ip


def test_printer_connection(printer_ip, port=DEFAULT_PORT):
    """
    Verifica si el puerto 9100 de la impresora está accesible.
    """
    print(f"[*] Probando conexión con {printer_ip}:{port}...")
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(3.0)
        sock.connect((printer_ip, port))
        sock.close()
        print(f"[✔] ¡Conexión exitosa con la Star Micronics TSP143IIILAN!")
        return True
    except Exception as e:
        print(f"[✘] No se pudo conectar a {printer_ip}:{port} -> {e}")
        print("    Verifica que el cable de red Ethernet esté conectado y con luz verde.")
        return False


def send_raw_bytes_to_printer(printer_ip, raw_bytes, port=DEFAULT_PORT):
    """
    Envía el payload binario directo al socket RAW puerto 9100.
    """
    sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    sock.settimeout(6.0)
    sock.connect((printer_ip, port))
    sock.sendall(raw_bytes)
    sock.close()


def print_test_ticket(printer_ip, port=DEFAULT_PORT):
    """
    Imprime un ticket de prueba y calibración de 80mm con auto-corte.
    """
    print(f"[*] Enviando ticket de prueba a {printer_ip}...")
    ESC = b'\x1b'
    GS = b'\x1d'

    ticket = bytearray()
    ticket += ESC + b'@'              # Reset
    ticket += ESC + b'\x61\x01'        # Centrar
    ticket += GS + b'\x21\x11'         # Doble tamaño
    ticket += b"BONBON FLOWERS\n"
    ticket += GS + b'\x21\x00'         # Normal
    ticket += b"Houston, Texas\n"
    ticket += b"Star Micronics TSP143IIILAN (Ethernet)\n"
    ticket += b"================================================\n"
    ticket += ESC + b'\x61\x00'        # Izquierda
    ticket += b"PRUEBA DE IMPRESION Y CORTE AUTOMATICO\n"
    ticket += b"Papel: Rollo Termico 80mm (Ancho: 72mm)\n"
    ticket += b"Columnas: 48 Caracteres\n"
    ticket += b"Estado de Red: Conectada OK (Puerto 9100)\n"
    ticket += b"------------------------------------------------\n"
    ticket += b"1x Ramo de Rosas Preservadas ....... $149.99\n"
    ticket += b"1x Tarjeta de Dedicatoria Impresa .. INCLUIDO\n"
    ticket += b"================================================\n"
    ticket += b"TOTAL: $149.99 USD\n"
    ticket += b"================================================\n"
    ticket += ESC + b'\x61\x01'        # Centrar
    ticket += b"Listo para recibir ventas en vivo!\n\n\n\n"
    # Corte de guillotina Star Line Mode (ESC d 2) y ESC/POS (GS V 65 0)
    ticket += ESC + b'\x64\x02'
    ticket += GS + b'\x56\x41\x00'

    try:
        send_raw_bytes_to_printer(printer_ip, bytes(ticket), port)
        print("[✔] Ticket de prueba enviado y cortado con éxito.")
    except Exception as e:
        print(f"[✘] Error imprimiendo ticket de prueba: {e}")


def fetch_pending_orders(api_url):
    """
    Consulta al servidor Next.js las órdenes que aún no han sido impresas.
    """
    url = f"{api_url}?limit=5"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "BonbonStarDaemon/1.0", "Accept": "application/json"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            if res.status == 200:
                data = json.loads(res.read().decode("utf-8"))
                return data.get("orders", [])
    except Exception as e:
        # Fallo de red silencioso para reintentar
        return []
    return []


def fetch_raw_ticket_bytes(api_url, order_id):
    """
    Descarga el payload de bytes ESC/POS formateado desde la API de la tienda.
    """
    url = f"{api_url}?orderId={order_id}&format=raw"
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "BonbonStarDaemon/1.0"}
    )
    with urllib.request.urlopen(req, timeout=8) as res:
        if res.status == 200:
            return res.read()
    return None


def send_ack(api_url, order_id):
    """
    Informa al servidor que la orden ya fue impresa para no duplicar tickets.
    """
    data = json.dumps({"action": "ack", "orderId": order_id}).encode("utf-8")
    req = urllib.request.Request(
        api_url,
        data=data,
        headers={"Content-Type": "application/json", "User-Agent": "BonbonStarDaemon/1.0"}
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as res:
            return res.status == 200
    except Exception as e:
        print(f"[!] Aviso: No se pudo enviar confirmación ACK para {order_id}: {e}")
        return False


def main():
    print_banner()
    parser = argparse.ArgumentParser(description="Daemon de Impresión Automática Star Micronics TSP143IIILAN")
    parser.add_argument("--ip", help="Dirección IP de la impresora Star Micronics (LAN)")
    parser.add_argument("--port", type=int, default=DEFAULT_PORT, help="Puerto RAW socket (default: 9100)")
    parser.add_argument("--api", default=DEFAULT_API_URL, help="URL del endpoint de órdenes de la tienda")
    parser.add_argument("--test", action="store_true", help="Imprime un ticket de calibración y finaliza")
    args = parser.parse_args()

    printer_ip = args.ip or discover_printer_ip()

    if not test_printer_connection(printer_ip, args.port):
        print("\n[!] No se pudo conectar a la impresora. ¿Deseas continuar en modo escucha de todas formas? (s/n)")
        resp = input("    > ").strip().lower()
        if resp != "s":
            sys.exit(1)

    if args.test:
        print_test_ticket(printer_ip, args.port)
        return

    print("\n" + "=" * 65)
    print(f"[*] DAEMON ACTIVO Y ESCUCHANDO VENTAS EN VIVO")
    print(f"[*] Impresora: {printer_ip}:{args.port}")
    print(f"[*] Tienda:    {args.api}")
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

                    print(f"\n[🔔 NUEVA VENTA DETECTADA] #{order_id} - {cust_name} (${total:.2f})")
                    print(f"[*] Descargando e imprimiendo ticket en Star TSP143III...")

                    raw_bytes = fetch_raw_ticket_bytes(args.api, order_id)
                    if raw_bytes:
                        try:
                            send_raw_bytes_to_printer(printer_ip, raw_bytes, args.port)
                            print(f"[✔] ¡Ticket #{order_id} impreso y cortado exitosamente!")
                            send_ack(args.api, order_id)
                        except Exception as p_err:
                            print(f"[✘] Error enviando a la impresora {printer_ip}: {p_err}")
                    else:
                        print(f"[✘] No se pudo obtener el formato del ticket #{order_id}")

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
