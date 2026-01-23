// Error tracking utility with Sentry integration
import * as Sentry from '@sentry/nextjs';

interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, unknown>;
}

// Log error - sends to Sentry in production, console in development
export function captureError(error: Error, context?: ErrorContext) {
  // Always log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', {
      message: error.message,
      stack: error.stack,
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  // Send to Sentry if DSN is configured
  if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
    if (context?.userId) {
      Sentry.setUser({ id: context.userId });
    }
    Sentry.captureException(error, {
      extra: context as Record<string, unknown>,
    });
  }
}

// Log a message/event
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
) {
  // Console logging in development
  if (process.env.NODE_ENV === 'development') {
    const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;
    logFn(`[${level.toUpperCase()}]`, message, {
      ...context,
      timestamp: new Date().toISOString(),
    });
  }

  // Send to Sentry if DSN is configured
  if (process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN) {
    Sentry.captureMessage(message, {
      level: level as Sentry.SeverityLevel,
      extra: context as Record<string, unknown>,
    });
  }
}

// Wrapper for async functions to catch and report errors
export function withErrorTracking<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      captureError(error as Error, context);
      throw error;
    }
  }) as T;
}

// Set user context for error tracking
export function setUser(userId: string, email?: string) {
  Sentry.setUser({
    id: userId,
    email,
  });
}

// Clear user context (on logout)
export function clearUser() {
  Sentry.setUser(null);
}

// Add breadcrumb for debugging
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, any>
) {
  Sentry.addBreadcrumb({
    message,
    category,
    data,
    level: 'info',
  });
}

// Initialize error tracking (call this in your app initialization)
export function initErrorTracking() {
  // Set up global error handlers for client-side
  if (typeof window !== 'undefined') {
    window.onerror = (message, source, lineno, colno, error) => {
      captureError(error || new Error(String(message)), {
        action: 'window.onerror',
        metadata: { source, lineno, colno },
      });
    };

    window.onunhandledrejection = (event) => {
      captureError(
        event.reason instanceof Error ? event.reason : new Error(String(event.reason)),
        { action: 'unhandledrejection' }
      );
    };
  }

  console.log('[ErrorTracking] Initialized');
}
