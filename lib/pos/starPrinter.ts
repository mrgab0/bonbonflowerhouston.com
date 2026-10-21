/**
 * Formateador de Tickets para Impresora Térmica Star Micronics TSP100III (TSP143IIILAN)
 * Especificación de papel: 80mm de ancho / 72mm imprimibles (48 columnas Fuente A)
 */

export interface TicketItem {
  name: string;
  quantity: number;
  price: number;
  addons?: Array<{ name?: string; value?: string; price?: number; customText?: string }>;
}

export interface TicketOrderData {
  orderId: string;
  createdAt: Date | string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  address: string;
  deliveryMethod?: string;
  deliveryFee?: number;
  discountAmount?: number;
  taxAmount?: number;
  total: number;
  cardMessage?: string;
  items: TicketItem[];
}

const LINE_WIDTH = 48; // Columnas estándar en papel de 80mm (203 DPI)

/**
 * Centra una cadena de texto en el ancho de 48 columnas
 */
function centerText(text: string, width = LINE_WIDTH): string {
  if (text.length >= width) return text.substring(0, width);
  const leftPadding = Math.floor((width - text.length) / 2);
  return " ".repeat(leftPadding) + text;
}

/**
 * Alinea dos textos a los extremos: izquierda y derecha (ej. "Rosas Rojas ........ $120.00")
 */
function justifyRow(left: string, right: string, width = LINE_WIDTH): string {
  const maxLeft = width - right.length - 1;
  const truncatedLeft = left.length > maxLeft ? left.substring(0, maxLeft) : left;
  const spaces = Math.max(1, width - truncatedLeft.length - right.length);
  return truncatedLeft + " ".repeat(spaces) + right;
}

/**
 * Genera el texto plano formateado a 48 columnas
 */
