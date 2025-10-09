import { NextResponse } from 'next/server'
import { clearAdminSession } from '@/server/adminAuth'

/**
 * POST /api/admin/logout
 * 
 * Admin logout endpoint. Clears session cookie.
 */
export async function POST() {
  try {
    await clearAdminSession()
    
    console.log('[admin-logout] ✅ Admin logged out')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin-logout] Error:', error)
    return NextResponse.json(
      { error: 'Logout failed' },
      { status: 500 }
    )
  }
}

