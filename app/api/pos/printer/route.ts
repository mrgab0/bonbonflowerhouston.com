import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { formatTicketText, buildStarPrinterPayload } from "@/lib/pos/starPrinter";

export const dynamic = "force-dynamic";

/**
 * GET /api/pos/printer
 * Obtiene órdenes pendientes de imprimir o el payload binario para la Star TSP100
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("orderId");
    const format = searchParams.get("format") || "json"; // 'json' | 'raw' | 'text'
    const limit = parseInt(searchParams.get("limit") || "10");

    if (orderId) {
      const order = await Order.findOne({ orderId }).lean();
      if (!order) {
        return NextResponse.json({ success: false, error: "Orden no encontrada" }, { status: 404 });
      }

      const plainOrder = JSON.parse(JSON.stringify(order));

      if (format === "raw") {
        const payload = buildStarPrinterPayload(plainOrder);
        return new NextResponse(new Uint8Array(payload), {
          status: 200,
          headers: {
            "Content-Type": "application/octet-stream",
            "Content-Disposition": `attachment; filename="ticket-${orderId}.bin"`,
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

    return NextResponse.json({ success: false, error: "Acción no reconocida" }, { status: 400 });
  } catch (error: any) {
    console.error("Error en API /api/pos/printer POST:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
