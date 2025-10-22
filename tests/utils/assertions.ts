import { Pool } from 'pg'

export async function assertMatchCreated(pool: Pool, payoutId: string, bankTxId: string) {
  const result = await pool.query(`
    SELECT * FROM matches 
    WHERE (left_ref = $1 AND right_ref = $2) 
    OR (left_ref = $2 AND right_ref = $1)
  `, [payoutId, bankTxId])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].confidence).toBeGreaterThan(0.8)
  return result.rows[0]
}

export async function assertExceptionCreated(pool: Pool, exceptionType: string, entityRefs: Record<string, string>) {
  const result = await pool.query(`
    SELECT * FROM exceptions 
    WHERE exception_type = $1 
    AND entity_refs @> $2
  `, [exceptionType, JSON.stringify(entityRefs)])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].status).toBe('open')
  return result.rows[0]
}

export async function assertAuditEventLogged(pool: Pool, verb: string, entityType: string) {
  const result = await pool.query(`
    SELECT * FROM audit_events 
    WHERE verb = $1 AND entity_type = $2
    ORDER BY created_at DESC
    LIMIT 1
  `, [verb, entityType])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].hash).toBeDefined()
  return result.rows[0]
}

export async function assertQBOObjectCreated(pool: Pool, externalRef: string) {
  const result = await pool.query(`
    SELECT * FROM qbo_objects 
    WHERE external_ref = $1
  `, [externalRef])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].qbo_id).toBeDefined()
  return result.rows[0]
}

export async function assertDatabaseState(pool: Pool, expected: Record<string, number>) {
  for (const [table, expectedCount] of Object.entries(expected)) {
    const result = await pool.query(`SELECT COUNT(*) as count FROM ${table}`)
    const actualCount = parseInt(result.rows[0].count)
    expect(actualCount).toBe(expectedCount)
  }
}

export async function assertMatchCount(pool: Pool, companyId: number, expectedCount: number) {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM matches WHERE company_id = $1
  `, [companyId])
  
  const actualCount = parseInt(result.rows[0].count)
  expect(actualCount).toBe(expectedCount)
}

export async function assertExceptionCount(pool: Pool, companyId: number, expectedCount: number, exceptionType?: string) {
  let query = `SELECT COUNT(*) as count FROM exceptions WHERE company_id = $1`
  const params: any[] = [companyId]
  
  if (exceptionType) {
    query += ` AND exception_type = $2`
    params.push(exceptionType)
  }
  
  const result = await pool.query(query, params)
  const actualCount = parseInt(result.rows[0].count)
  expect(actualCount).toBe(expectedCount)
}

export async function assertPayoutCount(pool: Pool, companyId: number, expectedCount: number) {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM stripe_payouts WHERE company_id = $1
  `, [companyId])
  
  const actualCount = parseInt(result.rows[0].count)
  expect(actualCount).toBe(expectedCount)
}

export async function assertBankTransactionCount(pool: Pool, companyId: number, expectedCount: number) {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM bank_transactions WHERE company_id = $1
  `, [companyId])
  
  const actualCount = parseInt(result.rows[0].count)
  expect(actualCount).toBe(expectedCount)
}

export async function assertQBOObjectCount(pool: Pool, companyId: number, expectedCount: number) {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM qbo_objects WHERE company_id = $1
  `, [companyId])
  
  const actualCount = parseInt(result.rows[0].count)
  expect(actualCount).toBe(expectedCount)
}

