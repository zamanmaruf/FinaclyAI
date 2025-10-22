import { NextRequest, NextResponse } from 'next/server'
import { ReconciliationEngine } from '@/lib/reconciliation'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId, startDate, endDate } = body

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    console.log(`🔄 Starting reconciliation for company ${companyId}`)

    // Initialize reconciliation engine
    const engine = new ReconciliationEngine(companyId)

    // Parse dates if provided
    const start = startDate ? new Date(startDate) : undefined
    const end = endDate ? new Date(endDate) : undefined

    // Run reconciliation
    const result = await engine.reconcile(start, end)

    return NextResponse.json({
      success: true,
      data: result,
      message: `Reconciliation completed: ${result.matches.length} matches found, ${result.exceptions.length} exceptions identified`
    })

  } catch (error) {
    console.error('❌ Reconciliation API error:', error)
    return NextResponse.json(
      { error: 'Reconciliation failed', details: (error as Error).message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    console.log(`📊 Getting reconciliation summary for company ${companyId}`)

    // Initialize reconciliation engine
    const engine = new ReconciliationEngine(companyId)

    // Run reconciliation (no date filtering for summary)
    const result = await engine.reconcile()

    return NextResponse.json({
      success: true,
      data: { matches: result.matches, exceptions: result.exceptions, summary: result.summary }
    })

  } catch (error) {
    console.error('❌ Reconciliation summary API error:', error)
    return NextResponse.json(
      { error: 'Failed to get reconciliation summary', details: (error as Error).message },
      { status: 500 }
    )
  }
}
