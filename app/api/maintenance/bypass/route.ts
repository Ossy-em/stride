import { NextRequest, NextResponse } from 'next/server';

// IMPORTANT: Change this password!
const MAINTENANCE_PASSWORD = 'stride-testing-2024';

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    if (password === MAINTENANCE_PASSWORD) {
      const response = NextResponse.json({ success: true });
      
      // Set a cookie that bypasses maintenance mode
      response.cookies.set('maintenance-bypass', MAINTENANCE_PASSWORD, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/',
      });

      return response;
    }

    return NextResponse.json(
      { success: false, error: 'Invalid password' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Invalid request' },
      { status: 400 }
    );
  }
}