import { query } from '../db-utils'
import { createHash } from 'crypto'

export interface AuditEvent {
  id: string
  companyId: string
  actorType: string
  actorId: string
  verb: string
  entityType: string
  entityId: string
  payload: any
  hash: string
  prevHash?: string
  traceId?: string
  createdAt: Date
}

export class AuditService {
  private hashChain: Map<string, string> = new Map() // companyId -> lastHash

  // Log an audit event
  async logEvent(
    companyId: string,
    actorId: string,
    verb: string,
    entityType: string,
    entityId: string,
    payload: any
  ): Promise<string> {
    try {
      // Get previous hash for this company
      const prevHash = this.hashChain.get(companyId) || ''
      
      // Create payload hash
      const payloadString = JSON.stringify(payload)
      const payloadHash = createHash('sha256').update(payloadString).digest('hex')
      
      // Create chain hash
      const chainData = prevHash + payloadHash
      const chainHash = createHash('sha256').update(chainData).digest('hex')
      
      // Store event
      const result = await query(`
        INSERT INTO audit_events (
          company_id, actor_type, actor_id, verb, entity_type, entity_id,
          payload_jsonb, hash, prev_hash, trace_id, created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
        RETURNING id
      `, [
        companyId,
        'user', // Default actor type
        actorId,
        verb,
        entityType,
        entityId,
        JSON.stringify(payload),
        chainHash,
        prevHash,
        this.generateTraceId()
      ])

      const eventId = result.rows[0].id
      
      // Update hash chain
      this.hashChain.set(companyId, chainHash)
      
      console.log(`📝 Audit event logged: ${verb} on ${entityType} ${entityId}`)
      return eventId

    } catch (error) {
      console.error('Error logging audit event:', error)
      throw error
    }
  }

  // Export audit trail
  async exportAuditTrail(
    companyId: string, 
    format: 'csv' | 'json' = 'json',
    startDate?: Date,
    endDate?: Date
  ): Promise<Buffer> {
    try {
      let queryText = `
        SELECT * FROM audit_events 
        WHERE company_id = $1
      `
      const params: any[] = [companyId]
      let paramIndex = 2

      if (startDate) {
        queryText += ` AND created_at >= $${paramIndex}`
        params.push(startDate)
        paramIndex++
      }

      if (endDate) {
        queryText += ` AND created_at <= $${paramIndex}`
        params.push(endDate)
        paramIndex++
      }

      queryText += ' ORDER BY created_at ASC'

      const result = await query(queryText, params)
      const events = result.rows

      if (format === 'csv') {
        return this.exportToCSV(events)
      } else {
        return this.exportToJSON(events)
      }

    } catch (error) {
      console.error('Error exporting audit trail:', error)
      throw error
    }
  }

  // Export to CSV format
  private exportToCSV(events: any[]): Buffer {
    const headers = [
      'id', 'company_id', 'actor_type', 'actor_id', 'verb', 'entity_type', 'entity_id',
      'payload', 'hash', 'prev_hash', 'trace_id', 'created_at'
    ]

    const csvRows = [headers.join(',')]

    for (const event of events) {
      const row = [
        event.id,
        event.company_id,
        event.actor_type,
        event.actor_id,
        event.verb,
        event.entity_type,
        event.entity_id,
        `"${JSON.stringify(event.payload_jsonb).replace(/"/g, '""')}"`,
        event.hash,
        event.prev_hash || '',
        event.trace_id || '',
        event.created_at
      ]
      csvRows.push(row.join(','))
    }

    return Buffer.from(csvRows.join('\n'), 'utf8')
  }

  // Export to JSON format
  private exportToJSON(events: any[]): Buffer {
    const auditTrail = {
      export_date: new Date().toISOString(),
      total_events: events.length,
      events: events.map(event => ({
        id: event.id,
        companyId: event.company_id,
        actorType: event.actor_type,
        actorId: event.actor_id,
        verb: event.verb,
        entityType: event.entity_type,
        entityId: event.entity_id,
        payload: event.payload_jsonb,
        hash: event.hash,
        prevHash: event.prev_hash,
        traceId: event.trace_id,
        createdAt: event.created_at
      }))
    }

    return Buffer.from(JSON.stringify(auditTrail, null, 2), 'utf8')
  }

  // Get audit events for an entity
  async getEntityEvents(
    companyId: string,
    entityType: string,
    entityId: string
  ): Promise<AuditEvent[]> {
    try {
      const result = await query(`
        SELECT * FROM audit_events 
        WHERE company_id = $1 AND entity_type = $2 AND entity_id = $3
        ORDER BY created_at ASC
      `, [companyId, entityType, entityId])

      return result.rows.map((row: any) => ({
        id: row.id,
        companyId: row.company_id,
        actorType: row.actor_type,
        actorId: row.actor_id,
        verb: row.verb,
        entityType: row.entity_type,
        entityId: row.entity_id,
        payload: row.payload_jsonb,
        hash: row.hash,
        prevHash: row.prev_hash,
        traceId: row.trace_id,
        createdAt: row.created_at
      }))
    } catch (error) {
      console.error('Error getting entity events:', error)
      return []
    }
  }

