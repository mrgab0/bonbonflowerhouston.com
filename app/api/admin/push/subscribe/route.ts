import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import dbConnect from "@/lib/db";
import { PushSubscription } from "@/lib/models/PushSubscription";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const isAuthed = await verifyAdminSession();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { subscription, userAgent } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { success: false, error: "Datos de suscripción incompletos" },
        { status: 400 }
      );
    }

    await dbConnect();

    await PushSubscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        $set: {
          keys: {
            p256dh: subscription.keys.p256dh,
            auth: subscription.keys.auth,
          },
          role: "admin",
          userAgent: userAgent || "Unknown Device",
          updatedAt: new Date(),
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, message: "Suscripción registrada con éxito" });
  } catch (error: any) {
    console.error("Error guardando suscripción Web Push:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const isAuthed = await verifyAdminSession();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { endpoint } = body;

    if (endpoint) {
      await dbConnect();
      await PushSubscription.deleteOne({ endpoint });
    }

    return NextResponse.json({ success: true, message: "Suscripción eliminada" });
  } catch (error: any) {
    console.error("Error eliminando suscripción Web Push:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
