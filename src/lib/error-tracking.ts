// Error tracking utility
// Replace with Sentry or similar in production

interface ErrorContext {
  userId?: string;
  action?: string;
  metadata?: Record<string, any>;
}

// Log error to console in development, can be replaced with Sentry in production
export function captureError(error: Error, context?: ErrorContext) {
  // In development, just log to console
  console.error('[Error]', {
    message: error.message,
    stack: error.stack,
    ...context,
    timestamp: new Date().toISOString(),
  });

  // In production, you would send to Sentry:
  // if (process.env.NODE_ENV === 'production' && typeof Sentry !== 'undefined') {
  //   Sentry.captureException(error, {
  //     extra: context,
  //   });
  // }
}

// Log a message/event
export function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info', context?: ErrorContext) {
  const logFn = level === 'error' ? console.error : level === 'warning' ? console.warn : console.log;

  logFn(`[${level.toUpperCase()}]`, message, {
    ...context,
    timestamp: new Date().toISOString(),
  });

  // In production, you would send to Sentry:
  // if (process.env.NODE_ENV === 'production' && typeof Sentry !== 'undefined') {
  //   Sentry.captureMessage(message, {
  //     level,
  //     extra: context,
  //   });
  // }
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

// Initialize error tracking (call this in your app initialization)
export function initErrorTracking() {
  // Set up global error handlers
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

  // Log that tracking is initialized
  console.log('[ErrorTracking] Initialized');
}

/*
 * To integrate Sentry in production:
 *
 * 1. Install: npm install @sentry/nextjs
 *
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 *
 * 3. Update this file to use Sentry methods
 *
 * 4. Add to your .env:
 *    SENTRY_DSN=your-sentry-dsn
 *    SENTRY_AUTH_TOKEN=your-auth-token
 */
