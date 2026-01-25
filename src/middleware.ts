import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

// Site password protection
const SITE_PASSWORD = process.env.SITE_PASSWORD;
const AUTH_COOKIE_NAME = 'site_access';

// Security headers to add to all responses
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.sentry.io",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.sentry.io https://*.ingest.sentry.io",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'self'",
  ].join('; '),
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check site password protection (if enabled)
  if (SITE_PASSWORD) {
    const isPasswordPage = pathname === '/password';
    const isPasswordApi = pathname === '/api/auth/site-password';
    const isStaticAsset = pathname.startsWith('/_next') || pathname.startsWith('/favicon');

    if (!isPasswordPage && !isPasswordApi && !isStaticAsset) {
      const authCookie = request.cookies.get(AUTH_COOKIE_NAME);

      if (authCookie?.value !== SITE_PASSWORD) {
        const passwordUrl = new URL('/password', request.url);
        return NextResponse.redirect(passwordUrl);
      }
    }
  }

  // Update session first
  const response = await updateSession(request);

  // Add security headers to the response
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
