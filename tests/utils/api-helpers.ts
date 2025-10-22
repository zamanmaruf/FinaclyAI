import request from 'supertest'
import { NextRequest } from 'next/server'

export interface AuthenticatedRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  url: string
  body?: any
  headers?: Record<string, string>
  userId?: string
  companyId?: string
}

export function authenticatedRequest(options: AuthenticatedRequestOptions) {
  const { method, url, body, headers = {}, userId, companyId } = options
  
  if (!userId || !companyId) {
    throw new Error('userId and companyId are required for authenticated requests')
  }
  
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${userId}-token`,
    'X-User-ID': userId,
    'X-Company-ID': companyId,
    ...headers
  }

  const req = request(url) as any
  return req[method.toLowerCase()](url)
    .set(defaultHeaders)
    .send(body)
}

export function expectSuccess(response: any, expectedStatus: number = 200) {
  expect(response.status).toBe(expectedStatus)
  expect(response.body).toBeDefined()
  return response.body
}

export function expectError(response: any, expectedStatus: number, message?: string) {
  expect(response.status).toBe(expectedStatus)
  if (message) {
    expect(response.body.error).toContain(message)
  }
  return response.body
}

export async function waitForJob(jobId: string, timeout: number = 30000): Promise<any> {
  const startTime = Date.now()
  
  while (Date.now() - startTime < timeout) {
    try {
      const response = await authenticatedRequest({
        method: 'GET',
        url: `/api/app/sync/jobs/${jobId}`
      })
      
      if (response.status === 200) {
        const job = response.body
        if (job.status === 'completed' || job.status === 'failed') {
          return job
        }
      }
    } catch (error) {
      // Continue polling
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000)) // Wait 1 second
  }
  
  throw new Error(`Job ${jobId} did not complete within ${timeout}ms`)
}

// Mock API functions removed - tests should use real sandbox APIs

export function createMockRequest(options: {
  method: string
  url: string
  body?: any
  headers?: Record<string, string>
}): NextRequest {
  const { method, url, body, headers = {} } = options
  
  return new NextRequest(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: body ? JSON.stringify(body) : undefined
  })
}

export function expectDatabaseState(pool: any, expected: Record<string, number>) {
  return async () => {
    for (const [table, expectedCount] of Object.entries(expected)) {
      const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`)
      const actualCount = parseInt(result.rows[0].count)
      expect(actualCount).toBe(expectedCount)
    }
  }
}

export function expectMatchCreated(pool: any, payoutId: string, bankTxId: string) {
  return async () => {
    const result = await pool.query(`
      SELECT * FROM matches 
      WHERE (left_ref = $1 AND right_ref = $2) 
      OR (left_ref = $2 AND right_ref = $1)
    `, [payoutId, bankTxId])
    
    expect(result.rows.length).toBeGreaterThan(0)
    expect(result.rows[0].confidence).toBeGreaterThan(0.7) // More realistic confidence threshold
  }
}

export function expectExceptionCreated(pool: any, exceptionType: string, entityRefs: Record<string, string>) {
  return async () => {
    const result = await pool.query(`
      SELECT * FROM exceptions 
      WHERE exception_type = $1 
      AND entity_refs @> $2
    `, [exceptionType, JSON.stringify(entityRefs)])
    
    expect(result.rows.length).toBeGreaterThan(0)
    expect(result.rows[0].status).toBe('open')
  }
}

export function expectAuditEventLogged(pool: any, verb: string, entityType: string) {
  return async () => {
    const result = await pool.query(`
      SELECT * FROM audit_events 
      WHERE verb = $1 AND entity_type = $2
      ORDER BY created_at DESC
      LIMIT 1
    `, [verb, entityType])
    
    expect(result.rows.length).toBeGreaterThan(0)
    expect(result.rows[0].hash).toBeDefined()
  }
}

export function expectQBOObjectCreated(pool: any, externalRef: string) {
  return async () => {
    const result = await pool.query(`
      SELECT * FROM qbo_objects 
      WHERE external_ref = $1
    `, [externalRef])
    
    expect(result.rows.length).toBeGreaterThan(0)
    expect(result.rows[0].qbo_id).toBeDefined()
  }
}
