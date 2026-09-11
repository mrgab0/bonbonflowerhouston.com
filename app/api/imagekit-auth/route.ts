import { NextResponse } from "next/server";
import ImageKit from "imagekit";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_huW/0HuThqhQncgbm14znTZHVpk=";
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "private_default_fallback_key";
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/nzjtc1avv";

    const imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });

    const authenticationParameters = imagekit.getAuthenticationParameters();
    return NextResponse.json(authenticationParameters);
  } catch (error) {
    console.error("Error obteniendo auth parameters de ImageKit:", error);
    return NextResponse.json(
      { error: "No se pudieron generar las credenciales de subida a ImageKit" },
      { status: 500 }
    );
  }
}
