import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

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

    // Get all exceptions for the company
    const exceptionsResult = await query(`
      SELECT 
        id, type as exception_type, 
        CASE 
          WHEN type LIKE '%PAYOUT_MISSING%' THEN 'critical'
          WHEN type LIKE '%STRIPE_CHARGE%' THEN 'high'
          WHEN type LIKE '%BANK_TRANSACTION%' THEN 'medium'
          ELSE 'low'
        END as severity,
        evidence_jsonb->>'description' as description,
        proposed_action as suggested_action,
        entity_refs,
        status, created_at, resolved_at
      FROM exceptions 
      WHERE company_id = $1 
      ORDER BY created_at DESC
    `, [companyId])

    return NextResponse.json({
      success: true,
      data: exceptionsResult.rows
    })

  } catch (error) {
    console.error('Error fetching exceptions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}