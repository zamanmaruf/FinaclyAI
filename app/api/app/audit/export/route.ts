import { NextRequest, NextResponse } from 'next/server'
import { AuditService } from '@/lib/services/audit'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')
    const format = searchParams.get('format') as 'csv' | 'json' || 'json'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    const auditService = new AuditService()
    
    // Parse dates if provided
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    // Export audit trail
    const auditTrail = await auditService.exportAuditTrail(companyId, format, start, end)

    // Set appropriate headers
    const headers = new Headers()
    headers.set('Content-Type', format === 'csv' ? 'text/csv' : 'application/json')
    headers.set('Content-Disposition', `attachment; filename="audit-trail-${companyId}-${new Date().toISOString().split('T')[0]}.${format}"`)

    return new NextResponse(auditTrail as any, {
      status: 200,
      headers
    })

  } catch (error) {
    console.error('Error exporting audit trail:', error)
    return NextResponse.json(
      { 
        error: 'Failed to export audit trail',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
