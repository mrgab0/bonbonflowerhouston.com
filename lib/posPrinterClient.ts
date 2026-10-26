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
/**
 * Genera el documento HTML para la COMANDA DE TALLER & PREPARACIÓN (70mm)
 * Diseñada para floristas: desglose de papel, color/conteo de rosas, corona,
 * listón con texto, tarjeta de dedicatoria e indicador de tarjeta adicional.
 * Ancho calibrado: 68mm - 70mm (sin desborde ni avance de 2m de papel).
 */
export function generate70mmComandaHtml(order: POSOrderData, lang: "es" | "en" = "es"): string {
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

  // Detección de tarjeta adicional en addons
  const hasAdditionalCard = items.some((it) =>
    (it.addons || []).some((a) => {
      const txt = (a.name || a.value || "").toLowerCase();
      return txt.includes("tarjeta") || txt.includes("card") || txt.includes("dedicatoria extra");
    })
  );

  // Desglose técnico de productos para floristería
  const itemsHtml = items
    .map((item, idx) => {
      const addons = item.addons || [];

      // Categorización inteligente de adicionales
      const roseSpecs = addons.filter((a) => {
        const t = (a.name || a.value || "").toLowerCase();
        return t.includes("rosa") || t.includes("color") || t.includes("flower");
      });

      const paperSpecs = addons.filter((a) => {
        const t = (a.name || a.value || "").toLowerCase();
        return t.includes("papel") || t.includes("envoltura") || t.includes("wrap");
      });

      const ribbonSpecs = addons.filter((a) => {
        const t = (a.name || a.value || "").toLowerCase();
        return t.includes("liston") || t.includes("listón") || t.includes("lazo") || t.includes("ribbon") || a.customText;
      });

      const accessoriesSpecs = addons.filter((a) => {
        const t = (a.name || a.value || "").toLowerCase();
        return (
          t.includes("corona") ||
          t.includes("tiara") ||
          t.includes("mariposa") ||
          t.includes("luz") ||
          t.includes("led") ||
          t.includes("perla") ||
          t.includes("pin")
        );
      });

      const sweetsAndPlush = addons.filter((a) => {
        const t = (a.name || a.value || "").toLowerCase();
        return (
          t.includes("chocolate") ||
          t.includes("ferrero") ||
          t.includes("dulce") ||
          t.includes("peluche") ||
          t.includes("globo") ||
          t.includes("balloon")
        );
      });

      const otherAddons = addons.filter(
        (a) =>
          !roseSpecs.includes(a) &&
          !paperSpecs.includes(a) &&
          !ribbonSpecs.includes(a) &&
          !accessoriesSpecs.includes(a) &&
          !sweetsAndPlush.includes(a)
      );

      return `
        <div style="margin-bottom: 6px; padding-bottom: 5px; border-bottom: 1.5px dashed #000;">
          <div style="font-size: 11.5px; font-weight: 900; background: #000; color: #fff; padding: 2px 4px; text-transform: uppercase;">
            ARREGLO #${idx + 1}: ${item.quantity || 1}x ${item.name}
          </div>

          <!-- Ficha Técnica de Preparación -->
          <div style="padding: 3px 2px; font-size: 10px; line-height: 1.25;">
            ${
              roseSpecs.length > 0
                ? `<div style="margin-top: 2px;">
                    <strong style="text-decoration: underline;">🌹 ROSAS & COLOR:</strong>
                    ${roseSpecs
                      .map((r) => `<div style="padding-left: 6px; font-weight: bold;">• ${r.name || ""}: ${r.value || ""}${r.price ? ` (+$${r.price.toFixed(2)})` : ""}</div>`)
                      .join("")}
                  </div>`
                : ""
            }

            ${
              paperSpecs.length > 0
                ? `<div style="margin-top: 2px;">
                    <strong style="text-decoration: underline;">📜 PAPEL / ENVOLTURA:</strong>
                    ${paperSpecs
                      .map((p) => `<div style="padding-left: 6px; font-weight: bold;">• ${p.value || p.name}</div>`)
                      .join("")}
                  </div>`
                : ""
            }

            ${
              ribbonSpecs.length > 0
                ? `<div style="margin-top: 2px;">
                    <strong style="text-decoration: underline;">🎀 LISTÓN PERSONALIZADO:</strong>
                    ${ribbonSpecs
                      .map(
                        (rb) => `<div style="padding-left: 6px;">
                          • ${rb.value || rb.name}
                          ${rb.customText ? `<div style="font-weight: 900; background: #e5e5e5; padding: 1px 4px; margin-top: 1px; border: 1px solid #000;">GRABAR: "${rb.customText}"</div>` : ""}
                        </div>`
                      )
                      .join("")}
                  </div>`
                : ""
            }

            ${
              accessoriesSpecs.length > 0
                ? `<div style="margin-top: 2px;">
                    <strong style="text-decoration: underline;">👑 CORONA & ACCESORIOS:</strong>
                    ${accessoriesSpecs
                      .map((ac) => `<div style="padding-left: 6px; font-weight: bold;">• ${ac.value || ac.name}</div>`)
                      .join("")}
                  </div>`
                : ""
            }

            ${
              sweetsAndPlush.length > 0
                ? `<div style="margin-top: 2px;">
                    <strong style="text-decoration: underline;">🍫 CHOCOLATES / EXTRAS:</strong>
                    ${sweetsAndPlush
                      .map((sw) => `<div style="padding-left: 6px; font-weight: bold;">• ${sw.value || sw.name}</div>`)
                      .join("")}
                  </div>`
                : ""
            }

            ${
              otherAddons.length > 0
                ? `<div style="margin-top: 2px;">
                    <strong>✨ OTROS DETALLES:</strong>
                    ${otherAddons
                      .map((ot) => `<div style="padding-left: 6px;">• ${ot.value || ot.name}</div>`)
                      .join("")}
                  </div>`
                : ""
            }
          </div>

          <div style="text-align: right; font-weight: bold; font-size: 9.5px; margin-top: 2px;">
            Subtotal Arreglo: $${((item.price || 0) * (item.quantity || 1)).toFixed(2)} USD
          </div>
        </div>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Comanda 70mm - #${order.orderId}</title>
  <style>
    @page {
      size: auto;
      margin: 0mm !important;
    }
    @media print {
      html, body {
        width: 68mm !important;
        max-width: 70mm !important;
        margin: 0 !important;
        padding: 0 !important;
        background: #fff !important;
        color: #000 !important;
        height: auto !important;
        min-height: 0 !important;
        max-height: fit-content !important;
        overflow: hidden !important;
        page-break-after: avoid !important;
        page-break-before: avoid !important;
        break-after: avoid !important;
        break-before: avoid !important;
      }
      #comanda-root {
        width: 68mm !important;
        max-width: 70mm !important;
        margin: 0 auto !important;
        padding: 1mm 1mm 2mm 1mm !important;
        page-break-inside: avoid !important;
        break-inside: avoid !important;
      }
    }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, monospace;
      font-size: 9.5px;
      line-height: 1.2;
      color: #000;
      background: #fff;
      width: 68mm;
      max-width: 70mm;
      margin: 0 auto;
      padding: 1mm 1mm 2mm 1mm;
    }
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .font-bold { font-weight: bold; }
    .font-black { font-weight: 900; }
    .uppercase { text-transform: uppercase; }
    .border-b-dashed { border-bottom: 1.5px dashed #000; }
    .border-b-solid { border-bottom: 2px solid #000; }
    .py-05 { padding-top: 2px; padding-bottom: 2px; }
    .flex-between { display: flex; justify-content: space-between; align-items: flex-start; }
    .highlight-box {
      border: 1.5px solid #000;
      padding: 4px;
      margin: 4px 0;
      background: #fafafa;
    }
  </style>
</head>
<body>
  <div id="comanda-root">
    <!-- Encabezado de Comanda -->
    <div class="text-center py-05 border-b-dashed">
      <div class="font-black uppercase" style="font-size: 13px; letter-spacing: 0.5px;">BONBON FLOWERS</div>
      <div class="font-black uppercase" style="font-size: 10px; background: #000; color: #fff; padding: 1px 0; margin-top: 1px;">
        *** COMANDA DE TALLER & PRODUCCIÓN ***
      </div>
      <div style="font-size: 8.5px; font-weight: bold; margin-top: 2px;">Houston Boutique • Tel: (346) 739-2730</div>
    </div>

    <!-- Metadatos de la Orden -->
    <div class="py-05 border-b-dashed" style="font-size: 10px;">
      <div class="flex-between font-black" style="font-size: 11px;">
        <span>ORDEN: #${order.orderId}</span>
        <span style="font-size: 9px; font-weight: bold;">${dateFormatted}</span>
      </div>
      <div style="margin-top: 2px;">
        <span class="font-bold">CLIENTE:</span> ${order.customerName}
      </div>
      <div style="margin-top: 1px;">
        <span class="font-bold">TELÉFONO:</span> ${order.customerPhone || "N/A"}
      </div>
      <div style="margin-top: 1px; word-break: break-word;">
        <span class="font-bold">MODALIDAD:</span> ${order.deliveryMethod || "Entrega Estándar"}
      </div>
      ${
        order.address
          ? `<div style="margin-top: 1px; word-break: break-word; background: #f0f0f0; padding: 2px; border: 1px solid #ccc;">
              <strong style="text-decoration: underline;">DIRECCIÓN DE ENTREGA:</strong>
              <div>${order.address}</div>
            </div>`
          : ""
      }
    </div>

    <!-- Tarjeta de Dedicatoria Impresa -->
    <div class="highlight-box">
      <div style="font-weight: 900; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 2px;">
        💌 MENSAJE PARA TARJETA DE REGALO:
      </div>
      <div style="font-style: italic; font-weight: bold; font-size: 10.5px; margin: 3px 0; word-break: break-word; line-height: 1.25;">
        ${order.cardMessage ? `"${order.cardMessage}"` : "(Sin mensaje personalizado para tarjeta)"}
      </div>
      <div style="font-size: 9px; font-weight: 900; border-top: 1px dashed #000; padding-top: 2px; margin-top: 2px;">
        ¿TARJETA ADICIONAL?: ${hasAdditionalCard ? "✅ SÍ (COLOCAR TARJETA EXTRA)" : "❌ NO (Solo tarjeta regular)"}
      </div>
    </div>

    <!-- Desglose de Producción Floral -->
    <div class="py-05">
      <div style="font-weight: 900; font-size: 10px; text-transform: uppercase; border-bottom: 1px solid #000; margin-bottom: 3px;">
        🌸 ESPECIFICACIONES TÉCNICAS DEL ARREGLO:
      </div>
      ${itemsHtml}
    </div>

    <!-- Totales y Pago Interno -->
    <div class="py-05 border-b-dashed" style="font-size: 9.5px;">
      <div class="flex-between">
        <span>Subtotal: $${itemsSubtotal.toFixed(2)}</span>
        <span>Tax: +$${(order.taxAmount || 0).toFixed(2)}</span>
      </div>
      <div class="flex-between">
        <span>Envío: ${(order.deliveryFee || 0) > 0 ? `+$${(order.deliveryFee || 0).toFixed(2)}` : "Gratis"}</span>
        ${order.discountAmount ? `<span>Desc: -$${order.discountAmount.toFixed(2)}</span>` : "<span></span>"}
      </div>
      <div class="flex-between font-black border-b-solid" style="font-size: 11px; margin-top: 2px; padding-top: 2px; border-top: 1px solid #000;">
        <span>TOTAL COBRADO:</span>
        <span>$${(order.total || 0).toFixed(2)} USD</span>
      </div>
      <div style="font-size: 8.5px; margin-top: 2px;" class="flex-between">
        <span>Método: ${order.paymentMethod || "Zelle / Efectivo"}</span>
        <span>Ref: ${order.paymentRef || "N/A"}</span>
      </div>
    </div>

    <!-- Pie de Comanda al Ras -->
    <div class="text-center" style="font-size: 8.5px; padding-top: 3px; font-weight: bold;">
      <div>¡Preparar con amor y máxima frescura floral! ♡</div>
      <div style="font-size: 7.5px; color: #555;">Bonbon Flowers Houston • Taller de Arte Floral</div>
    </div>
  </div>
</body>
</html>`;
}

// Mantener alias para compatibilidad total:
export const generate80mmTicketHtml = generate70mmComandaHtml;


/**
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
      iframe.setAttribute("style", "position: fixed; top: 0; left: 0; width: 70mm; height: 100vh; border: none; opacity: 0; z-index: -9999; pointer-events: none;");
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
