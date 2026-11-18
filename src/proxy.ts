import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Testing mode: set MAINTENANCE_MODE=on and MAINTENANCE_PASSWORD in the
// environment. The code is never in the source.
const MAINTENANCE_MODE = process.env.MAINTENANCE_MODE === 'on';

async function sha256(text: string) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function proxy(request: NextRequest) {
  // Skip middleware for API routes, static files, and auth callbacks
  if (
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/icons') ||
    request.nextUrl.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // If maintenance mode is disabled, allow all traffic
  if (!MAINTENANCE_MODE) {
    return NextResponse.next();
  }

  // Check if user has the bypass cookie (a hash of the access code)
  const code = process.env.MAINTENANCE_PASSWORD;
  const bypassCookie = request.cookies.get('maintenance-bypass');
  if (code && bypassCookie?.value === (await sha256(code))) {
    return NextResponse.next();
  }

  // Allow access to the maintenance login page
  if (request.nextUrl.pathname === '/maintenance-login') {
    return NextResponse.next();
  }

  // Redirect everyone else to maintenance login
  return NextResponse.redirect(new URL('/maintenance-login', request.url));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};