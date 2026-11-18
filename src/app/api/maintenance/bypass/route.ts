import { NextRequest, NextResponse } from 'next/server';
import { createHash } from 'crypto';
import { clientIp, rateLimit, safeEqual } from '../../../../lib/security';

/**
 * Testing-mode access code. The code lives in MAINTENANCE_PASSWORD (env),
 * never in the source, and the cookie holds a hash of it, not the code.
 */
export async function POST(request: NextRequest) {
  const code = process.env.MAINTENANCE_PASSWORD;
  if (!code) return NextResponse.json({ success: false, error: 'Not available' }, { status: 404 });
  if (!rateLimit(`maint:${clientIp(request)}`, 10, 15 * 60e3)) {
    return NextResponse.json({ success: false, error: 'Too many attempts' }, { status: 429 });
  }
  try {
    const { password } = await request.json();
    if (typeof password === 'string' && safeEqual(password, code)) {
      const response = NextResponse.json({ success: true });
      response.cookies.set('maintenance-bypass', createHash('sha256').update(code).digest('hex'), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      return response;
    }
    return NextResponse.json({ success: false, error: 'Invalid password' }, { status: 401 });
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid request' }, { status: 400 });
  }
}
