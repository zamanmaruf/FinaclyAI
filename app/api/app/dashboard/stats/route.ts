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

    // Get total matches
    const matchesResult = await query(
      'SELECT COUNT(*) as count FROM transaction_matches WHERE company_id = $1',
      [companyId]
    )
    const totalMatches = parseInt(matchesResult.rows[0]?.count || '0')

    // Get open exceptions
    const exceptionsResult = await query(
      'SELECT COUNT(*) as count FROM exceptions WHERE company_id = $1 AND status = $2',
      [companyId, 'open']
    )
    const openExceptions = parseInt(exceptionsResult.rows[0]?.count || '0')

    // Get last sync date
    const syncResult = await query(
      'SELECT MAX(completed_at) as last_sync FROM sync_history WHERE company_id = $1 AND status = $2',
      [companyId, 'completed']
    )
    const lastSyncDate = syncResult.rows[0]?.last_sync || null

    // Calculate match rate
    // Get total transactions from all sources
    const stripeChargesResult = await query(
      'SELECT COUNT(*) as count FROM stripe_charges WHERE company_id = $1',
      [companyId]
    )
    const stripePayoutsResult = await query(
      'SELECT COUNT(*) as count FROM stripe_payouts WHERE company_id = $1',
      [companyId]
    )
    const bankTransactionsResult = await query(
      'SELECT COUNT(*) as count FROM bank_transactions WHERE company_id = $1',
      [companyId]
    )
    const qboTransactionsResult = await query(
      'SELECT COUNT(*) as count FROM qbo_transactions WHERE company_id = $1',
      [companyId]
    )

    const totalTransactions = 
      parseInt(stripeChargesResult.rows[0]?.count || '0') +
      parseInt(stripePayoutsResult.rows[0]?.count || '0') +
      parseInt(bankTransactionsResult.rows[0]?.count || '0') +
      parseInt(qboTransactionsResult.rows[0]?.count || '0')

    const matchRate = totalTransactions > 0 ? (totalMatches / totalTransactions) * 100 : 0

    // Get recent matches with transaction details
    const recentMatchesResult = await query(`
      SELECT 
        tm.id,
        tm.match_confidence,
        tm.matched_at,
        tm.match_type,
        CASE 
          WHEN tm.stripe_charge_id IS NOT NULL THEN sc.amount
          WHEN tm.stripe_payout_id IS NOT NULL THEN sp.amount
          WHEN tm.bank_transaction_id IS NOT NULL THEN bt.amount
          WHEN tm.qbo_transaction_id IS NOT NULL THEN qt.amount
        END as amount,
        CASE 
          WHEN tm.stripe_charge_id IS NOT NULL THEN sc.currency
          WHEN tm.stripe_payout_id IS NOT NULL THEN sp.currency
          WHEN tm.bank_transaction_id IS NOT NULL THEN bt.currency
          WHEN tm.qbo_transaction_id IS NOT NULL THEN qt.currency
        END as currency,
        CASE 
          WHEN tm.stripe_charge_id IS NOT NULL THEN 'Stripe Charge → ' || COALESCE(bt.name, 'Bank Deposit')
          WHEN tm.stripe_payout_id IS NOT NULL THEN 'Stripe Payout → ' || COALESCE(bt.name, 'Bank Deposit')
          WHEN tm.bank_transaction_id IS NOT NULL AND tm.qbo_transaction_id IS NOT NULL THEN 'Bank Transaction → QBO Transaction'
          ELSE tm.match_type
        END as match_description
      FROM transaction_matches tm
      LEFT JOIN stripe_charges sc ON tm.stripe_charge_id = sc.id
      LEFT JOIN stripe_payouts sp ON tm.stripe_payout_id = sp.id
      LEFT JOIN bank_transactions bt ON tm.bank_transaction_id = bt.id
      LEFT JOIN qbo_transactions qt ON tm.qbo_transaction_id = qt.id
      WHERE tm.company_id = $1
      ORDER BY tm.matched_at DESC
      LIMIT 5
    `, [companyId])

    const recentMatches = recentMatchesResult.rows.map((row: any) => ({
      id: row.id,
      type: row.match_description,
      amount: parseFloat(row.amount || '0'),
      currency: row.currency || 'USD',
      date: row.matched_at,
      confidence: parseFloat(row.match_confidence || '0')
    }))

    return NextResponse.json({
      success: true,
      data: {
        totalMatches,
        openExceptions,
        lastSyncDate,
        matchRate: Math.round(matchRate * 100) / 100, // Round to 2 decimal places
        recentMatches
      }
    })

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
