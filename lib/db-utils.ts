import { query, getClient } from './db'

// Re-export query function for other modules
export { query }
import { Pool } from 'pg'

// Transaction helper
export async function withTransaction<T>(
  callback: (client: any) => Promise<T>
): Promise<T> {
  const client = await getClient()
  
  try {
    await client.query('BEGIN')
    const result = await callback(client)
    await client.query('COMMIT')
    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

// Bulk upsert helper
export async function bulkUpsert(
  table: string,
  records: any[],
  conflictKeys: string[],
  updateColumns: string[] = []
): Promise<void> {
  if (records.length === 0) return

  const client = await getClient()
  
  try {
    const columns = Object.keys(records[0])
    const values = records.map((record, index) => {
      const placeholders = columns.map((_, colIndex) => 
        `$${index * columns.length + colIndex + 1}`
      ).join(', ')
      return `(${placeholders})`
    }).join(', ')

    const conflictClause = conflictKeys.join(', ')
    const updateClause = updateColumns.length > 0 
      ? `UPDATE SET ${updateColumns.map(col => `${col} = EXCLUDED.${col}`).join(', ')}`
      : 'DO NOTHING'

    const queryText = `
      INSERT INTO ${table} (${columns.join(', ')})
      VALUES ${values}
      ON CONFLICT (${conflictClause}) ${updateClause}
    `

    const flatValues = records.flatMap(record => 
      columns.map(col => record[col])
    )

    await client.query(queryText, flatValues)
  } finally {
    client.release()
  }
}

// Cursor management
export async function getCursor(
  companyId: string,
  provider: string,
  resource: string
): Promise<string | null> {
  const result = await query(`
    SELECT cursor_token 
    FROM provider_cursors 
    WHERE company_id = $1 AND provider = $2 AND resource = $3
  `, [companyId, provider, resource])

  return result.rows.length > 0 ? result.rows[0].cursor_token : null
}

export async function saveCursor(
  companyId: string,
  provider: string,
  resource: string,
  cursorToken: string
): Promise<void> {
  await query(`
    INSERT INTO provider_cursors (company_id, provider, resource, cursor_token)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (company_id, provider, resource)
    DO UPDATE SET 
      cursor_token = EXCLUDED.cursor_token,
      updated_at = CURRENT_TIMESTAMP
  `, [companyId, provider, resource, cursorToken])
}

// Idempotency check
export async function checkIdempotency(fingerprint: string): Promise<boolean> {
  const result = await query(`
    SELECT id FROM audit_events 
    WHERE payload_jsonb->>'idempotency_key' = $1
    LIMIT 1
  `, [fingerprint])

  return result.rows.length > 0
}

// Generate idempotency fingerprint
export function generateIdempotencyFingerprint(
  companyId: string,
  actionType: string,
  sourceIds: string[],
  amounts: number[],
  dates: string[]
): string {
  const data = {
    companyId,
    actionType,
    sourceIds: sourceIds.sort(),
    amounts: amounts.sort(),
    dates: dates.sort()
  }
  
  return Buffer.from(JSON.stringify(data)).toString('base64')
}

// Connection utilities
export async function getActiveConnection(
  companyId: string,
  provider: string
): Promise<any | null> {
  const result = await query(`
    SELECT * FROM connections 
    WHERE company_id = $1 AND provider = $2 AND status = 'connected'
    ORDER BY updated_at DESC
    LIMIT 1
  `, [companyId, provider])

  return result.rows.length > 0 ? result.rows[0] : null
}

export async function markConnectionExpired(connectionId: string): Promise<void> {
  await query(`
    UPDATE connections 
    SET status = 'expired', updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
  `, [connectionId])
}

// Sync job utilities
export async function createSyncJob(
  companyId: string,
  jobType: string,
  metadata: any = {}
): Promise<string> {
  const result = await query(`
    INSERT INTO sync_jobs (company_id, job_type, metadata)
    VALUES ($1, $2, $3)
    RETURNING id
  `, [companyId, jobType, JSON.stringify(metadata)])

  return result.rows[0].id
}

export async function updateSyncJobStatus(
  jobId: string,
  status: 'running' | 'completed' | 'failed',
  errorMessage?: string
): Promise<void> {
  const updates: string[] = ['status = $2', 'updated_at = CURRENT_TIMESTAMP']
  const values: any[] = [jobId, status]

  if (status === 'running') {
    updates.push('started_at = CURRENT_TIMESTAMP')
  } else if (status === 'completed' || status === 'failed') {
    updates.push('completed_at = CURRENT_TIMESTAMP')
  }

  if (errorMessage) {
    updates.push('error_message = $3')
    values.push(errorMessage)
  }

  await query(`
    UPDATE sync_jobs 
    SET ${updates.join(', ')}
    WHERE id = $1
  `, values)
}

// Analytics utilities
export async function trackEvent(
  eventName: string,
  companyId: string,
  payload: any = {}
): Promise<void> {
  await query(`
    INSERT INTO analytics_events (event_name, payload, created_at)
    VALUES ($1, $2, CURRENT_TIMESTAMP)
  `, [eventName, JSON.stringify({ companyId, ...payload })])
}

// Health check utilities
export async function getSystemHealth(): Promise<{
  database: boolean
  connections: number
  activeJobs: number
  lastSync?: string
}> {
  try {
    // Test database connection
    await query('SELECT 1')
    
    // Get connection count
    const connectionsResult = await query(`
      SELECT COUNT(*) as count FROM connections WHERE status = 'connected'
    `)
    
    // Get active jobs count
    const jobsResult = await query(`
      SELECT COUNT(*) as count FROM sync_jobs 
      WHERE status IN ('pending', 'running')
    `)
    
    // Get last successful sync
    const lastSyncResult = await query(`
      SELECT MAX(completed_at) as last_sync 
      FROM sync_jobs 
      WHERE status = 'completed'
    `)

    return {
      database: true,
      connections: parseInt(connectionsResult.rows[0].count),
      activeJobs: parseInt(jobsResult.rows[0].count),
      lastSync: lastSyncResult.rows[0].last_sync
    }
  } catch (error) {
    return {
      database: false,
      connections: 0,
      activeJobs: 0
    }
  }
}
