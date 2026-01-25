import { NextRequest, NextResponse } from 'next/server';

const SITE_PASSWORD = process.env.SITE_PASSWORD;
const AUTH_COOKIE_NAME = 'site_access';

export async function POST(request: NextRequest) {
  if (!SITE_PASSWORD) {
    return NextResponse.json({ error: 'Password protection not enabled' }, { status: 400 });
  }

  const body = await request.json();
  const { password } = body;

  if (password === SITE_PASSWORD) {
    const response = NextResponse.json({ success: true });

    response.cookies.set(AUTH_COOKIE_NAME, SITE_PASSWORD, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  }

  return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
}
