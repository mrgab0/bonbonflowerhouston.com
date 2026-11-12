import { NextRequest, NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { sendSingleWebPush, WebPushPayload } from "@/lib/utils/webPush";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const isAuthed = await verifyAdminSession();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const { subscription } = body;

    if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
      return NextResponse.json(
        { success: false, error: "Se requiere la suscripción activa para la prueba" },
        { status: 400 }
      );
    }

    const testPayload: WebPushPayload = {
      title: "🌸 ¡Prueba de Alerta Bonbon Flowers!",
      body: "¡Configuración exitosa! Tu iPhone está listo para recibir notificaciones de ventas en tiempo real con la pantalla apagada.",
      url: "/admin/ordenes",
      icon: "https://bonbonflowershouston.com/logo.png",
      badge: "https://bonbonflowershouston.com/logo.png",
      tag: `test-${Date.now()}`,
    };

    const sent = await sendSingleWebPush(subscription, testPayload);

    if (!sent) {
      return NextResponse.json(
        { success: false, error: "El servicio de notificaciones rechazó el envío de prueba." },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "¡Notificación de prueba enviada a tu teléfono!",
    });
  } catch (error: any) {
    console.error("Error en test de Web Push:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
