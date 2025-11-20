import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;
const ENVIRONMENT = process.env.NEXT_PUBLIC_ENVIRONMENT || process.env.NODE_ENV || 'development';

export const initSentry = () => {
  if (!SENTRY_DSN || ENVIRONMENT === 'production') {
    console.warn('⚠️ Sentry temporarily disabled for deployment.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: ENVIRONMENT,
    
    // Set tracesSampleRate to 1.0 to capture 100% of transactions for performance monitoring.
    // We recommend adjusting this value in production
    tracesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // Capture 100% of errors
    sampleRate: 1.0,

    // Set sampling rate for profiling
    profilesSampleRate: ENVIRONMENT === 'production' ? 0.1 : 1.0,

    // You can remove this option if you're not planning to use the Sentry Session Replay feature:
    replaysSessionSampleRate: ENVIRONMENT === 'production' ? 0.1 : 0,
    
    // If the entire session is not sampled, use the below sample rate to sample
    // sessions when an error occurs.
    replaysOnErrorSampleRate: 1.0,

    integrations: [
      // Temporarily disabled due to Sentry v8 API compatibility issues
      // Sentry.browserTracingIntegration(),
      // Sentry.replayIntegration({
      //   maskAllText: true,
      //   blockAllMedia: true,
      // }),
    ],

    // Before sending an event, filter out sensitive information
    beforeSend(event, hint) {
      // Filter out certain error types if needed
      if (event.exception) {
        const error = hint.originalException;
        
        // Ignore specific error types
        if (error instanceof Error) {
          // Ignore network errors that are expected
          if (error.message.includes('Failed to fetch')) {
            return null;
          }
          
          // Ignore auth redirect errors
          if (error.message.includes('NEXT_REDIRECT')) {
            return null;
          }
        }
      }

      // Remove sensitive data from breadcrumbs
      if (event.breadcrumbs) {
        event.breadcrumbs = event.breadcrumbs.map(breadcrumb => {
          if (breadcrumb.data) {
            // Remove auth tokens, passwords, etc.
            const sanitized = { ...breadcrumb.data };
            delete sanitized.password;
            delete sanitized.token;
            delete sanitized.authorization;
            return { ...breadcrumb, data: sanitized };
          }
          return breadcrumb;
        });
      }

      return event;
    },

    // Configure ignored errors
    ignoreErrors: [
      // Browser extensions
      'top.GLOBALS',
      'ResizeObserver loop limit exceeded',
      'ResizeObserver loop completed with undelivered notifications',
      
      // Random plugins/extensions
      'Can\'t find variable: ZiteReader',
      'jigsaw is not defined',
      'ComboSearch is not defined',
      
      // Network errors
      'NetworkError',
      'Network request failed',
      
      // Development errors
      'Hydration failed',
    ],
  });

  console.log('✅ Sentry initialized for environment:', ENVIRONMENT);
};

// Helper to manually capture errors
export const captureError = (error: Error, context?: Record<string, any>) => {
  if (context) {
    Sentry.setContext('additional', context);
  }
  Sentry.captureException(error);
};

// Helper to capture messages
export const captureMessage = (message: string, level: Sentry.SeverityLevel = 'info') => {
  Sentry.captureMessage(message, level);
};

// Helper to set user context
export const setUserContext = (user: { id: string; email?: string; username?: string }) => {
  Sentry.setUser(user);
};

// Helper to clear user context (on logout)
export const clearUserContext = () => {
  Sentry.setUser(null);
};

