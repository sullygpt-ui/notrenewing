// Simple in-memory rate limiter
// For production, consider using Redis or a dedicated rate limiting service

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (record.resetTime < now) {
      rateLimitStore.delete(key);
    }
  }
}, 60000); // Clean every minute

export interface RateLimitConfig {
  windowMs: number;  // Time window in milliseconds
  maxRequests: number;  // Max requests per window
}

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetTime: number;
}

export function rateLimit(
  identifier: string,
  config: RateLimitConfig = { windowMs: 60000, maxRequests: 60 }
): RateLimitResult {
  const now = Date.now();
  const key = identifier;

  let record = rateLimitStore.get(key);

  if (!record || record.resetTime < now) {
    // Create new record
    record = {
      count: 1,
      resetTime: now + config.windowMs,
    };
    rateLimitStore.set(key, record);
    return {
      success: true,
      remaining: config.maxRequests - 1,
      resetTime: record.resetTime,
    };
  }

  if (record.count >= config.maxRequests) {
    return {
      success: false,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count++;
  return {
    success: true,
    remaining: config.maxRequests - record.count,
    resetTime: record.resetTime,
  };
}

// Helper to get client IP from request
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp;
  }
  return 'unknown';
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // General API: 60 requests per minute
  api: (ip: string) => rateLimit(`api:${ip}`, { windowMs: 60000, maxRequests: 60 }),

  // Auth endpoints: 5 requests per minute (stricter for login/signup)
  auth: (ip: string) => rateLimit(`auth:${ip}`, { windowMs: 60000, maxRequests: 5 }),

  // Payment endpoints: 10 requests per minute
  payment: (ip: string) => rateLimit(`payment:${ip}`, { windowMs: 60000, maxRequests: 10 }),

  // Search: 30 requests per minute
  search: (ip: string) => rateLimit(`search:${ip}`, { windowMs: 60000, maxRequests: 30 }),

  // Domain submission: 5 per hour
  submit: (ip: string) => rateLimit(`submit:${ip}`, { windowMs: 3600000, maxRequests: 5 }),
};
