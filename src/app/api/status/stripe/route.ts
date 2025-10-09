import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { isProductionMode } from '@/env'

/**
 * GET /api/status/stripe
 * 
 * Returns Stripe connection status for the current tenant.
 * Does not expose token values.
 */
export async function GET() {
  try {
    // Use hardcoded owner ID for single-tenant mode
    const ownerId = '1'
    
    if (isProductionMode()) {
      // In production mode, check for Stripe Connect OAuth connection
      const connection = await db.stripeConnect.findFirst({
        where: { ownerId },
        orderBy: { updatedAt: 'desc' },
      })
      
      if (!connection) {
        return NextResponse.json({
          connected: false,
          mode: 'production',
        })
      }
      
      return NextResponse.json({
        connected: true,
        accountId: connection.accountId,
        livemode: connection.livemode,
        lastVerified: connection.updatedAt.toISOString(),
        mode: 'production',
      })
    } else {
      // In internal mode, check if we have any Stripe data (indicates env key is working)
      const accountCount = await db.stripeAccount.count()
      
      return NextResponse.json({
        connected: accountCount > 0,
        mode: 'internal',
        lastVerified: accountCount > 0 ? new Date().toISOString() : null,
      })
    }
  } catch (error) {
    console.error('[stripe-status] Error checking status:', error)
    return NextResponse.json(
      { error: 'Failed to check Stripe status' },
      { status: 500 }
    )
  }
}

