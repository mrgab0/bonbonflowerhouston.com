/**
 * Motor de Renderizado Raster Monocromático a 576 dots (203 DPI / 72mm)
 * para Impresoras Térmicas Star Micronics TSP100III (TSP143IIILAN)
 * 
 * Modo nativo de hardware: Star GraphicMode (StarPRNT / Raster)
 * Especificación:
 *   - Ancho físico: 80 mm
 *   - Ancho imprimible: 72 mm (576 puntos / 72 bytes por línea horizontal)
 *   - Resolución: 203 DPI (8 dots/mm)
 *   - Comandos Star Raster:
 *       ESC * r R  (\x1b\x2a\x72\x52) -> Inicializar modo raster
 *       ESC * r A  (\x1b\x2a\x72\x41) -> Activar modo Star Graphic Raster
 *       ESC * r C  (\x1b\x2a\x72\x43) -> Limpiar buffer de imagen
 *       b \x48\x00 [72 bytes]         -> Transferir línea de 576 dots con avance automático de 1 dot
 *       ESC FF NUL (\x1b\x0c\x00)     -> Ejecución de página raster
 *       ESC * r B  (\x1b\x2a\x72\x42) -> Salir de modo raster
 *       ESC d 2    (\x1b\x64\x02)     -> Corte de guillotina parcial
 */

import { FONT_8X8 } from "./font8x8";
import { TicketOrderData } from "./starPrinter";

export const STAR_RASTER_WIDTH_DOTS = 576;
export const STAR_RASTER_BYTES_PER_LINE = 72; // 576 / 8 = 72 bytes

export interface TextRenderOptions {
  scaleX?: number; // 1 = 8 dots, 2 = 16 dots, 3 = 24 dots
  scaleY?: number; // 1 = 8 dots, 2 = 16 dots, 3 = 24 dots
  bold?: boolean;
}

/**
 * Lienzo en memoria de 576 dots monocromático con altura dinámica.
 */
export class StarRasterCanvas {
  public readonly width: number = STAR_RASTER_WIDTH_DOTS;
  public readonly bytesPerLine: number = STAR_RASTER_BYTES_PER_LINE;
  private rows: Uint8Array[] = [];

  constructor(initialHeight = 100) {
    this.ensureHeight(initialHeight);
  }

  public get height(): number {
    return this.rows.length;
  }

  public ensureHeight(targetHeight: number): void {
    while (this.rows.length < targetHeight) {
      this.rows.push(new Uint8Array(this.bytesPerLine));
    }
  }

  /**
   * Enciende o apaga un punto (1 = negro/impreso, 0 = blanco).
   */
  public setPixel(x: number, y: number, value = true): void {
    if (x < 0 || x >= this.width || y < 0) return;
    this.ensureHeight(y + 1);

    const byteIndex = Math.floor(x / 8);
    const bitIndex = 7 - (x % 8); // MSB first (bit 7 es el punto más a la izquierda)

    if (value) {
      this.rows[y][byteIndex] |= 1 << bitIndex;
    } else {
      this.rows[y][byteIndex] &= ~(1 << bitIndex);
    }
  }

  /**
   * Dibuja una línea horizontal sólida.
   */
  public drawHLine(y: number, thickness = 1, startX = 0, endX = this.width): void {
    for (let t = 0; t < thickness; t++) {
      const curY = y + t;
      for (let x = startX; x < endX; x++) {
        this.setPixel(x, curY, true);
      }
    }
  }

  /**
   * Dibuja una línea horizontal punteada o de guiones.
   */
  public drawDashedLine(y: number, dashLen = 8, gapLen = 4, startX = 0, endX = this.width): void {
    let drawing = true;
    let count = 0;
    for (let x = startX; x < endX; x++) {
      if (drawing) {
        this.setPixel(x, y, true);
        count++;
        if (count >= dashLen) {
          drawing = false;
          count = 0;
        }
      } else {
        count++;
        if (count >= gapLen) {
          drawing = true;
          count = 0;
        }
      }
    }
  }

  /**
   * Dibuja una línea doble de separación elegante.
   */
  public drawDoubleLine(y: number, startX = 0, endX = this.width): void {
    this.drawHLine(y, 1, startX, endX);
    this.drawHLine(y + 3, 1, startX, endX);
  }

  /**
   * Renderiza un glifo individual del mapa de bits 8x8 con escalado.
   */
  public drawChar(
    char: string,
    x: number,
    y: number,
    scaleX = 1,
    scaleY = 2,
    bold = false
  ): number {
    const code = char.charCodeAt(0);
    const glyph = FONT_8X8[code] || FONT_8X8[32] || [0, 0, 0, 0, 0, 0, 0, 0];

    for (let row = 0; row < 8; row++) {
      const rowBits = glyph[row];
      for (let col = 0; col < 8; col++) {
        const isSet = (rowBits & (1 << col)) !== 0;
        if (isSet) {
          for (let sy = 0; sy < scaleY; sy++) {
            for (let sx = 0; sx < scaleX; sx++) {
              const px = x + col * scaleX + sx;
              const py = y + row * scaleY + sy;
              this.setPixel(px, py, true);
              if (bold) {
                this.setPixel(px + 1, py, true);
              }
            }
          }
        }
      }
    }

    const charWidth = 8 * scaleX + (bold ? 1 : 0);
    return charWidth;
  }