export async function assertAuditEventCount(pool: Pool, companyId: number, expectedCount: number) {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM audit_events WHERE company_id = $1
  `, [companyId])
  
  const actualCount = parseInt(result.rows[0].count)
  expect(actualCount).toBe(expectedCount)
}

export async function assertConnectionStatus(pool: Pool, companyId: number, provider: string, expectedStatus: string) {
  const result = await pool.query(`
    SELECT status FROM connections 
    WHERE company_id = $1 AND provider = $2
  `, [companyId, provider])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].status).toBe(expectedStatus)
}

export async function assertExceptionResolved(pool: Pool, exceptionId: number) {
  const result = await pool.query(`
    SELECT status, resolved_at, resolved_by FROM exceptions WHERE id = $1
  `, [exceptionId])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].status).toBe('resolved')
  expect(result.rows[0].resolved_at).toBeDefined()
  expect(result.rows[0].resolved_by).toBeDefined()
}

export async function assertExceptionIgnored(pool: Pool, exceptionId: number) {
  const result = await pool.query(`
    SELECT status, resolved_at, resolved_by FROM exceptions WHERE id = $1
  `, [exceptionId])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].status).toBe('ignored')
  expect(result.rows[0].resolved_at).toBeDefined()
  expect(result.rows[0].resolved_by).toBeDefined()
}

export async function assertHashChainValid(pool: Pool, companyId: number) {
  const result = await pool.query(`
    SELECT hash, prev_hash, created_at 
    FROM audit_events 
    WHERE company_id = $1 
    ORDER BY created_at ASC
  `, [companyId])
  
  let prevHash: string | null = null
  
  for (const row of result.rows) {
    if (prevHash !== null) {
      expect(row.prev_hash).toBe(prevHash)
    }
    expect(row.hash).toBeDefined()
    prevHash = row.hash
  }
}

export async function assertIdempotencyKeyUsed(pool: Pool, actionFingerprint: string) {
  const result = await pool.query(`
    SELECT * FROM audit_events 
    WHERE payload_jsonb->>'action_fingerprint' = $1
  `, [actionFingerprint])
  
  expect(result.rows.length).toBeGreaterThan(0)
}

export async function assertNoDuplicateQBOObject(pool: Pool, externalRef: string) {
  const result = await pool.query(`
    SELECT COUNT(*) as count FROM qbo_objects 
    WHERE external_ref = $1
  `, [externalRef])
  
  const count = parseInt(result.rows[0].count)
  expect(count).toBeLessThanOrEqual(1)
}

export async function assertSyncJobStatus(pool: Pool, companyId: number, expectedStatus: string) {
  const result = await pool.query(`
    SELECT status FROM sync_jobs 
    WHERE company_id = $1 
    ORDER BY created_at DESC 
    LIMIT 1
  `, [companyId])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].status).toBe(expectedStatus)
}

export async function assertProviderCursorSaved(pool: Pool, companyId: number, provider: string, resource: string) {
  const result = await pool.query(`
    SELECT cursor_token FROM provider_cursors 
    WHERE company_id = $1 AND provider = $2 AND resource = $3
  `, [companyId, provider, resource])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].cursor_token).toBeDefined()
}

export async function assertTelemetryEventLogged(pool: Pool, eventType: string, companyId: number) {
  const result = await pool.query(`
    SELECT * FROM audit_events 
    WHERE verb = $1 AND company_id = $2
    ORDER BY created_at DESC 
    LIMIT 1
  `, [eventType, companyId])
  
  expect(result.rows.length).toBeGreaterThan(0)
}

export async function assertConfidenceScore(pool: Pool, matchId: number, minConfidence: number) {
  const result = await pool.query(`
    SELECT confidence FROM matches WHERE id = $1
  `, [matchId])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].confidence).toBeGreaterThanOrEqual(minConfidence)
}

export async function assertEvidenceStructure(pool: Pool, exceptionId: number, expectedFields: string[]) {
  const result = await pool.query(`
    SELECT evidence_jsonb FROM exceptions WHERE id = $1
  `, [exceptionId])
  
  expect(result.rows.length).toBeGreaterThan(0)
  const evidence = result.rows[0].evidence_jsonb
  
  for (const field of expectedFields) {
    expect(evidence).toHaveProperty(field)
  }
}

export async function assertProposedAction(pool: Pool, exceptionId: number, expectedAction: string) {
  const result = await pool.query(`
    SELECT proposed_action FROM exceptions WHERE id = $1
  `, [exceptionId])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].proposed_action).toBe(expectedAction)
}

export async function assertExceptionSeverity(pool: Pool, exceptionId: number, expectedSeverity: string) {
  const result = await pool.query(`
    SELECT severity FROM exceptions WHERE id = $1
  `, [exceptionId])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].severity).toBe(expectedSeverity)
}

export async function assertMatchStrategy(pool: Pool, matchId: number, expectedStrategy: string) {
  const result = await pool.query(`
    SELECT strategy FROM matches WHERE id = $1
  `, [matchId])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].strategy).toBe(expectedStrategy)
}

export async function assertEntityRefs(pool: Pool, exceptionId: number, expectedRefs: Record<string, string>) {
  const result = await pool.query(`
    SELECT entity_refs FROM exceptions WHERE id = $1
  `, [exceptionId])
  
  expect(result.rows.length).toBeGreaterThan(0)
  const entityRefs = result.rows[0].entity_refs
  
  for (const [key, value] of Object.entries(expectedRefs)) {
    expect(entityRefs).toHaveProperty(key, value)
  }
}

export async function assertRawJsonbStored(pool: Pool, tableName: string, id: number) {
  const result = await pool.query(`
    SELECT raw_jsonb FROM ${tableName} WHERE id = $1
  `, [id])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].raw_jsonb).toBeDefined()
  expect(typeof result.rows[0].raw_jsonb).toBe('object')
}

export async function assertTimestampWithinRange(pool: Pool, tableName: string, id: number, minutes: number = 5) {
  const result = await pool.query(`
    SELECT created_at FROM ${tableName} WHERE id = $1
  `, [id])
  
  expect(result.rows.length).toBeGreaterThan(0)
  const createdAt = new Date(result.rows[0].created_at)
  const now = new Date()
  const diffMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60)
  
  expect(diffMinutes).toBeLessThan(minutes)
}

export async function assertCurrencyMatch(pool: Pool, tableName: string, id: number, expectedCurrency: string) {
  const result = await pool.query(`
    SELECT currency FROM ${tableName} WHERE id = $1
  `, [id])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(result.rows[0].currency).toBe(expectedCurrency)
}

export async function assertAmountMatch(pool: Pool, tableName: string, id: number, expectedAmount: number) {
  const result = await pool.query(`
    SELECT amount FROM ${tableName} WHERE id = $1
  `, [id])
  
  expect(result.rows.length).toBeGreaterThan(0)
  expect(parseInt(result.rows[0].amount)).toBe(expectedAmount)
}
