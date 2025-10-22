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

    // Get real data from database
    
    // Match rate trend (last 7 days)
    const matchRateTrendResult = await query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as matches,
        ROUND(AVG(confidence), 1) as match_rate
      FROM matches 
      WHERE company_id = $1 
        AND created_at >= CURRENT_DATE - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
      LIMIT 7
    `, [companyId])
    
    const matchRateTrend = matchRateTrendResult.rows.length > 0 ? 
      matchRateTrendResult.rows.map((row: any) => ({
        date: row.date,
        matches: parseInt(row.matches),
        match_rate: parseFloat(row.match_rate)
      })) : []

    // Exception breakdown by type
    const exceptionBreakdownResult = await query(`
      SELECT 
        type as exception_type,
        COUNT(*) as count,
        CASE 
          WHEN type LIKE '%PAYOUT_MISSING%' THEN 'critical'
          WHEN type LIKE '%STRIPE_CHARGE%' THEN 'high'
          WHEN type LIKE '%BANK_TRANSACTION%' THEN 'medium'
          ELSE 'low'
        END as severity
      FROM exceptions 
      WHERE company_id = $1 AND status = 'open'
      GROUP BY type
      ORDER BY count DESC
    `, [companyId])
    
    const exceptionBreakdown = exceptionBreakdownResult.rows.map((row: any) => ({
      exception_type: row.exception_type,
      count: parseInt(row.count),
      severity: row.severity
    }))

    // Transaction volume - show current totals
    const transactionVolumeResult = await query(`
      SELECT 
        CURRENT_DATE as date,
        (SELECT COUNT(*) FROM stripe_balance_txns WHERE company_id = $1) as stripe,
        (SELECT COUNT(*) FROM bank_transactions WHERE company_id = $1) as bank,
        (SELECT COUNT(*) FROM qbo_objects WHERE company_id = $1) as quickbooks
    `, [companyId])
    
    const transactionVolume = transactionVolumeResult.rows.map((row: any) => ({
      date: row.date,
      stripe: parseInt(row.stripe) || 0,
      bank: parseInt(row.bank) || 0,
      quickbooks: parseInt(row.quickbooks) || 0,
      total: parseInt(row.total) || 0
    }))

    // Sync history (last 10 syncs)
    const syncHistoryResult = await query(`
      SELECT 
        job_type as service,
        status,
        started_at as created_at,
        metadata->>'records_processed' as records_processed,
        error_message
      FROM sync_jobs 
      WHERE company_id = $1
      ORDER BY started_at DESC
      LIMIT 10
    `, [companyId])
    
    const syncHistory = syncHistoryResult.rows.map((row: any) => ({
      service: row.service,
      status: row.status,
      created_at: row.created_at,
      records_processed: parseInt(row.records_processed) || 0,
      error_message: row.error_message
    }))

    return NextResponse.json({
      success: true,
      data: {
        matchRateTrend,
        exceptionBreakdown,
        transactionVolume,
        syncHistory
      }
    })

  } catch (error: any) {
    console.error('Error fetching dashboard charts:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}