  /**
   * Renderiza una cadena de texto en las coordenadas (x, y).
   */
  public drawText(
    text: string,
    x: number,
    y: number,
    options?: TextRenderOptions
  ): number {
    const scaleX = options?.scaleX || 1;
    const scaleY = options?.scaleY || 2;
    const bold = options?.bold || false;

    let curX = x;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (curX + 8 * scaleX > this.width) break; // Límite derecho del papel
      const w = this.drawChar(ch, curX, y, scaleX, scaleY, bold);
      curX += w;
    }
    return y + 8 * scaleY;
  }

  /**
   * Centra un texto en la línea horizontal indicada.
   */
  public drawCenteredText(
    text: string,
    y: number,
    options?: TextRenderOptions
  ): number {
    const scaleX = options?.scaleX || 1;
    const scaleY = options?.scaleY || 2;
    const bold = options?.bold || false;

    const charWidth = 8 * scaleX + (bold ? 1 : 0);
    const totalTextWidth = text.length * charWidth;
    const startX = Math.max(0, Math.floor((this.width - totalTextWidth) / 2));

    this.drawText(text, startX, y, options);
    return y + 8 * scaleY;
  }

  /**
   * Dibuja una fila justificada con texto a la izquierda y derecha (ej. "Ramo de Rosas ..... $120.00").
   */
  public drawTwoColumnRow(
    leftText: string,
    rightText: string,
    y: number,
    options?: TextRenderOptions
  ): number {
    const scaleX = options?.scaleX || 1;
    const scaleY = options?.scaleY || 2;
    const bold = options?.bold || false;
    const charWidth = 8 * scaleX + (bold ? 1 : 0);

    const rightWidth = rightText.length * charWidth;
    const rightStartX = Math.max(0, this.width - rightWidth - 4);

    // Truncar texto izquierdo si colisiona con la columna derecha
    const maxLeftWidth = rightStartX - 8;
    let cleanLeft = leftText;
    while (cleanLeft.length * charWidth > maxLeftWidth && cleanLeft.length > 0) {
      cleanLeft = cleanLeft.slice(0, -1);
    }

    this.drawText(cleanLeft, 4, y, options);
    this.drawText(rightText, rightStartX, y, options);

    return y + 8 * scaleY;
  }

  /**
   * Exporta el lienzo completo empaquetado en el formato binario nativo Star Graphic Raster.
   */
  public exportStarRasterBuffer(): Buffer {
    const chunks: Buffer[] = [];

    // 1. Inicialización y Entrada a Modo Raster
    chunks.push(Buffer.from([0x1b, 0x2a, 0x72, 0x52])); // ESC * r R (Reset raster mode)
    chunks.push(Buffer.from([0x1b, 0x2a, 0x72, 0x41])); // ESC * r A (Enter raster mode)
    chunks.push(Buffer.from([0x1b, 0x2a, 0x72, 0x43])); // ESC * r C (Clear raster buffer)

    // 2. Envío de líneas de raster (Comando 'b' con auto line-feed de 1 dot)
    // Formato: 0x62 ('b'), longitud Low-Byte (0x48 = 72), longitud High-Byte (0x00), seguidos de 72 bytes.
    const lineHeader = Buffer.from([0x62, 0x48, 0x00]);

    for (let r = 0; r < this.rows.length; r++) {
      chunks.push(lineHeader);
      chunks.push(Buffer.from(this.rows[r]));
    }

    // 3. Form Feed / Ejecución de Página Raster
    chunks.push(Buffer.from([0x1b, 0x0c, 0x00])); // ESC FF NUL

    // 4. Salir de Modo Raster
    chunks.push(Buffer.from([0x1b, 0x2a, 0x72, 0x42])); // ESC * r B (Quit raster mode)

    // 5. Margen mínimo estricto al ras de la cuchilla física
    chunks.push(Buffer.from("\n\n", "latin1"));

    // 6. Corte automático de guillotina (Corte al ras del último pixel)
    // Comando Star Line/Raster Cutter (ESC d 2 = Partial Cut)
    chunks.push(Buffer.from([0x1b, 0x64, 0x02]));

    // Comando ESC/POS universal de respaldo (GS V 65 0)
    chunks.push(Buffer.from([0x1d, 0x56, 0x41, 0x00]));

    return Buffer.concat(chunks);
  }
}

