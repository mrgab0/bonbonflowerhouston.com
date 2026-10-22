#!/usr/bin/env node
/**
 * ================================================================================
 *  BONBON FLOWERS HOUSTON - STAR MICRONICS TSP143IIILAN DAEMON (Node.js)
 *  Impresión Automática en Red Local (Ethernet / LAN) para Tickets de 80mm
 * ================================================================================
 *  Modo de hardware: Star GraphicMode (StarPRNT / Raster) a 576 dots / 203 DPI
 *  Conexión: Cable Ethernet (RJ45), Socket RAW TCP Puerto 9100 (Single-Session)
 *  MAC Address de Fábrica: 00:11:62:4D:A8:30
 *  Variable de entorno: PRINTER_IP o STAR_PRINTER_IP
 * ================================================================================
 */

const net = require("net");
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const API_BASE = process.env.STAR_API_URL || "https://www.bonbonflowershouston.com/api/pos/printer";
const DEFAULT_PORT = 9100;
const POLL_INTERVAL_MS = 4000;
const HARDWARE_MAC = "00:11:62:4D:A8:30";

const CONFIG_PATH = path.join(__dirname, "printer_config.json");

function scanArpForMac() {
  try {
    const stdout = execSync("arp -a", { encoding: "utf8", timeout: 3000 });
    const targetClean = HARDWARE_MAC.toLowerCase().replace(/[-:]/g, "");
    for (const line of stdout.split("\n")) {
      const cleanLine = line.toLowerCase().replace(/[-:]/g, "");
      if (cleanLine.includes(targetClean)) {
        const match = line.match(/\b(?:\d{1,3}\.){3}\d{1,3}\b/);
        if (match) return match[0];
      }
    }
  } catch (e) {}
  return null;
}

function getPrinterIp() {
  const envIp = process.env.PRINTER_IP || process.env.STAR_PRINTER_IP;
  if (envIp && envIp.trim()) return envIp.trim();

  const arpIp = scanArpForMac();
  if (arpIp) return arpIp;

  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      if (cfg.printer_ip) return cfg.printer_ip;
    } catch (e) {}
  }
  return "192.168.1.150";
}

const PRINTER_IP = getPrinterIp();
const IS_TEST_MODE = process.argv.includes("--test");

console.log("\n===================================================================");
console.log("   🌹 BONBON FLOWERS HOUSTON - STAR TSP143III TICKET DAEMON 🌹");
console.log(`[*] Impresora LAN:    ${PRINTER_IP}:${DEFAULT_PORT} (Single-Session)`);
console.log(`[*] Modo de Comandos: Star GraphicMode (Raster 576 dots / 203 DPI)`);
console.log(`[*] MAC Address:      ${HARDWARE_MAC}`);
console.log(`[*] Conectado a:      ${API_BASE}`);
console.log("===================================================================\n");

function sendToPrinter(rawBuffer) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(8000);

    client.connect(DEFAULT_PORT, PRINTER_IP, () => {
      client.write(rawBuffer, () => {
        setTimeout(() => {
          client.end();
          resolve(true);
        }, 350);
      });
    });

    client.on("error", (err) => {
      client.destroy();
      reject(err);
    });
    client.on("timeout", () => {
      client.destroy();
      reject(new Error("Timeout conectando a " + PRINTER_IP + ":9100"));
    });
  });
}

async function runTestPrint() {
  console.log(`[*] Descargando ticket de prueba Star Graphic Raster...`);
  try {
    const res = await fetch(`${API_BASE}?test=true&format=raw`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    await sendToPrinter(buffer);
    console.log(`[✔] ¡Ticket de prueba impreso y cortado exitosamente en ${PRINTER_IP}!`);
  } catch (err) {
    console.error(`[✘] Error en impresión de prueba:`, err.message);
  }
}

async function checkPendingOrders() {
  try {
    const res = await fetch(`${API_BASE}?limit=5`, {
      headers: { "User-Agent": "BonbonStarNodeDaemon/2.0" },
    });
    if (!res.ok) return;
    const data = await res.json();
    const orders = data.orders || [];

    for (const order of orders) {
      console.log(`\n[🔔 NUEVA VENTA] #${order.orderId} - ${order.customerName} ($${Number(order.total).toFixed(2)})`);
      console.log(`[*] Descargando stream Star Graphic Raster (576 dots)...`);

      const rawRes = await fetch(`${API_BASE}?orderId=${order.orderId}&format=star_raster`);
      if (!rawRes.ok) {
        console.error(`[✘] Error obteniendo stream raster para #${order.orderId}`);
        continue;
      }

      const arrayBuffer = await rawRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await sendToPrinter(buffer);
      console.log(`[✔] ¡Ticket #${order.orderId} impreso y cortado exitosamente en Star TSP143III!`);

      // Enviar confirmación ACK
      await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "ack", orderId: order.orderId }),
      });
    }
  } catch (err) {
    // Error transitorio de red
  }
}

if (IS_TEST_MODE) {
  runTestPrint().then(() => process.exit(0));
} else {
  setInterval(checkPendingOrders, POLL_INTERVAL_MS);
  checkPendingOrders();
}
