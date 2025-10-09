import { NextResponse } from 'next/server'
import { db } from '@/server/db'
import { pingCompany } from '@/server/qbo/client'

/**
 * GET /api/status/qbo
 * 
 * Returns QuickBooks connection status for the current tenant.
 * Performs a lightweight company info call to verify token is valid.
 * Does not expose token values.
 */
export async function GET() {
  try {
    // Use hardcoded owner ID for single-tenant mode
    const ownerId = '1'
    
    // Find most recent QBO token for this owner
    const qboToken = await db.qboToken.findFirst({
      where: {
        company: {
          ownerId,
        },
      },
      include: {
        company: true,
      },
      orderBy: { updatedAt: 'desc' },
    })
    
    if (!qboToken) {
      return NextResponse.json({
        connected: false,
      })
    }
    
    try {
      // Perform lightweight ping to verify connection
      const pingResult = await pingCompany(qboToken.realmId)
      
      return NextResponse.json({
        connected: pingResult.ok,
        realmId: qboToken.realmId,
        companyName: pingResult.companyName || qboToken.company.name || 'Unknown',
        lastVerified: new Date().toISOString(),
      })
    } catch (error: any) {
      // Token might be expired or invalid
      console.warn('[qbo-status] Connection test failed:', error.message)
      
      // Check if it's a token expiration error
      if (error.message?.includes('expired') || error.message?.includes('invalid_grant')) {
        return NextResponse.json({
          connected: false,
          error: 'QuickBooks authorization expired. Please reconnect.',
        })
      }
      
      // Still connected, but test failed for other reasons
      return NextResponse.json({
        connected: true,
        realmId: qboToken.realmId,
        companyName: qboToken.company.name || 'Unknown',
        lastVerified: qboToken.updatedAt.toISOString(),
        warning: 'Could not verify connection',
      })
    }
  } catch (error) {
    console.error('[qbo-status] Error checking status:', error)
    return NextResponse.json(
      { error: 'Failed to check QuickBooks status' },
      { status: 500 }
    )
  }
}

