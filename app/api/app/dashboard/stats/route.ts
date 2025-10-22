import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { ApiResponse } from '@/lib/services/api-response'
import { logApiRequest } from '@/lib/services/logging'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return ApiResponse.badRequest('Company ID is required')
    }

    // Get total matches
    const matchesResult = await query(
      'SELECT COUNT(*) as count FROM matches WHERE company_id = $1',
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
      'SELECT MAX(completed_at) as last_sync FROM sync_jobs WHERE company_id = $1 AND status = $2',
      [companyId, 'completed']
    )
    const lastSyncDate = syncResult.rows[0]?.last_sync || null

    // Calculate match rate
    // Get total transactions from all sources
    const stripeBalanceTxnsResult = await query(
      'SELECT COUNT(*) as count FROM stripe_balance_txns WHERE company_id = $1',
      [companyId]
    )
    const stripePayoutsResult = await query(
      'SELECT COUNT(*) as count FROM stripe_payouts WHERE accountId IN (SELECT id FROM stripe_accounts WHERE company_id = $1)',
      [companyId]
    )
    const bankTransactionsResult = await query(
      'SELECT COUNT(*) as count FROM bank_transactions WHERE company_id = $1',
      [companyId]
    )
    const qboObjectsResult = await query(
      'SELECT COUNT(*) as count FROM qbo_objects WHERE company_id = $1',
      [companyId]
    )

    const totalTransactions = 
      parseInt(stripeBalanceTxnsResult.rows[0]?.count || '0') +
      parseInt(stripePayoutsResult.rows[0]?.count || '0') +
      parseInt(bankTransactionsResult.rows[0]?.count || '0') +
      parseInt(qboObjectsResult.rows[0]?.count || '0')

    const matchRate = totalTransactions > 0 ? (totalMatches / totalTransactions) * 100 : 0

    // Get recent matches with transaction details
    const recentMatchesResult = await query(`
      SELECT 
        m.id,
        m.confidence,
        m.created_at as matched_at,
        m.strategy as match_type,
        CASE 
          WHEN m.left_type = 'payout' THEN sp.amount_net
          WHEN m.left_type = 'bank' THEN bt.amount
          WHEN m.right_type = 'qbo' THEN qo.amount
        END as amount,
        CASE 
          WHEN m.left_type = 'payout' THEN sp.currency
          WHEN m.left_type = 'bank' THEN bt.currency
          WHEN m.right_type = 'qbo' THEN qo.currency
        END as currency,
        CASE 
          WHEN m.left_type = 'payout' AND m.right_type = 'bank' THEN 'Stripe Payout → Bank Deposit'
          WHEN m.left_type = 'bank' AND m.right_type = 'qbo' THEN 'Bank Transaction → QBO Transaction'
          ELSE m.strategy
        END as match_description
      FROM matches m
      LEFT JOIN stripe_payouts sp ON m.left_type = 'payout' AND m.left_ref = sp.payout_id
      LEFT JOIN bank_transactions bt ON (m.left_type = 'bank' AND m.left_ref = bt.id) OR (m.right_type = 'bank' AND m.right_ref = bt.id)
      LEFT JOIN qbo_objects qo ON (m.left_type = 'qbo' AND m.left_ref = qo.qbo_id) OR (m.right_type = 'qbo' AND m.right_ref = qo.qbo_id)
      WHERE m.company_id = $1
      ORDER BY m.created_at DESC
      LIMIT 5
    `, [companyId])

    const recentMatches = recentMatchesResult.rows.map((row: any) => ({
      id: row.id,
      type: row.match_description,
      amount: parseFloat(row.amount || '0'),
      currency: row.currency || 'USD',
      date: row.matched_at,
      confidence: parseFloat(row.confidence || '0')
    }))

        return ApiResponse.success({
          totalMatches,
          openExceptions,
          lastSyncDate,
          matchRate: Math.round(matchRate * 100) / 100, // Round to 2 decimal places
          recentMatches
        }, 'Dashboard stats retrieved successfully')

  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return ApiResponse.internalServerError('Failed to fetch dashboard stats')
  }
}
