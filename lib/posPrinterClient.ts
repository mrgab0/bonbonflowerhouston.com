/**
 * Motor de Impresión POS 100% JavaScript para Star Micronics TSP100III (TSP143IIILAN)
 * y Facturación A4.
 *
 * Ejecución 100% en el navegador (Client-Side) sin requerir Python, scripts .bat,
 * terminales ni accesos remotos a la máquina del cliente.
 *
 * Incluye Sistema de Eventos JavaScript ('bonbon:pos-print') para detección
 * y despacho reactivo de tickets térmicos al registrar ventas.
 */

export interface POSOrderItem {
  name: string;
  price: number;
  quantity: number;
  addons?: Array<{
    name?: string;
    value?: string;
    price?: number;
    customText?: string;
  }>;
}

export interface POSOrderData {
  orderId: string;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  address?: string;
  deliveryMethod?: string;
  cardMessage?: string;
  items?: POSOrderItem[];
  subtotal?: number;
  discountAmount?: number;
  taxAmount?: number;
  deliveryFee?: number;
  total: number;
  createdAt?: string | Date;
  status?: string;
  isPrintedToPOS?: boolean;
}

const AUTOPRINT_STORAGE_KEY = "bonbon_pos_autoprint_enabled";
export const POS_PRINT_EVENT = "bonbon:pos-print";

/**
 * Consulta si la auto-impresión en JavaScript está activada en este navegador
 */
export function isAutoPrintEnabled(): boolean {
  if (typeof window === "undefined") return true;
  const stored = localStorage.getItem(AUTOPRINT_STORAGE_KEY);
  if (stored === null) return true; // Activado por defecto
  return stored === "true";
}

/**
 * Activa o desactiva la auto-impresión en JavaScript
 */
export function setAutoPrintEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(AUTOPRINT_STORAGE_KEY, enabled ? "true" : "false");
  // Notificar a todos los componentes que cambió la preferencia
  window.dispatchEvent(new CustomEvent("bonbon:pos-autoprint-toggled", { detail: { enabled } }));
}

/**
 * Dispara un evento nativo JavaScript para ordenar la impresión de un pedido
 */
export function triggerPosPrintEvent(
  order: POSOrderData,
  format: "ticket80" | "a4" = "ticket80",
  lang: "es" | "en" = "es"
): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent(POS_PRINT_EVENT, {
      detail: { order, format, lang },
    })
  );
}

/**
 * Suscribe un callback al evento global de impresión JavaScript
 */
export function listenToPosPrintEvents(
  callback: (detail: { order: POSOrderData; format: "ticket80" | "a4"; lang: "es" | "en" }) => void
): () => void {
  if (typeof window === "undefined") return () => {};

  const handler = (e: Event) => {
    const custom = e as CustomEvent;
    if (custom.detail) {
      callback(custom.detail);
    }
  };

  window.addEventListener(POS_PRINT_EVENT, handler);
  return () => {
    window.removeEventListener(POS_PRINT_EVENT, handler);
  };
}

/**
 * Retorna una orden de prueba para calibrar y verificar la impresora Star Micronics 80mm
 */
export function getPosTestOrder(): POSOrderData {
  return {
    orderId: "TEST-STAR-80MM",
    customerName: "Cliente de Prueba (Bonbon Flowers)",
    customerPhone: "+1 (346) 739-2730",
    customerEmail: "info@bonbonflowershouston.com",
    address: "1000 Main St, Suite 400, Houston, TX 77002",
    deliveryMethod: "Hand Delivery (Houston Metro)",
    cardMessage: "¡Feliz Aniversario! Que este hermoso arreglo llene su día de amor. Con todo mi cariño. 🌸💖",
    items: [
      {
        name: "Ramo Buchón 100 Rosas Rojas",
        price: 249.99,
        quantity: 1,
        addons: [
          { name: "Color de Rosas: Rojo Pasión", price: 0 },
          { name: "Corona de Reina Dorada", price: 25.0 },
          { name: "Mariposas Monarca 3D (x4)", price: 15.0 },
          { name: "Listón Personalizado", price: 10.0, customText: "Para la reina de mi corazón" },
        ],
      },
    ],
    subtotal: 299.99,
    discountAmount: 0,
    taxAmount: 24.75,
    deliveryFee: 15.0,
    total: 339.74,
    createdAt: new Date().toISOString(),
    status: "Confirmado (Test)",
  };
}

