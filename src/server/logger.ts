/**
 * Structured server logger - never logs secrets
 * In production, integrate with Datadog, Sentry, or LogRocket
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

// Fields that should NEVER be logged
const SECRET_FIELDS = [
  'password',
  'secret',
  'token',
  'key',
  'authorization',
  'cookie',
  'accessToken',
  'refreshToken',
  'apiKey',
  'stripeKey',
  'plaidSecret',
];

function sanitize(obj: any): any {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const sanitized: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    if (SECRET_FIELDS.some((field) => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitize(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

function formatLog(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const sanitizedContext = context ? sanitize(context) : {};
  
  const logEntry = {
    timestamp,
    level: level.toUpperCase(),
    message,
    ...sanitizedContext,
    ...(context?.error && {
      error: {
        message: context.error.message,
        stack: process.env.NODE_ENV === 'development' ? context.error.stack : undefined,
      },
    }),
  };

  return JSON.stringify(logEntry);
}

export const logger = {
  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.log(formatLog('debug', message, context));
    }
  },

  info(message: string, context?: LogContext) {
    console.log(formatLog('info', message, context));
  },

  warn(message: string, context?: LogContext) {
    console.warn(formatLog('warn', message, context));
  },

  error(message: string, context?: LogContext) {
    console.error(formatLog('error', message, context));
  },
};

// Usage example:
// logger.info('User authenticated', { userId: '123', method: 'password' });
// logger.error('Stripe sync failed', { error, accountId: 'acct_123' });

