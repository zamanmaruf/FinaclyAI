import pino from 'pino'

// Define log levels
type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'

// Initialize pino logger
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label }),
  },
  timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
  browser: {
    // Optional: configuration for browser logging if needed
  },
  transport: {
    target: 'pino-pretty', // Use pino-pretty for development readability
    options: {
      colorize: true,
      translateTime: 'SYS:HH:MM:ss Z',
      ignore: 'pid,hostname',
    },
  },
})

// Custom logger interface to add context
interface AppLogger {
  trace(obj: object, msg?: string, ...args: any[]): void
  debug(obj: object, msg?: string, ...args: any[]): void
  info(obj: object, msg?: string, ...args: any[]): void
  warn(obj: object, msg?: string, ...args: any[]): void
  error(obj: object, msg?: string, ...args: any[]): void
  fatal(obj: object, msg?: string, ...args: any[]): void
  child(bindings: pino.Bindings): AppLogger
}

// Wrapper to add default context
const createLogger = (defaultContext: object = {}): AppLogger => {
  return {
    trace: (obj, msg, ...args) => logger.trace({ ...defaultContext, ...obj }, msg, ...args),
    debug: (obj, msg, ...args) => logger.debug({ ...defaultContext, ...obj }, msg, ...args),
    info: (obj, msg, ...args) => logger.info({ ...defaultContext, ...obj }, msg, ...args),
    warn: (obj, msg, ...args) => logger.warn({ ...defaultContext, ...obj }, msg, ...args),
    error: (obj, msg, ...args) => logger.error({ ...defaultContext, ...obj }, msg, ...args),
    fatal: (obj, msg, ...args) => logger.fatal({ ...defaultContext, ...obj }, msg, ...args),
    child: (bindings: pino.Bindings) => createLogger({ ...defaultContext, ...bindings }),
  }
}

export const log = createLogger({ service: 'finacly-reconciliation' })

// Structured logging helpers for specific operations
export const auditLog = log.child({ component: 'audit' })
export const apiLog = log.child({ component: 'api' })
export const dbLog = log.child({ component: 'database' })
export const integrationLog = log.child({ component: 'integration' })
export const matchingLog = log.child({ component: 'matching' })
export const exceptionLog = log.child({ component: 'exceptions' })

// Performance logging helper
export function logPerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  context?: any
): Promise<T> {
  const startTime = Date.now()
  
  return fn()
    .then(result => {
      const duration = Date.now() - startTime
      log.info({
        operation,
        duration,
        status: 'success',
        ...context
      }, `✅ ${operation} completed`)
      return result
    })
    .catch(error => {
      const duration = Date.now() - startTime
      log.error({
        operation,
        duration,
        status: 'error',
        error: error.message,
        ...context
      }, `❌ ${operation} failed`)
      throw error
    })
}

// API request/response logging
export function logApiRequest(
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  context?: any
): void {
  const level = statusCode >= 400 ? 'error' : 'info'
  
  log[level]({
    type: 'api_request',
    method,
    url,
    statusCode,
    duration,
    ...context
  }, `${method} ${url} - ${statusCode} (${duration}ms)`)
}

// Database operation logging
export function logDbOperation(
  operation: string,
  table: string,
  duration: number,
  rowCount?: number,
  context?: any
): void {
  log.info({
    type: 'db_operation',
    operation,
    table,
    duration,
    rowCount,
    ...context
  }, `DB ${operation} on ${table} (${duration}ms)`)
}

// External API call logging
export function logExternalApiCall(
  service: string,
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number,
  context?: any
): void {
  const level = statusCode >= 400 ? 'error' : 'info'
  
  log[level]({
    type: 'external_api',
    service,
    endpoint,
    method,
    statusCode,
    duration,
    ...context
  }, `${service} ${method} ${endpoint} - ${statusCode} (${duration}ms)`)
}

// Business event logging
export function logBusinessEvent(
  event: string,
  companyId: string,
  data?: any
): void {
  log.info({
    type: 'business_event',
    event,
    companyId,
    ...data
  }, `Business event: ${event}`)
}

// Security event logging
export function logSecurityEvent(
  event: string,
  severity: 'low' | 'medium' | 'high' | 'critical',
  context?: any
): void {
  const level = severity === 'critical' ? 'fatal' : 
                severity === 'high' ? 'error' : 
                severity === 'medium' ? 'warn' : 'info'
  
  log[level]({
    type: 'security_event',
    event,
    severity,
    ...context
  }, `Security event: ${event} (${severity})`)
}

// Sanitize sensitive data for logging
export function sanitizeForLogging(data: any): any {
  if (!data || typeof data !== 'object') {
    return data
  }
  
  const sanitized = { ...data }
  const sensitiveFields = [
    'password', 'token', 'secret', 'key', 'auth', 'credential',
    'access_token', 'refresh_token', 'api_key', 'webhook_secret',
    'client_secret', 'private_key', 'encryption_key'
  ]
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  // Recursively sanitize nested objects
  for (const [key, value] of Object.entries(sanitized)) {
    if (value && typeof value === 'object') {
      sanitized[key] = sanitizeForLogging(value)
    }
  }
  
  return sanitized
}

// Export the main logger
export default log