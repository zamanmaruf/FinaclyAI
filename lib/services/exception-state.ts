import { query, trackEvent } from '../db-utils'
import { AuditService } from './audit'

export interface ExceptionTransition {
  exceptionId: string
  fromStatus: string
  toStatus: string
  action: string
  userId: string
  timestamp: Date
  metadata?: any
}

export class ExceptionStateMachine {
  private auditService: AuditService
  private readonly VALID_TRANSITIONS = {
    'open': ['resolved', 'ignored'],
    'resolved': [], // Terminal state
    'ignored': [] // Terminal state
  }

  constructor() {
    this.auditService = new AuditService()
  }

  // Transition exception to new state
  async transition(
    exceptionId: string, 
    action: 'resolve' | 'ignore', 
    userId: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      console.log(`🔄 Transitioning exception ${exceptionId} to ${action}`)

      // Get current exception
      const exception = await this.getException(exceptionId)
      if (!exception) {
        throw new Error(`Exception ${exceptionId} not found`)
      }

      // Validate transition
      const newStatus = action === 'resolve' ? 'resolved' : 'ignored'
      if (!this.isValidTransition(exception.status, newStatus)) {
        throw new Error(`Invalid transition from ${exception.status} to ${newStatus}`)
      }

      // Update exception status
      await this.updateExceptionStatus(exceptionId, newStatus, userId)

      // Create audit event
      const auditId = await this.auditService.logEvent(
        exception.companyId,
        userId,
        'exception_transition',
        'exception',
        exceptionId,
        {
          from_status: exception.status,
          to_status: newStatus,
          action,
          metadata
        }
      )

      // Track analytics event
      await trackEvent('exception_transition', exception.companyId, {
        exceptionId,
        action,
        fromStatus: exception.status,
        toStatus: newStatus,
        auditId
      })

      console.log(`✅ Exception ${exceptionId} transitioned to ${newStatus}`)
      return true

    } catch (error) {
      console.error(`Error transitioning exception ${exceptionId}:`, error)
      return false
    }
  }

  // Resolve exception with QBO object link
  async resolveWithQBOObject(
    exceptionId: string,
    qboObjectId: string,
    userId: string,
    metadata?: any
  ): Promise<boolean> {
    try {
      console.log(`🔄 Resolving exception ${exceptionId} with QBO object ${qboObjectId}`)

      // Get exception
      const exception = await this.getException(exceptionId)
      if (!exception) {
        throw new Error(`Exception ${exceptionId} not found`)
      }

      // Update exception status
      await this.updateExceptionStatus(exceptionId, 'resolved', userId)

      // Create match record if applicable
      if (exception.entityRefs?.payout_id) {
        await this.createMatchFromException(exception, qboObjectId)
      }

      // Create audit event
      const auditId = await this.auditService.logEvent(
        exception.companyId,
        userId,
        'exception_resolved_with_qbo',
        'exception',
        exceptionId,
        {
          qbo_object_id: qboObjectId,
          exception_type: exception.type,
          metadata
        }
      )

      // Track analytics event
      await trackEvent('exception_resolved', exception.companyId, {
        exceptionId,
        qboObjectId,
        exceptionType: exception.type,
        auditId
      })

      console.log(`✅ Exception ${exceptionId} resolved with QBO object ${qboObjectId}`)
      return true

    } catch (error) {
      console.error(`Error resolving exception ${exceptionId}:`, error)
      return false
    }
  }

  // Get exception by ID
  private async getException(exceptionId: string): Promise<any> {
    const result = await query(`
      SELECT * FROM exceptions WHERE id = $1
    `, [exceptionId])

    if (result.rows.length === 0) {
      return null
    }

    const row = result.rows[0]
    return {
      id: row.id,
      companyId: row.company_id,
      type: row.type,
      status: row.status,
      entityRefs: row.entity_refs,
      evidence: row.evidence_jsonb,
      proposedAction: row.proposed_action,
      confidence: parseFloat(row.confidence),
      createdAt: row.created_at,
      resolvedAt: row.resolved_at,
      resolvedBy: row.resolved_by
    }
  }

  // Update exception status
  private async updateExceptionStatus(
    exceptionId: string, 
    status: string, 
    userId: string
  ): Promise<void> {
    const updateFields = ['status = $2', 'updated_at = CURRENT_TIMESTAMP']
    const values: any[] = [exceptionId, status]

    if (status === 'resolved' || status === 'ignored') {
      updateFields.push('resolved_at = CURRENT_TIMESTAMP')
      updateFields.push('resolved_by = $3')
      values.push(userId)
    }

    await query(`
      UPDATE exceptions 
      SET ${updateFields.join(', ')}
      WHERE id = $1
    `, values)
  }

  // Create match record from resolved exception
  private async createMatchFromException(exception: any, qboObjectId: string): Promise<void> {
    if (!exception.entityRefs?.payout_id) {
      return // Only create matches for payout-related exceptions
    }

    await query(`
      INSERT INTO matches (
        company_id, left_ref, right_ref, left_type, right_type,
        strategy, confidence, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
    `, [
      exception.companyId,
      exception.entityRefs.payout_id,
      qboObjectId,
      'payout',
      'qbo',
      'exception_resolved',
      exception.confidence
    ])
  }

  // Validate transition
  private isValidTransition(fromStatus: string, toStatus: string): boolean {
    const validTransitions = this.VALID_TRANSITIONS[fromStatus as keyof typeof this.VALID_TRANSITIONS]
    return validTransitions ? (validTransitions as string[]).includes(toStatus) : false
  }

  // Get exception history
  async getExceptionHistory(exceptionId: string): Promise<ExceptionTransition[]> {
    try {
      const result = await query(`
        SELECT ae.* FROM audit_events ae
        WHERE ae.entity_type = 'exception' 
          AND ae.entity_id = $1
          AND ae.verb IN ('exception_transition', 'exception_resolved_with_qbo')
        ORDER BY ae.created_at ASC
      `, [exceptionId])

      return result.rows.map((row: any) => ({
        exceptionId: row.entity_id,
        fromStatus: row.payload_jsonb?.from_status || 'unknown',
        toStatus: row.payload_jsonb?.to_status || 'unknown',
        action: row.verb,
        userId: row.actor_id,
        timestamp: row.created_at,
        metadata: row.payload_jsonb
      }))
    } catch (error) {
      console.error('Error getting exception history:', error)
      return []
    }
  }

  // Get exception statistics
  async getExceptionStats(companyId: string): Promise<{
    totalExceptions: number
    openExceptions: number
    resolvedExceptions: number
    ignoredExceptions: number
    resolutionRate: number
    averageResolutionTime: number
  }> {
    try {
      const totalResult = await query(`
        SELECT COUNT(*) as count FROM exceptions WHERE company_id = $1
      `, [companyId])

      const statusResult = await query(`
        SELECT status, COUNT(*) as count 
        FROM exceptions 
        WHERE company_id = $1 
        GROUP BY status
      `, [companyId])

      const resolutionTimeResult = await query(`
        SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/3600) as avg_hours
        FROM exceptions 
        WHERE company_id = $1 AND status = 'resolved'
      `, [companyId])

      const totalExceptions = parseInt(totalResult.rows[0].count)
      
      const statusBreakdown: { [key: string]: number } = {}
      statusResult.rows.forEach((row: any) => {
        statusBreakdown[row.status] = parseInt(row.count)
      })

      const openExceptions = statusBreakdown.open || 0
      const resolvedExceptions = statusBreakdown.resolved || 0
      const ignoredExceptions = statusBreakdown.ignored || 0
      const resolutionRate = totalExceptions > 0 ? 
        ((resolvedExceptions + ignoredExceptions) / totalExceptions) * 100 : 0
      const averageResolutionTime = parseFloat(resolutionTimeResult.rows[0].avg_hours) || 0

      return {
        totalExceptions,
        openExceptions,
        resolvedExceptions,
        ignoredExceptions,
        resolutionRate,
        averageResolutionTime
      }
    } catch (error) {
      console.error('Error getting exception stats:', error)
      return {
        totalExceptions: 0,
        openExceptions: 0,
        resolvedExceptions: 0,
        ignoredExceptions: 0,
        resolutionRate: 0,
        averageResolutionTime: 0
      }
    }
  }

  // Bulk transition exceptions
  async bulkTransition(
    exceptionIds: string[],
    action: 'resolve' | 'ignore',
    userId: string,
    metadata?: any
  ): Promise<{ success: number; failed: number; errors: string[] }> {
    let success = 0
    let failed = 0
    const errors: string[] = []

    for (const exceptionId of exceptionIds) {
      try {
        const result = await this.transition(exceptionId, action, userId, metadata)
        if (result) {
          success++
        } else {
          failed++
          errors.push(`Failed to transition exception ${exceptionId}`)
        }
      } catch (error) {
        failed++
        errors.push(`Error transitioning exception ${exceptionId}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    // Track bulk operation
    await trackEvent('bulk_exception_transition', '', {
      action,
      totalExceptions: exceptionIds.length,
      success,
      failed,
      userId
    })

    return { success, failed, errors }
  }
}
