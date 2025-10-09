/**
 * Standardized error handling utilities for FinaclyAI
 * Provides consistent error responses and retry logic for external API calls
 */

export interface ApiError {
  ok: false;
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiSuccess<T = unknown> {
  ok: true;
  data: T;
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;

/**
 * Creates a standardized error response (no secrets exposed)
 */
export function createError(code: string, message: string, details?: unknown): ApiError {
  return {
    ok: false,
    code,
    message,
    details: sanitizeDetails(details),
  };
}

/**
 * Creates a standardized success response
 */
export function createSuccess<T>(data: T): ApiSuccess<T> {
  return {
    ok: true,
    data,
  };
}

/**
 * Sanitize error details to prevent secret leakage
 */
function sanitizeDetails(details: unknown): unknown {
  if (!details) return undefined;
  
  if (typeof details === 'string') {
    // Truncate long strings and remove potential secrets
    return details.length > 200 ? details.substring(0, 200) + '...' : details;
  }
  
  if (typeof details === 'object' && details !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(details)) {
      // Skip sensitive fields
      if (['token', 'secret', 'password', 'apiKey', 'accessToken', 'refreshToken'].includes(key)) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string' && value.length > 100) {
        sanitized[key] = value.substring(0, 100) + '...';
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }
  
  return details;
}

/**
 * Exponential backoff retry logic for external API calls
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    shouldRetry?: (error: unknown) => boolean;
  } = {}
): Promise<T> {
  const {
    maxRetries = 3,
    baseDelayMs = 1000,
    maxDelayMs = 10000,
    shouldRetry = (error: unknown) => {
      // Retry on network errors, 429 rate limits, and 5xx server errors
      if (error && typeof error === 'object' && 'status' in error) {
        const status = (error as { status: number }).status;
        return status === 429 || status >= 500;
      }
      return false;
    },
  } = options;

  let lastError: unknown;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      
      // Don't retry if this is the last attempt or if we shouldn't retry
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      // Calculate exponential backoff delay
      const delay = Math.min(baseDelayMs * Math.pow(2, attempt), maxDelayMs);
      
      // Add jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * delay;
      const totalDelay = delay + jitter;
      
      console.log(`Retry attempt ${attempt + 1}/${maxRetries} after ${Math.round(totalDelay)}ms`);
      
      await new Promise(resolve => setTimeout(resolve, totalDelay));
    }
  }
  
  throw lastError;
}

/**
 * Wrap external API calls with standard error handling
 */
export async function safeApiCall<T>(
  serviceName: string,
  operation: string,
  fn: () => Promise<T>
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    console.error(`[${serviceName}] ${operation} failed:`, {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Re-throw with context but no secrets
    if (error && typeof error === 'object' && 'message' in error) {
      throw new Error(`${serviceName} ${operation} failed: ${(error as Error).message}`);
    }
    throw new Error(`${serviceName} ${operation} failed: Unknown error`);
  }
}

/**
 * Exception type codes for the reconciliation system
 */
export const ExceptionType = {
  PAYOUT_NO_BANK_MATCH: 'PAYOUT_NO_BANK_MATCH',
  PAYOUT_NO_QBO_DEPOSIT: 'PAYOUT_NO_QBO_DEPOSIT',
  BANK_NO_PAYOUT_MATCH: 'BANK_NO_PAYOUT_MATCH',
  MULTI_CURRENCY_PAYOUT: 'MULTI_CURRENCY_PAYOUT',
  PARTIAL_PAYMENT_DETECTED: 'PARTIAL_PAYMENT_DETECTED',
  AMOUNT_MISMATCH: 'AMOUNT_MISMATCH',
  DATE_MISMATCH: 'DATE_MISMATCH',
  AMBIGUOUS_MATCH: 'AMBIGUOUS_MATCH',
  QBO_TOKEN_EXPIRED: 'QBO_TOKEN_EXPIRED',
  QBO_WRONG_CLUSTER: 'QBO_WRONG_CLUSTER',
  STRIPE_SYNC_FAILED: 'STRIPE_SYNC_FAILED',
  PLAID_SYNC_FAILED: 'PLAID_SYNC_FAILED',
} as const;

export type ExceptionTypeCode = typeof ExceptionType[keyof typeof ExceptionType];

/**
 * User-friendly messages for accountants
 */
export const ExceptionMessages: Record<ExceptionTypeCode, string> = {
  PAYOUT_NO_BANK_MATCH: 'Stripe payout not found in bank transactions. Check if the payout has cleared your bank.',
  PAYOUT_NO_QBO_DEPOSIT: 'Deposit not recorded in QuickBooks. Click "Fix Now" to create the deposit automatically.',
  BANK_NO_PAYOUT_MATCH: 'Bank deposit does not match any Stripe payout. Verify this is a Stripe-related transaction.',
  MULTI_CURRENCY_PAYOUT: 'Multi-currency payout detected. Manual review required for proper conversion rates.',
  PARTIAL_PAYMENT_DETECTED: 'Partial payment detected. This transaction may be split across multiple payments.',
  AMOUNT_MISMATCH: 'Transaction amounts do not match. Verify fees and adjustments are properly accounted.',
  DATE_MISMATCH: 'Transaction dates are more than 5 days apart. Verify timing of settlement.',
  AMBIGUOUS_MATCH: 'Multiple possible matches found. Manual review required to select the correct match.',
  QBO_TOKEN_EXPIRED: 'QuickBooks session expired. Please reconnect your QuickBooks account.',
  QBO_WRONG_CLUSTER: 'QuickBooks API endpoint mismatch. Please disconnect and reconnect your account.',
  STRIPE_SYNC_FAILED: 'Failed to sync Stripe data. Check your Stripe connection and try again.',
  PLAID_SYNC_FAILED: 'Failed to sync bank transactions. Check your bank connection and try again.',
};