  // Verify audit trail integrity
  async verifyIntegrity(companyId: string): Promise<{
    isValid: boolean
    errors: string[]
    totalEvents: number
  }> {
    try {
      const result = await query(`
        SELECT * FROM audit_events 
        WHERE company_id = $1
        ORDER BY created_at ASC
      `, [companyId])

      const events = result.rows
      const errors: string[] = []
      let isValid = true

      for (let i = 0; i < events.length; i++) {
        const event = events[i]
        const prevEvent = i > 0 ? events[i - 1] : null

        // Verify hash chain
        if (prevEvent) {
          const expectedPrevHash = prevEvent.hash
          if (event.prev_hash !== expectedPrevHash) {
            errors.push(`Hash chain broken at event ${event.id}: expected prev_hash ${expectedPrevHash}, got ${event.prev_hash}`)
            isValid = false
          }
        }

        // Verify hash calculation
        const payloadString = JSON.stringify(event.payload_jsonb)
        const payloadHash = createHash('sha256').update(payloadString).digest('hex')
        const chainData = (event.prev_hash || '') + payloadHash
        const expectedHash = createHash('sha256').update(chainData).digest('hex')
        
        if (event.hash !== expectedHash) {
          errors.push(`Hash mismatch at event ${event.id}: expected ${expectedHash}, got ${event.hash}`)
          isValid = false
        }
      }

      return {
        isValid,
        errors,
        totalEvents: events.length
      }
    } catch (error) {
      console.error('Error verifying audit integrity:', error)
      return {
        isValid: false,
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        totalEvents: 0
      }
    }
  }

  // Get audit statistics
  async getAuditStats(companyId: string): Promise<{
    totalEvents: number
    eventsByType: { [key: string]: number }
    eventsByActor: { [key: string]: number }
    recentActivity: any[]
  }> {
    try {
      const totalResult = await query(`
        SELECT COUNT(*) as count FROM audit_events WHERE company_id = $1
      `, [companyId])

      const typeResult = await query(`
        SELECT entity_type, COUNT(*) as count 
        FROM audit_events 
        WHERE company_id = $1 
        GROUP BY entity_type
      `, [companyId])

      const actorResult = await query(`
        SELECT actor_id, COUNT(*) as count 
        FROM audit_events 
        WHERE company_id = $1 
        GROUP BY actor_id
      `, [companyId])

      const recentResult = await query(`
        SELECT verb, entity_type, entity_id, created_at
        FROM audit_events 
        WHERE company_id = $1 
        ORDER BY created_at DESC 
        LIMIT 10
      `, [companyId])

      const eventsByType: { [key: string]: number } = {}
      typeResult.rows.forEach((row: any) => {
        eventsByType[row.entity_type] = parseInt(row.count)
      })

      const eventsByActor: { [key: string]: number } = {}
      actorResult.rows.forEach((row: any) => {
        eventsByActor[row.actor_id] = parseInt(row.count)
      })

      return {
        totalEvents: parseInt(totalResult.rows[0].count),
        eventsByType,
        eventsByActor,
        recentActivity: recentResult.rows
      }
    } catch (error) {
      console.error('Error getting audit stats:', error)
      return {
        totalEvents: 0,
        eventsByType: {},
        eventsByActor: {},
        recentActivity: []
      }
    }
  }

  // Generate trace ID
  private generateTraceId(): string {
    return createHash('sha256')
      .update(Date.now().toString() + Math.random().toString())
      .digest('hex')
      .substring(0, 16)
  }

  // Get events by trace ID
  async getEventsByTrace(traceId: string): Promise<AuditEvent[]> {
    try {
      const result = await query(`
        SELECT * FROM audit_events 
        WHERE trace_id = $1
        ORDER BY created_at ASC
      `, [traceId])

      return result.rows.map((row: any) => ({
        id: row.id,
        companyId: row.company_id,
        actorType: row.actor_type,
        actorId: row.actor_id,
        verb: row.verb,
        entityType: row.entity_type,
        entityId: row.entity_id,
        payload: row.payload_jsonb,
        hash: row.hash,
        prevHash: row.prev_hash,
        traceId: row.trace_id,
        createdAt: row.created_at
      }))
    } catch (error) {
      console.error('Error getting events by trace:', error)
      return []
    }
  }
}
