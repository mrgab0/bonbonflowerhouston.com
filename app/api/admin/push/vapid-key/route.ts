import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/adminAuth";
import { getOrGenerateVapidKeys } from "@/lib/utils/webPush";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const isAuthed = await verifyAdminSession();
    if (!isAuthed) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { publicKey } = await getOrGenerateVapidKeys();
    return NextResponse.json({ success: true, publicKey });
  } catch (error: any) {
    console.error("Error obteniendo clave pública VAPID:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
