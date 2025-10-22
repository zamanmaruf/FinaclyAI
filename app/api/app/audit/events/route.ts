import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/lib/services/audit'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const entityType = searchParams.get('entityType')
    const entityId = searchParams.get('entityId')
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    const auditService = new AuditService()
    
    let events

    if (entityType && entityId) {
      // Get events for specific entity
      events = await auditService.getEntityEvents(companyId, entityType, entityId)
    } else {
      // Get all events for company (would need to implement pagination)
      events = await auditService.getEntityEvents(companyId, '', '')
    }

    // Apply pagination
    const paginatedEvents = events.slice(offset, offset + limit)

    return NextResponse.json({
      events: paginatedEvents,
      pagination: {
        total: events.length,
        limit,
        offset,
        hasMore: offset + limit < events.length
      }
    })

  } catch (error) {
    console.error('Error getting audit events:', error)
    return NextResponse.json(
      { 
        error: 'Failed to get audit events',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
