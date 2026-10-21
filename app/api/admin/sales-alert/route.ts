import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import { Order } from "@/lib/models/Order";
import { verifyAdminSession } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/admin/sales-alert
 * Devuelve la orden más reciente para alimentar el listener de alarmas sonoras
 * y notificaciones push en tiempo real del panel de administración.
 */
export async function GET(req: NextRequest) {
  try {
    const isAuthed = await verifyAdminSession();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    await dbConnect();
    const latestOrder = await Order.findOne()
      .sort({ createdAt: -1 })
      .select("orderId customerName customerPhone total items createdAt isPrintedToPOS status deliveryMethod address cardMessage")
      .lean();

    if (!latestOrder) {
      return NextResponse.json({ success: true, latestOrder: null });
    }

    const plain = JSON.parse(JSON.stringify(latestOrder));
    return NextResponse.json({ success: true, latestOrder: plain });
  } catch (error: any) {
    console.error("Error en /api/admin/sales-alert:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
