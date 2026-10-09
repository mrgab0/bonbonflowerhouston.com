import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { DynamicQR } from '@/lib/models/DynamicQR';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const cleanCode = (code || '').trim().toLowerCase();

    await dbConnect();
    const qr = await DynamicQR.findOne({ code: cleanCode, isActive: true });

    if (!qr || !qr.destinationUrl) {
      // Si el código no existe o está desactivado, redirigir a la tienda principal
      return NextResponse.redirect(new URL('/', request.url), 302);
    }

    // Incrementar conteo de escaneos de forma asíncrona
    DynamicQR.findByIdAndUpdate(qr._id, {
      $inc: { scanCount: 1 },
      lastScannedAt: new Date(),
    }).exec().catch((err: any) => console.error("Error updating scan count:", err));

    let destination = qr.destinationUrl.trim();
    if (!destination.startsWith('http://') && !destination.startsWith('https://')) {
      destination = 'https://' + destination;
    }

    // Redirección temporal 307 para evitar que el navegador guarde en caché el destino final
    return NextResponse.redirect(destination, 307);
  } catch (error) {
    console.error('Error handling dynamic QR redirect:', error);
    return NextResponse.redirect(new URL('/', request.url), 302);
  }
}
