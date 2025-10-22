import { log } from './logging'

export class AppError extends Error {
  statusCode: number
  isOperational: boolean
  details?: any

  constructor(message: string, statusCode: number = 500, details?: any) {
    super(message)
    this.name = this.constructor.name
    this.statusCode = statusCode
    this.isOperational = true // Indicates errors that are expected and handled
    this.details = details
    Error.captureStackTrace(this, this.constructor)
  }
}

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', details?: any) {
    super(message, 400, details)
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', details?: any) {
    super(message, 401, details)
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', details?: any) {
    super(message, 403, details)
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', details?: any) {
    super(message, 404, details)
  }
}

export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', details?: any) {
    super(message, 500, details)
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service Unavailable', details?: any) {
    super(message, 503, details)
  }
}

// Retry configuration for external API calls
export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffMultiplier: number
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 30000, // 30 seconds
  backoffMultiplier: 2
}

// Retry logic for external API calls
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG,
  context: string = 'operation'
): Promise<T> {
  let lastError: Error | null = null
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on certain error types
      if (error instanceof BadRequestError || 
          error instanceof UnauthorizedError || 
          error instanceof ForbiddenError) {
        throw error
      }
      
      if (attempt === config.maxAttempts) {
        log.error({
          context,
          attempt,
          error: lastError.message,
          stack: lastError.stack
        }, `All retry attempts failed for ${context}`)
        throw lastError
      }
      
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      )
      
      log.warn({
        context,
        attempt,
        nextRetryIn: delay,
        error: lastError.message
      }, `Retry attempt ${attempt} failed for ${context}, retrying in ${delay}ms`)
      
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw lastError!
}

// Rate limiting helper
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  constructor(
    private maxRequests: number,
    private windowMs: number
  ) {}
  
  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    validRequests.push(now)
    this.requests.set(key, validRequests)
    return true
  }
}

// Circuit breaker pattern for external services
export class CircuitBreaker {
  private failures: number = 0
  private lastFailureTime: number = 0
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED'
  
  constructor(
    private failureThreshold: number = 5,
    private timeout: number = 60000, // 1 minute
    private resetTimeout: number = 30000 // 30 seconds
  ) {}
  
  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.resetTimeout) {
        this.state = 'HALF_OPEN'
      } else {
        throw new ServiceUnavailableError('Circuit breaker is OPEN')
      }
    }
    
    try {
      const result = await operation()
      this.onSuccess()
      return result
    } catch (error) {
      this.onFailure()
      throw error
    }
  }
  
  private onSuccess(): void {
    this.failures = 0
    this.state = 'CLOSED'
  }
  
  private onFailure(): void {
    this.failures++
    this.lastFailureTime = Date.now()
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN'
    }
  }
}

// Global circuit breakers for external services
export const stripeCircuitBreaker = new CircuitBreaker(5, 60000, 30000)
export const qboCircuitBreaker = new CircuitBreaker(3, 60000, 30000)
export const plaidCircuitBreaker = new CircuitBreaker(5, 60000, 30000)

// Error context helper
export function createErrorContext(
  operation: string,
  companyId: string,
  additionalData?: any
): any {
  return {
    operation,
    companyId,
    timestamp: new Date().toISOString(),
    ...additionalData
  }
}

// Sanitize error for logging (remove sensitive data)
export function sanitizeError(error: any): any {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack
    }
  }
  
  // Remove sensitive fields from error objects
  const sanitized = { ...error }
  const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth', 'credential']
  
  for (const field of sensitiveFields) {
    if (sanitized[field]) {
      sanitized[field] = '[REDACTED]'
    }
  }
  
  return sanitized
}