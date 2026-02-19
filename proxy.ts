import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Set this to true to enable maintenance mode
const MAINTENANCE_MODE = true;

// Your secret password - CHANGE THIS!
const MAINTENANCE_PASSWORD = 'stride-testing-2024';

export function proxy(request: NextRequest) {
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

  // Check if user has the bypass cookie
  const bypassCookie = request.cookies.get('maintenance-bypass');
  
  if (bypassCookie?.value === MAINTENANCE_PASSWORD) {
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