import { NextResponse } from 'next/server'
import { db } from '@/server/db'

/**
 * GET /api/status/plaid
 * 
 * Returns Plaid connection status for the current tenant.
 * Does not expose token values.
 */
export async function GET() {
  try {
    // Use hardcoded owner ID for single-tenant mode
    const ownerId = '1'
    
    // Find most recent bank item for this owner
    const bankItem = await db.bankItem.findFirst({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' },
      include: {
        accounts: true,
      },
    })
    
    if (!bankItem) {
      return NextResponse.json({
        connected: false,
      })
    }
    
    // Get last sync timestamp from most recent transaction
    const lastTransaction = await db.plaidTransaction.findFirst({
      where: {
        bankAccount: {
          bankItemId: bankItem.id,
        },
      },
      orderBy: { createdAt: 'desc' },
    })
    
    return NextResponse.json({
      connected: true,
      institutionName: bankItem.institutionName,
      accountsCount: bankItem.accounts.length,
      lastSync: lastTransaction?.createdAt.toISOString() || bankItem.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[plaid-status] Error checking status:', error)
    return NextResponse.json(
      { error: 'Failed to check Plaid status' },
      { status: 500 }
    )
  }
}

