import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const url = new URL(request.url);
  url.pathname = '/admin/qr';
  return NextResponse.redirect(url, 308);
}
