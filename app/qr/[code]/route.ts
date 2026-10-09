import { NextResponse } from 'next/server';
import { GET as handler } from '@/app/q/[code]/route';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  context: { params: Promise<{ code: string }> }
) {
  return handler(request, context);
}
