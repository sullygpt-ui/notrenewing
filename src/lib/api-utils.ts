import { NextResponse } from 'next/server';
import { rateLimit, getClientIp, RateLimitConfig } from './rate-limit';

export function rateLimitResponse(remaining: number, resetTime: number) {
  return NextResponse.json(
    { error: 'Too many requests. Please try again later.' },
    {
      status: 429,
      headers: {
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': resetTime.toString(),
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString(),
      },
    }
  );
}

export function checkRateLimit(
  request: Request,
  prefix: string,
  config?: RateLimitConfig
): { allowed: boolean; response?: NextResponse } {
  const ip = getClientIp(request);
  const result = rateLimit(`${prefix}:${ip}`, config);

  if (!result.success) {
    return {
      allowed: false,
      response: rateLimitResponse(result.remaining, result.resetTime),
    };
  }

  return { allowed: true };
}