/**
 * Convierte un objeto de orden en un payload binario Star Graphic Raster ultra-compacto (Eco-Paper)
 */
export function buildStarRasterPayload(order: TicketOrderData, lang: "es" | "en" = "es"): Buffer {
  const canvas = new StarRasterCanvas(200);
  let y = 2; // Margen superior mínimo en dots

  const isEs = lang === "es";

  // ENCABEZADO BOUTIQUE ULTRA-COMPACTO
  y = canvas.drawCenteredText("BONBON FLOWERS HOUSTON", y, { scaleX: 2, scaleY: 2, bold: true }) + 2;
  y = canvas.drawCenteredText("High Floral Design • Tel: (346) 739-2730", y, { scaleX: 1, scaleY: 2 }) + 4;

  canvas.drawDoubleLine(y);
  y += 5;

  // ORDEN Y FECHA EN 1 FILA
  const dateStr = new Date(order.createdAt).toLocaleDateString(isEs ? "es-US" : "en-US", {
    month: "2-digit",
    day: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
  y = canvas.drawTwoColumnRow(`ORDEN #${order.orderId || "N/A"}`, dateStr, y, { scaleX: 1, scaleY: 2, bold: true }) + 2;

  // CLIENTE Y DIRECCIÓN EN 2 LÍNEAS
  y = canvas.drawText(`Cliente: ${order.customerName} ${order.customerPhone ? `(${order.customerPhone})` : ""}`, 4, y, { scaleX: 1, scaleY: 2 }) + 2;
  if (order.address) {
    y = canvas.drawText(`Entrega: ${order.address}`, 4, y, { scaleX: 1, scaleY: 2 }) + 2;
  }

  // DEDICATORIA COMPACTA
  if (order.cardMessage && order.cardMessage.trim()) {
    canvas.drawDashedLine(y);
    y += 4;
    y = canvas.drawText(`💌 "${order.cardMessage.trim()}"`, 4, y, { scaleX: 1, scaleY: 2, bold: true }) + 2;
  }

  canvas.drawDoubleLine(y);
  y += 5;

  // CABECERA DE ÍTEMS
  y = canvas.drawTwoColumnRow(
    isEs ? "DESCRIPCION" : "ITEM",
    isEs ? "TOTAL" : "TOTAL",
    y,
    { scaleX: 1, scaleY: 2, bold: true }
  ) + 2;
  canvas.drawHLine(y);
  y += 4;

  // ÍTEMS Y ADICIONALES COMPACTOS
  let itemsSubtotal = 0;
  for (const item of order.items || []) {
    const qty = item.quantity || 1;
    const price = item.price || 0;
    const sub = qty * price;
    itemsSubtotal += sub;

    y = canvas.drawTwoColumnRow(
      `${qty}x ${item.name}`,
      `$${sub.toFixed(2)}`,
      y,
      { scaleX: 1, scaleY: 2, bold: true }
    ) + 1;

    if (item.addons && item.addons.length > 0) {
      for (const addon of item.addons) {
        const aName = addon.name || addon.value || "";
        const aPrice = addon.price ? `(+$${addon.price.toFixed(2)})` : "";
        y = canvas.drawText(` + ${aName} ${aPrice}`, 4, y, { scaleX: 1, scaleY: 1 }) + 1;
      }
    }
  }

  canvas.drawDashedLine(y);
  y += 4;

  // TOTALES FINANCIEROS COMPACTOS
  const deliveryStr =
    (order.deliveryFee || 0) > 0
      ? `+$${order.deliveryFee?.toFixed(2)}`
      : isEs
      ? "Gratis"
      : "Free";

  y = canvas.drawTwoColumnRow(
    `Subtotal: $${itemsSubtotal.toFixed(2)} | Tax: +$${(order.taxAmount || 0).toFixed(2)}`,
    `Envio: ${deliveryStr}`,
    y,
    { scaleX: 1, scaleY: 2 }
  ) + 2;

  if (order.discountAmount && order.discountAmount > 0) {
    y = canvas.drawTwoColumnRow("Descuento:", `-$${order.discountAmount.toFixed(2)}`, y, { scaleX: 1, scaleY: 2 }) + 2;
  }

  canvas.drawDoubleLine(y);
  y += 5;

  // TOTAL FINAL PROMINENTE
  y = canvas.drawTwoColumnRow(
    isEs ? "TOTAL A PAGAR:" : "TOTAL DUE:",
    `$${(order.total || 0).toFixed(2)} USD`,
    y,
    { scaleX: 1, scaleY: 2, bold: true }
  ) + 4;

  // PIE DE RECIBO AL RAS DEL CORTE
  y = canvas.drawCenteredText("¡Gracias por su compra! ♡ bonbonflowershouston.com", y, { scaleX: 1, scaleY: 2, bold: true }) + 2;

  return canvas.exportStarRasterBuffer();
}
