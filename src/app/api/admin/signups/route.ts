import { NextResponse } from 'next/server'
import { db } from '@/server/db'

/**
 * GET /api/admin/signups
 * 
 * Returns all waitlist signups (protected by middleware).
 */
export async function GET() {
  try {
    const signups = await db.waitlistSignup.findMany({
      orderBy: { createdAt: 'desc' },
    })

    // Calculate stats
    const now = new Date()
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    const stats = {
      total: signups.length,
      last7Days: signups.filter(s => new Date(s.createdAt) >= sevenDaysAgo).length,
      last30Days: signups.filter(s => new Date(s.createdAt) >= thirtyDaysAgo).length,
    }

    return NextResponse.json({ signups, stats })
  } catch (error) {
    console.error('[admin-signups] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch signups' },
      { status: 500 }
    )
  }
}