/**
 * Genera el documento HTML completo y estilizado para el Ticket Térmico / Matriz de 80mm
 * Ancho útil: 72mm (Star TSP100III 576 dots / 48 columnas)
 */
export function generate80mmTicketHtml(order: POSOrderData, lang: "es" | "en" = "es"): string {
  const dateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleDateString();

  const items = order.items || [];
  const itemsSubtotal =
    order.subtotal ??
    items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);

  const itemsRows = items
    .map((item) => {
      const addonsHtml =
        item.addons && item.addons.length > 0
          ? `<div style="padding-left: 8px; font-size: 10px; color: #333;">
              ${item.addons
                .map(
                  (a) =>
                    `<div>+ ${a.name || a.value || ""}${
                      a.price ? ` (+$${a.price.toFixed(2)})` : ""
                    }${a.customText ? `<div style="font-style: italic; padding-left: 6px;">"${a.customText}"</div>` : ""}</div>`
                )
                .join("")}
            </div>`
          : "";

      return `
        <div style="padding: 3px 0; border-bottom: 1px dotted #ccc;">
          <div style="display: flex; justify-content: space-between; font-weight: bold;">
            <span style="flex: 1; padding-right: 4px;">${item.quantity || 1}x ${item.name}</span>
            <span style="white-space: nowrap;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
          </div>
          ${addonsHtml}
        </div>
      `;
    })
    .join("");

  const cardMessageHtml = order.cardMessage
    ? `
      <div style="margin: 6px 0; padding: 6px; border: 1.5px dashed #000; background: #fafafa; border-radius: 4px;">
        <div style="font-weight: bold; font-size: 10px; text-transform: uppercase;">
          💌 ${lang === "es" ? "TARJETA DE REGALO:" : "GIFT CARD MESSAGE:"}
        </div>
        <div style="font-style: italic; font-weight: bold; font-size: 11px; margin-top: 2px; word-break: break-word;">
          "${order.cardMessage}"
        </div>
      </div>
    `
    : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Ticket Star TSP100 - #${order.orderId}</title>
  <style>
    @page {
      size: 80mm auto;
      margin: 0;
    }
    @media print {
      html, body {
        width: 80mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        color: #000 !important;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: 'Courier New', Courier, monospace, monospace;
      font-size: 11px;
      line-height: 1.3;
      color: #000;
      background: #fff;
      width: 72mm;
      max-width: 72mm;
      margin: 0 auto;
      padding: 4mm 2mm 18mm 2mm; /* 18mm margen de corte Star Micronics */
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .uppercase { text-transform: uppercase; }
    .border-b-dashed { border-bottom: 1px dashed #000; }
    .border-b-solid { border-bottom: 1.5px solid #000; }
    .py-1 { padding-top: 4px; padding-bottom: 4px; }
    .py-2 { padding-top: 6px; padding-bottom: 6px; }
    .flex-between { display: flex; justify-content: space-between; align-items: flex-start; }
  </style>
</head>
<body>
  <!-- Encabezado Boutique -->
  <div class="text-center py-1 border-b-dashed">
    <div class="font-black uppercase" style="font-size: 14px; letter-spacing: 0.5px;">Bonbon Flowers</div>
    <div class="font-bold uppercase" style="font-size: 12px; letter-spacing: 1px;">HOUSTON</div>
    <div style="font-size: 9.5px; margin-top: 2px;">High Floral Design Boutique</div>
    <div style="font-size: 9.5px;">Houston, Texas & Metro Areas</div>
    <div class="font-bold" style="font-size: 10px; margin-top: 2px;">Tel / WhatsApp: +1 (346) 739-2730</div>
    <div style="font-size: 9px;">www.bonbonflowershouston.com</div>
  </div>

  <!-- Metadatos de Orden -->
  <div class="py-1 border-b-dashed">
    <div class="flex-between font-bold" style="font-size: 12px;">
      <span>${lang === "es" ? "ORDEN:" : "ORDER:"}</span>
      <span style="border: 1px solid #000; padding: 1px 4px;">#${order.orderId}</span>
    </div>
    <div class="flex-between" style="font-size: 10px; margin-top: 3px;">
      <span>${lang === "es" ? "FECHA:" : "DATE:"}</span>
      <span>${dateFormatted}</span>
    </div>
    <div class="flex-between" style="font-size: 10px; margin-top: 2px;">
      <span>${lang === "es" ? "ESTADO:" : "STATUS:"}</span>
      <span class="font-bold uppercase">${order.status || "Confirmado"}</span>
    </div>
  </div>

  <!-- Destinatario / Cliente y Entrega -->
  <div class="py-1 border-b-dashed" style="font-size: 10.5px;">
    <div class="font-bold uppercase" style="font-size: 9.5px; color: #333;">
      ${lang === "es" ? "DATOS DE ENTREGA:" : "DELIVERY INFO:"}
    </div>
    <div class="font-bold" style="font-size: 11.5px; margin-top: 1px;">${order.customerName}</div>
    ${order.customerPhone ? `<div class="font-bold">Tel: ${order.customerPhone}</div>` : ""}
    ${order.address ? `<div style="margin-top: 2px; word-break: break-word;"><span class="font-bold">Dir:</span> ${order.address}</div>` : ""}
    <div style="font-size: 10px; margin-top: 2px;"><span class="font-bold">Método:</span> ${order.deliveryMethod || "Envío Estándar"}</div>
  </div>

  <!-- Dedicatoria -->
  ${cardMessageHtml}

  <!-- Detalle de Productos -->
  <div class="py-1 border-b-dashed">
    <div class="flex-between font-bold uppercase" style="font-size: 9.5px; padding-bottom: 3px; border-bottom: 1px solid #000;">
      <span>${lang === "es" ? "DESCRIPCIÓN" : "ITEM"}</span>
      <span>${lang === "es" ? "TOTAL" : "TOTAL"}</span>
    </div>
    <div style="margin-top: 4px;">
      ${itemsRows}
    </div>
  </div>

  <!-- Totales Financieros -->
  <div class="py-1 border-b-dashed" style="font-size: 10.5px;">
    <div class="flex-between">
      <span>${lang === "es" ? "Subtotal:" : "Subtotal:"}</span>
      <span>$${itemsSubtotal.toFixed(2)}</span>
    </div>
    ${
      order.discountAmount
        ? `<div class="flex-between">
            <span>${lang === "es" ? "Descuento:" : "Discount:"}</span>
            <span>-$${order.discountAmount.toFixed(2)}</span>
          </div>`
        : ""
    }
    <div class="flex-between">
      <span>Sales Tax (8.25%):</span>
      <span>+$${(order.taxAmount || 0).toFixed(2)}</span>
    </div>
    <div class="flex-between">
      <span>${lang === "es" ? "Envío / Delivery:" : "Delivery:"}</span>
      <span>${(order.deliveryFee || 0) > 0 ? `+$${(order.deliveryFee || 0).toFixed(2)}` : lang === "es" ? "Gratis" : "Free"}</span>
    </div>
    <div class="flex-between font-black border-b-solid" style="font-size: 13px; margin-top: 4px; padding-top: 3px; border-top: 1.5px solid #000;">
      <span>TOTAL:</span>
      <span>$${(order.total || 0).toFixed(2)} USD</span>
    </div>
  </div>

  <!-- Pie del Recibo y Línea de Corte Star Micronics -->
  <div class="text-center py-2" style="font-size: 9.5px;">
    <div class="font-bold uppercase">
      ${lang === "es" ? "¡Gracias por su compra!" : "Thank you for your business!"}
    </div>
    <div style="margin-top: 2px;">Bonbon Flowers Houston</div>
    <div style="font-size: 8.5px; color: #555; margin-top: 3px;">Star Micronics TSP100III - 80mm</div>
    <!-- Espacio en blanco para la cuchilla automática -->
    <div style="height: 18mm;"></div>
    <div style="font-size: 8px; color: #999;">- - - - CORTE DE TICKET - - - -</div>
  </div>
</body>
</html>`;
}

/**
 * Genera el documento HTML completo para Factura Estándar A4 / Carta
 */
export function generateA4InvoiceHtml(order: POSOrderData, lang: "es" | "en" = "es"): string {
  const dateFormatted = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString(lang === "es" ? "es-MX" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : new Date().toLocaleDateString();

  const items = order.items || [];
  const itemsSubtotal =
    order.subtotal ??
    items.reduce((acc, it) => acc + (it.price || 0) * (it.quantity || 1), 0);

  const itemsRows = items
    .map((item) => {
      const addons =
        item.addons && item.addons.length > 0
          ? `<div style="font-size: 11px; color: #db2777; margin-top: 2px;">
              ${item.addons
                .map(
                  (a) =>
                    `<div>+ ${a.name || a.value || ""}${
                      a.price ? ` (+$${a.price.toFixed(2)})` : ""
                    }${a.customText ? `<div style="font-style: italic; color: #374151; padding-left: 6px;">"${a.customText}"</div>` : ""}</div>`
                )
                .join("")}
            </div>`
          : "";

      return `
        <tr style="border-bottom: 1px solid #f3f4f6;">
          <td style="padding: 10px 12px;">
            <strong style="color: #111827;">${item.name}</strong>
            ${addons}
          </td>
          <td style="padding: 10px 12px; text-align: center; font-weight: bold;">${item.quantity || 1}</td>
          <td style="padding: 10px 12px; text-align: right;">$${(item.price || 0).toFixed(2)}</td>
          <td style="padding: 10px 12px; text-align: right; font-weight: bold; color: #111827;">$${((item.price || 0) * (item.quantity || 1)).toFixed(2)}</td>
        </tr>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Factura A4 #${order.orderId} - Bonbon Flowers</title>
  <style>
    @page {
      size: letter portrait;
      margin: 12mm;
    }
    @media print {
      body {
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #1f2937;
      background: #fff;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #fbcfe8;
      padding-bottom: 20px;
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div>
      <h1 style="font-size: 24px; font-weight: 800; color: #111827; margin: 0;">Bonbon Flowers Houston</h1>
      <p style="font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #db2777; margin: 2px 0 0 0;">High Floral Design Boutique</p>
      <p style="font-size: 11px; color: #6b7280; margin: 6px 0 0 0;">Houston, Texas & Metropolitan Areas</p>
      <p style="font-size: 11px; color: #6b7280; margin: 2px 0 0 0;">Tel / WhatsApp: +1 (346) 739-2730</p>
      <p style="font-size: 11px; color: #6b7280; margin: 2px 0 0 0;">www.bonbonflowershouston.com</p>
    </div>

    <div style="text-align: right;">
      <div style="display: inline-block; background: #fdf2f8; border: 1px solid #fbcfe8; padding: 6px 14px; border-radius: 12px; color: #db2777; font-family: monospace; font-size: 15px; font-weight: bold;">
        ${lang === "es" ? "FACTURA #" : "INVOICE #"} ${order.orderId}
      </div>
      <p style="font-size: 11px; color: #6b7280; margin: 8px 0 0 0;">
        <strong>${lang === "es" ? "Fecha:" : "Date:"}</strong> ${dateFormatted}
      </p>
      <p style="font-size: 11px; color: #6b7280; margin: 2px 0 0 0;">
        <strong>${lang === "es" ? "Estado:" : "Status:"}</strong> ${order.status || "Confirmado"}
      </p>
    </div>
  </div>

  <!-- Cliente y Envíos -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin-top: 20px;">
    <div>
      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px;">
        ${lang === "es" ? "DATOS DEL CLIENTE" : "CUSTOMER DETAILS"}
      </div>
      <div style="font-size: 14px; font-weight: bold; color: #111827; margin-top: 4px;">${order.customerName}</div>
      ${order.customerPhone ? `<div style="font-family: monospace; color: #374151; margin-top: 2px;">${order.customerPhone}</div>` : ""}
      ${order.customerEmail ? `<div style="color: #6b7280;">${order.customerEmail}</div>` : ""}
    </div>

    <div>
      <div style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #9ca3af; letter-spacing: 0.5px;">
        ${lang === "es" ? "DIRECCIÓN DE ENTREGA" : "DELIVERY ADDRESS"}
      </div>
      <div style="font-size: 13px; font-weight: 600; color: #111827; margin-top: 4px;">${order.address || "Recoger en Tienda / Boutique"}</div>
      <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
        <strong>${lang === "es" ? "Método:" : "Method:"}</strong> ${order.deliveryMethod || "Standard Delivery"}
      </div>
    </div>
  </div>

  ${
    order.cardMessage
      ? `
    <div style="background: #fdf2f8; border: 1px solid #fbcfe8; border-radius: 12px; padding: 14px; margin-top: 16px;">
      <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #db2777; letter-spacing: 0.5px;">
        ${lang === "es" ? "💌 TARJETA DE DEDICATORIA IMPRESA" : "💌 PRINTED CARD MESSAGE"}
      </div>
      <div style="font-style: italic; font-weight: 600; color: #1f2937; margin-top: 4px; font-size: 13px;">
        "${order.cardMessage}"
      </div>
    </div>
  `
      : ""
  }

  <!-- Tabla de Items -->
  <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
    <thead>
      <tr style="background: #f3f4f6; border-bottom: 2px solid #e5e7eb; font-size: 10px; text-transform: uppercase; font-weight: bold; color: #4b5563; text-align: left;">
        <th style="padding: 8px 12px;">${lang === "es" ? "Descripción de Arreglo / Ítem" : "Item Description"}</th>
        <th style="padding: 8px 12px; text-align: center;">${lang === "es" ? "Cant." : "Qty"}</th>
        <th style="padding: 8px 12px; text-align: right;">${lang === "es" ? "Precio Unit." : "Unit Price"}</th>
        <th style="padding: 8px 12px; text-align: right;">${lang === "es" ? "Subtotal" : "Subtotal"}</th>
      </tr>
    </thead>
    <tbody>
      ${itemsRows}
    </tbody>
  </table>

  <!-- Desglose de Totales -->
  <div style="display: flex; justify-content: flex-end; margin-top: 20px;">
    <div style="width: 280px; background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 12px; padding: 14px; font-size: 12px;">
      <div style="display: flex; justify-content: space-between; color: #4b5563; margin-bottom: 6px;">
        <span>${lang === "es" ? "Subtotal Ítems:" : "Items Subtotal:"}</span>
        <span style="font-weight: bold;">$${itemsSubtotal.toFixed(2)}</span>
      </div>
      ${
        order.discountAmount
          ? `<div style="display: flex; justify-content: space-between; color: #059669; margin-bottom: 6px; font-weight: 600;">
              <span>${lang === "es" ? "Descuento:" : "Discount:"}</span>
              <span>-$${order.discountAmount.toFixed(2)}</span>
            </div>`
          : ""
      }
      <div style="display: flex; justify-content: space-between; color: #7c3aed; margin-bottom: 6px; font-weight: 600;">
        <span>Sales Tax (8.25%):</span>
        <span>+$${(order.taxAmount || 0).toFixed(2)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; color: #4b5563; margin-bottom: 8px;">
        <span>${lang === "es" ? "Envío / Delivery:" : "Delivery Fee:"}</span>
        <span>${(order.deliveryFee || 0) > 0 ? `+$${(order.deliveryFee || 0).toFixed(2)}` : lang === "es" ? "Gratis" : "Free"}</span>
      </div>
      <div style="display: flex; justify-content: space-between; border-top: 1.5px solid #d1d5db; padding-top: 8px; font-size: 15px; font-weight: 900; color: #111827;">
        <span>${lang === "es" ? "TOTAL FINAL:" : "TOTAL DUE:"}</span>
        <span style="color: #047857;">$${(order.total || 0).toFixed(2)} USD</span>
      </div>
    </div>
  </div>

  <div style="border-top: 1px solid #e5e7eb; margin-top: 30px; padding-top: 16px; text-align: center; font-size: 11px; color: #9ca3af;">
    <p style="font-weight: bold; color: #4b5563; margin: 0;">
      ${lang === "es" ? "¡Gracias por elegir a Bonbon Flowers Houston para sus momentos especiales!" : "Thank you for choosing Bonbon Flowers Houston for your special moments!"}
    </p>
    <p style="margin: 4px 0 0 0;">Bonbon Flowers Houston • Houston, Texas • www.bonbonflowershouston.com</p>
  </div>
</body>
</html>`;
}

/**
 * Dispara la impresión de forma 100% nativa en JavaScript usando un iframe invisible efímero.
 * No navega, no abre popups molestos y funciona directamente en la máquina del cliente
 * sin requerir Node, Python ni scripts externos.
 */
function printHtmlInHiddenIframe(htmlContent: string): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(false);
      return;
    }

    try {
      const iframe = document.createElement("iframe");
      iframe.setAttribute("style", "position: fixed; right: -9999px; bottom: -9999px; width: 0; height: 0; border: none; opacity: 0; visibility: hidden; pointer-events: none;");
      iframe.setAttribute("aria-hidden", "true");
      document.body.appendChild(iframe);

      const iframeDoc = iframe.contentWindow?.document || iframe.contentDocument;
      if (!iframeDoc || !iframe.contentWindow) {
        if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
        resolve(false);
        return;
      }

      iframeDoc.open();
      iframeDoc.write(htmlContent);
      iframeDoc.close();

      const triggerPrint = () => {
        try {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          // Limpiar iframe luego de la interacción
          setTimeout(() => {
            try {
              if (iframe.parentNode) {
                iframe.parentNode.removeChild(iframe);
              }
            } catch (_) {}
            resolve(true);
          }, 1500);
        } catch (printErr) {
          console.warn("Fallo al invocar print() en iframe:", printErr);
          try {
            if (iframe.parentNode) iframe.parentNode.removeChild(iframe);
          } catch (_) {}
          resolve(false);
        }
      };

      // Dar margen para que renderice el DOM del iframe
      if (iframe.contentWindow.document.readyState === "complete") {
        setTimeout(triggerPrint, 150);
      } else {
        iframe.onload = () => setTimeout(triggerPrint, 150);
      }
    } catch (e) {
      console.warn("Error creando iframe de impresión:", e);
      resolve(false);
    }
  });
}

/**
 * Notifica al servidor que la orden fue impresa en la ticketera física Star Micronics
 */
async function ackOrderPrinted(orderId: string): Promise<void> {
  if (!orderId || orderId.startsWith("TEST-")) return;
  try {
    await fetch("/api/pos/printer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "ack", orderId }),
    });
  } catch (err) {
    console.warn("No se pudo enviar ACK de impresión POS:", err);
  }
}

/**
 * Imprime el Ticket Térmico 80mm en la impresora Star TSP100 de forma directa en JavaScript
 */
export async function printTicket80mmDirect(order: POSOrderData, lang: "es" | "en" = "es"): Promise<boolean> {
  const html = generate80mmTicketHtml(order, lang);
  const success = await printHtmlInHiddenIframe(html);
  if (success && order.orderId) {
    ackOrderPrinted(order.orderId);
  }
  return success;
}

/**
 * Imprime la Factura Estándar A4 / Carta de forma directa en JavaScript
 */
export async function printInvoiceA4Direct(order: POSOrderData, lang: "es" | "en" = "es"): Promise<boolean> {
  const html = generateA4InvoiceHtml(order, lang);
  return await printHtmlInHiddenIframe(html);
}
