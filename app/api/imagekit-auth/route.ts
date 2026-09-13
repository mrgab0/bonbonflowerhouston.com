import { NextResponse } from "next/server";
import ImageKit from "imagekit";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "public_GgPCFA7xTepF28l1+/AnLhlwqec=";
    const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || "private_wGLJ5fQ/SxRV884E6sNoSaASzK0=";
    const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "https://ik.imagekit.io/4ub2sqhjx";

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
