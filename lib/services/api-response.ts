import { NextResponse } from 'next/server'

interface StandardApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  details?: any
  requestId?: string
  timestamp?: string
}

export class ApiResponse {
  static success<T>(
    data: T, 
    message: string = 'Success', 
    status: number = 200
  ): NextResponse {
    const response: StandardApiResponse<T> = {
      success: true,
      data,
      message,
      requestId: generateRequestId(),
      timestamp: new Date().toISOString()
    }
    return NextResponse.json(response, { status })
  }

  static error(
    error: string, 
    status: number = 500, 
    details?: any
  ): NextResponse {
    const response: StandardApiResponse = {
      success: false,
      error,
      details,
      requestId: generateRequestId(),
      timestamp: new Date().toISOString()
    }
    return NextResponse.json(response, { status })
  }

  static badRequest(
    message: string = 'Bad Request', 
    details?: any
  ): NextResponse {
    return ApiResponse.error(message, 400, details)
  }

  static unauthorized(
    message: string = 'Unauthorized', 
    details?: any
  ): NextResponse {
    return ApiResponse.error(message, 401, details)
  }

  static forbidden(
    message: string = 'Forbidden', 
    details?: any
  ): NextResponse {
    return ApiResponse.error(message, 403, details)
  }

  static notFound(
    message: string = 'Not Found', 
    details?: any
  ): NextResponse {
    return ApiResponse.error(message, 404, details)
  }

  static internalServerError(
    message: string = 'Internal Server Error', 
    details?: any
  ): NextResponse {
    return ApiResponse.error(message, 500, details)
  }

  static serviceUnavailable(
    message: string = 'Service Unavailable', 
    details?: any
  ): NextResponse {
    return ApiResponse.error(message, 503, details)
  }

  static validationError(
    message: string = 'Validation Error', 
    details?: any
  ): NextResponse {
    return ApiResponse.error(message, 422, details)
  }

  static rateLimited(
    message: string = 'Rate Limited', 
    details?: any
  ): NextResponse {
    return ApiResponse.error(message, 429, details)
  }
}

// Generate unique request ID for tracing
function generateRequestId(): string {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

// Validation helper
export function validateRequired(
  data: any, 
  requiredFields: string[]
): { isValid: boolean; missingFields: string[] } {
  const missingFields: string[] = []
  
  for (const field of requiredFields) {
    if (data[field] === undefined || data[field] === null || data[field] === '') {
      missingFields.push(field)
    }
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields
  }
}

// Pagination helper
export interface PaginationParams {
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export function createPaginatedResponse<T>(
  data: T[],
  total: number,
  page: number = 1,
  limit: number = 20
): PaginatedResponse<T> {
  const totalPages = Math.ceil(total / limit)
  
  return {
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }
}

// Error response helper for API routes
export function handleApiError(error: unknown): NextResponse {
  if (error instanceof Error) {
    // Check if it's a known error type
    if (error.message.includes('validation')) {
      return ApiResponse.validationError(error.message)
    }
    
    if (error.message.includes('not found')) {
      return ApiResponse.notFound(error.message)
    }
    
    if (error.message.includes('unauthorized')) {
      return ApiResponse.unauthorized(error.message)
    }
    
    if (error.message.includes('forbidden')) {
      return ApiResponse.forbidden(error.message)
    }
    
    // Default to internal server error
    return ApiResponse.internalServerError(
      'An unexpected error occurred',
      { message: error.message }
    )
  }
  
  return ApiResponse.internalServerError('An unknown error occurred')
}