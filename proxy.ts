import createMiddleware from 'next-intl/middleware';
import {NextRequest, NextResponse} from 'next/server';

const intlMiddleware = createMiddleware({
  // A list of all locales that are supported
  locales: ['en', 'es'],
 
  // Used when no locale matches
  defaultLocale: 'es'
});

export default function middleware(request: NextRequest) {
  console.log('Middleware executing for:', request.nextUrl.pathname);
  return intlMiddleware(request);
}
 
export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(en|es)/:path*']
};