export function formatTicketText(order: TicketOrderData, lang: "es" | "en" = "es"): string {
  const isEs = lang === "es";
  const dateStr = new Date(order.createdAt).toLocaleString(isEs ? "es-US" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const divider = "=".repeat(LINE_WIDTH);
  const dashLine = "-".repeat(LINE_WIDTH);

  let out = "";
  out += centerText("BONBON FLOWERS HOUSTON") + "\n";
  out += centerText("High Floral Design Boutique") + "\n";
  out += centerText("Houston, Texas & Metropolitan Areas") + "\n";
  out += centerText("Tel / WhatsApp: +1 (346) 739-2730") + "\n";
  out += divider + "\n";

  out += justifyRow(isEs ? "ORDEN #" : "ORDER #", order.orderId) + "\n";
  out += justifyRow(isEs ? "FECHA:" : "DATE:", dateStr) + "\n";
  out += dashLine + "\n";

  out += (isEs ? "CLIENTE:" : "CUSTOMER:") + "\n";
  out += `  ${order.customerName}\n`;
  out += `  Tel: ${order.customerPhone}\n`;
  if (order.customerEmail) out += `  Email: ${order.customerEmail}\n`;

  out += (isEs ? "ENTREGA EN:" : "DELIVERY TO:") + "\n";
  out += `  ${order.address}\n`;
  out += justifyRow(isEs ? "METODO:" : "METHOD:", order.deliveryMethod || "Standard Delivery") + "\n";

  if (order.cardMessage && order.cardMessage.trim()) {
    out += dashLine + "\n";
    out += (isEs ? "💌 DEDICATORIA DE REGALO:" : "💌 GIFT CARD MESSAGE:") + "\n";
    out += `  "${order.cardMessage.trim()}"\n`;
  }

  out += divider + "\n";
  out += justifyRow(isEs ? "DESCRIPCION" : "ITEM", isEs ? "TOTAL" : "AMOUNT") + "\n";
  out += dashLine + "\n";

  let itemsSubtotal = 0;
  for (const item of order.items || []) {
    const qty = item.quantity || 1;
    const price = item.price || 0;
    const sub = qty * price;
    itemsSubtotal += sub;

    out += justifyRow(`${qty}x ${item.name}`, `$${sub.toFixed(2)}`) + "\n";

    if (item.addons && item.addons.length > 0) {
      for (const addon of item.addons) {
        const aName = addon.name || addon.value || "";
        const aPrice = addon.price ? `(+$${addon.price.toFixed(2)})` : "";
        out += `   + ${aName} ${aPrice}\n`;
        if (addon.customText) {
          out += `     "${addon.customText}"\n`;
        }
      }
    }
  }

  out += dashLine + "\n";
  out += justifyRow(isEs ? "Subtotal:" : "Subtotal:", `$${itemsSubtotal.toFixed(2)}`) + "\n";

  if (order.discountAmount && order.discountAmount > 0) {
    out += justifyRow(isEs ? "Descuento:" : "Discount:", `-$${order.discountAmount.toFixed(2)}`) + "\n";
  }

  out += justifyRow(isEs ? "Sales Tax (8.25%):" : "Sales Tax (8.25%):", `+$${(order.taxAmount || 0).toFixed(2)}`) + "\n";
  out += justifyRow(isEs ? "Envio / Delivery:" : "Delivery:", (order.deliveryFee || 0) > 0 ? `+$${order.deliveryFee?.toFixed(2)}` : (isEs ? "Gratis" : "Free")) + "\n";
  out += divider + "\n";
  out += justifyRow(isEs ? "TOTAL A PAGAR:" : "TOTAL DUE:", `$${(order.total || 0).toFixed(2)} USD`) + "\n";
  out += divider + "\n";

  out += centerText(isEs ? "¡Gracias por su preferencia!" : "Thank you for your order!") + "\n";
  out += centerText("www.bonbonflowershouston.com") + "\n\n\n";

  return out;
}

/**
 * Genera el Buffer de bytes con comandos ESC/POS y Star Line Mode
 * Incluye negrita, doble tamaño para títulos y comando de corte automático.
 */
export function buildStarPrinterPayload(order: TicketOrderData, lang: "es" | "en" = "es"): Buffer {
  const chunks: Buffer[] = [];

  const ESC = 0x1b;
  const GS = 0x1d;

  // Inicializar impresora (ESC @)
  chunks.push(Buffer.from([ESC, 0x40]));

  // Centrar texto (ESC a 1)
  chunks.push(Buffer.from([ESC, 0x61, 0x01]));

  // Doble altura y anchura para el nombre de la tienda (GS ! 0x11)
  chunks.push(Buffer.from([GS, 0x21, 0x11]));
  chunks.push(Buffer.from("BONBON FLOWERS\n", "latin1"));

  // Tamaño normal (GS ! 0x00)
  chunks.push(Buffer.from([GS, 0x21, 0x00]));
  chunks.push(Buffer.from("HOUSTON\n", "latin1"));
  chunks.push(Buffer.from("High Floral Design Boutique\n", "latin1"));
  chunks.push(Buffer.from("Houston, TX - Tel: +1 (346) 739-2730\n", "latin1"));
  chunks.push(Buffer.from("================================================\n", "latin1"));

  // Alineación izquierda (ESC a 0)
  chunks.push(Buffer.from([ESC, 0x61, 0x00]));

  // Negrita para el número de orden (ESC E 1)
  chunks.push(Buffer.from([ESC, 0x45, 0x01]));
  chunks.push(Buffer.from(`ORDEN: ${order.orderId}\n`, "latin1"));
  chunks.push(Buffer.from([ESC, 0x45, 0x00]));

  const dateStr = new Date(order.createdAt).toLocaleString("es-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  chunks.push(Buffer.from(`FECHA: ${dateStr}\n`, "latin1"));
  chunks.push(Buffer.from("------------------------------------------------\n", "latin1"));

  // Datos del Cliente
  chunks.push(Buffer.from([ESC, 0x45, 0x01]));
  chunks.push(Buffer.from("CLIENTE:\n", "latin1"));
  chunks.push(Buffer.from([ESC, 0x45, 0x00]));
  chunks.push(Buffer.from(`  ${order.customerName}\n`, "latin1"));
  chunks.push(Buffer.from(`  Tel: ${order.customerPhone}\n`, "latin1"));

  chunks.push(Buffer.from([ESC, 0x45, 0x01]));
  chunks.push(Buffer.from("ENTREGA:\n", "latin1"));
  chunks.push(Buffer.from([ESC, 0x45, 0x00]));
  chunks.push(Buffer.from(`  ${order.address}\n`, "latin1"));

  // Mensaje de dedicatoria
  if (order.cardMessage && order.cardMessage.trim()) {
    chunks.push(Buffer.from("------------------------------------------------\n", "latin1"));
    chunks.push(Buffer.from([ESC, 0x45, 0x01]));
    chunks.push(Buffer.from("DEDICATORIA DE REGALO:\n", "latin1"));
    chunks.push(Buffer.from([ESC, 0x45, 0x00]));
    chunks.push(Buffer.from(`  "${order.cardMessage.trim()}"\n`, "latin1"));
  }

  chunks.push(Buffer.from("================================================\n", "latin1"));
  chunks.push(Buffer.from(justifyRow("DESCRIPCION", "TOTAL") + "\n", "latin1"));
  chunks.push(Buffer.from("------------------------------------------------\n", "latin1"));

  for (const item of order.items || []) {
    const qty = item.quantity || 1;
    const price = item.price || 0;
    const sub = qty * price;

    chunks.push(Buffer.from(justifyRow(`${qty}x ${item.name}`, `$${sub.toFixed(2)}`) + "\n", "latin1"));

    if (item.addons && item.addons.length > 0) {
      for (const addon of item.addons) {
        const aName = addon.name || addon.value || "";
        const aPrice = addon.price ? `(+$${addon.price.toFixed(2)})` : "";
        chunks.push(Buffer.from(`   + ${aName} ${aPrice}\n`, "latin1"));
        if (addon.customText) {
          chunks.push(Buffer.from(`     "${addon.customText}"\n`, "latin1"));
        }
      }
    }
  }

  chunks.push(Buffer.from("------------------------------------------------\n", "latin1"));
  chunks.push(Buffer.from(justifyRow("Sales Tax (8.25%):", `+$${(order.taxAmount || 0).toFixed(2)}`) + "\n", "latin1"));
  chunks.push(Buffer.from(justifyRow("Envio / Delivery:", (order.deliveryFee || 0) > 0 ? `+$${order.deliveryFee?.toFixed(2)}` : "Gratis") + "\n", "latin1"));
  chunks.push(Buffer.from("================================================\n", "latin1"));

  // TOTAL FINAL EN NEGRITA
  chunks.push(Buffer.from([ESC, 0x45, 0x01]));
  chunks.push(Buffer.from([GS, 0x21, 0x01])); // Altura doble
  chunks.push(Buffer.from(justifyRow("TOTAL FINAL:", `$${(order.total || 0).toFixed(2)} USD`) + "\n", "latin1"));
  chunks.push(Buffer.from([GS, 0x21, 0x00]));
  chunks.push(Buffer.from([ESC, 0x45, 0x00]));

  // Centrar agradecimiento
  chunks.push(Buffer.from([ESC, 0x61, 0x01]));
  chunks.push(Buffer.from("www.bonbonflowershouston.com\n", "latin1"));
  chunks.push(Buffer.from("Flores que inspiran sonrisas\n", "latin1"));

  // Alimentar 4 líneas para que salga después de la cuchilla
  chunks.push(Buffer.from("\n\n\n\n", "latin1"));

  // Corte automático de guillotina:
  // Modo Star Line Mode: ESC d 2
  chunks.push(Buffer.from([ESC, 0x64, 0x02]));
  // Modo ESC/POS estándar de respaldo: GS V 65 0
  chunks.push(Buffer.from([GS, 0x56, 0x41, 0x00]));

  return Buffer.concat(chunks);
}
