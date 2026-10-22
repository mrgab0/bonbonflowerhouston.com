import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { formatTicketText, buildStarPrinterPayload, buildStarRasterPayload } from "@/lib/pos/starPrinter";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

/**
 * GET /api/pos/printer
 * Obtiene órdenes pendientes de imprimir, el payload binario para la Star TSP100,
 * descargas de scripts de auto-impresión o ticket de prueba.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const download = searchParams.get("download");
    const isTest = searchParams.get("test") === "true";
    const format = searchParams.get("format") || "json"; // 'json' | 'raw' | 'text'
    const limit = parseInt(searchParams.get("limit") || "10");

    // 1. Descarga de Scripts para la Computadora de la Tienda
    if (download) {
      const allowedDownloads: Record<string, { filename: string; mime: string }> = {
        bat: { filename: "iniciar-impresora.bat", mime: "application/x-bat" },
        py: { filename: "star-pos-daemon.py", mime: "text/x-python" },
        sh: { filename: "iniciar-impresora.sh", mime: "application/x-sh" },
        js: { filename: "star-pos-daemon.js", mime: "application/javascript" },
      };

      const match = allowedDownloads[download];
      if (match) {
        try {
          const filePath = path.join(process.cwd(), "scripts", match.filename);
          if (fs.existsSync(filePath)) {
            const fileBuffer = fs.readFileSync(filePath);
            return new NextResponse(fileBuffer, {
              status: 200,
              headers: {
                "Content-Type": match.mime,
                "Content-Disposition": `attachment; filename="${match.filename}"`,
              },
            });
          }
        } catch (e) {
          console.error("Error leyendo script para descarga:", e);
        }
      }
    }

    // 2. Ticket de Prueba Simulador (Test Print)
    if (isTest) {
      const testOrder = {
        orderId: "TEST-STAR-80MM",
        customerName: "Cliente de Prueba (Bonbon Flowers)",
        customerPhone: "+1 (346) 739-2730",
        customerEmail: "info@bonbonflowershouston.com",
        address: "1000 Main St, Suite 400, Houston, TX 77002",
        deliveryMethod: "Hand Delivery (Houston)",
        cardMessage: "¡Feliz Aniversario! Que este hermoso arreglo llene su día de amor. Con cariño, Familia Martínez. 🌸💖",
        items: [
          {
            name: "Ramo Buchón 100 Rosas Rojas",
            price: 249.99,
            quantity: 1,
            addons: [
              { name: "Color de Rosas: Rojo Pasión", price: 0 },
              { name: "Corona de Reina Dorada", price: 25.00 },
              { name: "Mariposas Monarca 3D (x4)", price: 15.00 },
              { name: "Listón Personalizado", price: 10.00, customText: "Para la reina de mi corazón" },
            ],
          },
        ],
        subtotal: 299.99,
        taxAmount: 24.75,
        deliveryFee: 15.00,
        total: 339.74,
        createdAt: new Date().toISOString(),
        status: "Pagado (Test)",
      };

      if (format === "raw" || format === "star_raster") {
        const payload = buildStarRasterPayload(testOrder);
        return new NextResponse(new Uint8Array(payload), {
          status: 200,
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="ticket-test-star-raster-576dots.bin"`,
          },
        });
      }

      if (format === "text") {
        const text = formatTicketText(testOrder);
        return new NextResponse(text, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      }

      return NextResponse.json({
        success: true,
        order: testOrder,
        formattedText: formatTicketText(testOrder),
      });
    }

    await dbConnect();

    if (orderId) {
      const order = await Order.findOne({ orderId }).lean();
      if (!order) {
        return NextResponse.json({ success: false, error: "Orden no encontrada" }, { status: 404 });
      }

      const plainOrder = JSON.parse(JSON.stringify(order));

      if (format === "raw" || format === "star_raster") {
        const payload = buildStarRasterPayload(plainOrder);
        return new NextResponse(new Uint8Array(payload), {
          status: 200,
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="ticket-${orderId}-star-raster.bin"`,
          },
        });
      }

      if (format === "text") {
        const text = formatTicketText(plainOrder);
        return new NextResponse(text, {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
          },
        });
      }

      return NextResponse.json({
        success: true,
        order: plainOrder,
        formattedText: formatTicketText(plainOrder),
      });
    }

    // Consulta de órdenes pendientes de imprimir
    const pendingOrders = await Order.find({
      isPrintedToPOS: { $ne: true },
    })
      .sort({ createdAt: 1 })
      .limit(limit)
      .lean();

    const plainPending = JSON.parse(JSON.stringify(pendingOrders));

    return NextResponse.json({
      success: true,
      pendingCount: plainPending.length,
      orders: plainPending,
    });
  } catch (error: any) {
    console.error("Error en API /api/pos/printer GET:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/pos/printer
 * Confirmación de impresión (ACK) o reseteo de orden
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const { action, orderId } = body;

    if (!action) {
      return NextResponse.json({ success: false, error: "Acción requerida (ack, reset)" }, { status: 400 });
    }

    if (action === "ack") {
      if (!orderId) {
        return NextResponse.json({ success: false, error: "orderId requerido para ACK" }, { status: 400 });
      }

      const updated = await Order.findOneAndUpdate(
        { orderId },
        {
          $set: {
            isPrintedToPOS: true,
            printedAtPOS: new Date(),
          },
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: `Orden ${orderId} marcada como impresa en ticketera Star Micronics.`,
        order: updated,
      });
    }

    if (action === "reset") {
      if (!orderId) {
        return NextResponse.json({ success: false, error: "orderId requerido para reset" }, { status: 400 });
      }

      const updated = await Order.findOneAndUpdate(
        { orderId },
        {
          $set: {
            isPrintedToPOS: false,
          },
          $unset: {
            printedAtPOS: "",
          },
        },
        { new: true }
      );

      return NextResponse.json({
        success: true,
        message: `Orden ${orderId} reseteada para reimpresión automática.`,
        order: updated,
      });
    }

    if (action === "print_tcp") {
      const targetIp = (body.printerIp || process.env.PRINTER_IP || process.env.STAR_PRINTER_IP || "").trim();
      if (!targetIp) {
        return NextResponse.json(
          { success: false, error: "IP de impresora no configurada. Define la variable de entorno PRINTER_IP o envía printerIp." },
          { status: 400 }
        );
      }

      let payload: Buffer;
      if (orderId && orderId !== "TEST-STAR-80MM") {
        const order = await Order.findOne({ orderId }).lean();
        if (!order) {
          return NextResponse.json({ success: false, error: "Orden no encontrada" }, { status: 404 });
        }
        payload = buildStarRasterPayload(JSON.parse(JSON.stringify(order)));
      } else {
        // Ticket de prueba calibrador
        payload = buildStarRasterPayload({
          orderId: "TEST-STAR-80MM",
          customerName: "Cliente de Prueba (Bonbon Flowers)",
          customerPhone: "+1 (346) 739-2730",
          customerEmail: "info@bonbonflowershouston.com",
          address: "1000 Main St, Suite 400, Houston, TX 77002",
          deliveryMethod: "Hand Delivery (Houston)",
          cardMessage: "¡Prueba de Impresión Star Graphic Raster 576 dots OK! 🌹",
          items: [{ name: "Ramo de Rosas Test 80mm", price: 99.99, quantity: 1 }],
          total: 99.99,
          createdAt: new Date(),
        });
      }

      try {
        const net = await import("net");
        await new Promise<void>((resolve, reject) => {
          const client = new net.Socket();
          client.setTimeout(6000);
          client.connect(9100, targetIp, () => {
            client.write(payload, () => {
              setTimeout(() => {
                client.end();
                resolve();
              }, 400);
            });
          });
          client.on("error", (err) => reject(err));
          client.on("timeout", () => {
            client.destroy();
            reject(new Error(`Timeout conectando con ${targetIp}:9100`));
          });
        });

        if (orderId && orderId !== "TEST-STAR-80MM") {
          await Order.findOneAndUpdate(
            { orderId },
            { $set: { isPrintedToPOS: true, printedAtPOS: new Date() } }
          );
        }

        return NextResponse.json({
          success: true,
          message: `Ticket enviado con éxito a ${targetIp}:9100 en modo Star Graphic Raster (576 dots).`,
        });
      } catch (tcpErr: any) {
        console.error("Error al conectar por TCP a la impresora:", tcpErr);
        return NextResponse.json(
          {
            success: false,
            error: `Fallo de conexión TCP a ${targetIp}:9100 -> ${tcpErr?.message || tcpErr}`,
          },
          { status: 502 }
        );
      }
    }

    return NextResponse.json({ success: false, error: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error en API /api/pos/printer POST:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
