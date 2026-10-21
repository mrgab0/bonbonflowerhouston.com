#!/usr/bin/env node
/**
 * ================================================================================
 *  BONBON FLOWERS HOUSTON - STAR MICRONICS TSP143IIILAN DAEMON (Node.js)
 *  Impresión Automática en Red Local (Ethernet / LAN) para Tickets de 80mm
 * ================================================================================
 */

const net = require("net");
const fs = require("fs");
const path = require("path");

const API_BASE = process.env.STAR_API_URL || "https://www.bonbonflowershouston.com/api/pos/printer";
const DEFAULT_PORT = 9100;
const POLL_INTERVAL_MS = 4000;

const CONFIG_PATH = path.join(__dirname, "printer_config.json");

function getSavedPrinterIp() {
  if (process.env.STAR_PRINTER_IP) return process.env.STAR_PRINTER_IP;
  if (fs.existsSync(CONFIG_PATH)) {
    try {
      const cfg = JSON.parse(fs.readFileSync(CONFIG_PATH, "utf8"));
      if (cfg.printer_ip) return cfg.printer_ip;
    } catch (e) {}
  }
  return "192.168.1.150";
}

const PRINTER_IP = getSavedPrinterIp();

console.log("\n===================================================================");
console.log("   🌹 BONBON FLOWERS HOUSTON - STAR TSP143III TICKET DAEMON 🌹");
console.log(`[*] Impresora LAN: ${PRINTER_IP}:${DEFAULT_PORT}`);
console.log(`[*] Conectado a:   ${API_BASE}`);
console.log("===================================================================\n");

function sendToPrinter(rawBuffer) {
  return new Promise((resolve, reject) => {
    const client = new net.Socket();
    client.setTimeout(6000);

    client.connect(DEFAULT_PORT, PRINTER_IP, () => {
      client.write(rawBuffer, () => {
        client.end();
      });
    });

    client.on("close", () => resolve(true));
    client.on("error", (err) => {
      client.destroy();
      reject(err);
    });
    client.on("timeout", () => {
      client.destroy();
      reject(new Error("Timeout conectando a la impresora " + PRINTER_IP));
    });
  });
}

async function checkPendingOrders() {
  try {
    const res = await fetch(`${API_BASE}?limit=5`, {
      headers: { "User-Agent": "BonbonStarNodeDaemon/1.0" },
    });
    if (!res.ok) return;
    const data = await res.json();
    const orders = data.orders || [];

    for (const order of orders) {
      console.log(`\n[🔔 NUEVA VENTA] #${order.orderId} - ${order.customerName} ($${Number(order.total).toFixed(2)})`);
      console.log(`[*] Descargando e imprimiendo ticket en Star TSP143III...`);

      const rawRes = await fetch(`${API_BASE}?orderId=${order.orderId}&format=raw`);
      if (!rawRes.ok) {
        console.error(`[✘] Error obteniendo formato raw para #${order.orderId}`);
        continue;
      }

      const arrayBuffer = await rawRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      await sendToPrinter(buffer);
      console.log(`[✔] ¡Ticket #${order.orderId} impreso y cortado exitosamente!`);

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

// Iniciar ciclo de escucha continuo
setInterval(checkPendingOrders, POLL_INTERVAL_MS);
checkPendingOrders();
