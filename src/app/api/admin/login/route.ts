import { NextRequest, NextResponse } from 'next/server'
import { verifyAdminPassword, setAdminSession } from '@/server/adminAuth'

/**
 * POST /api/admin/login
 * 
 * Admin login endpoint. Verifies password and sets session cookie.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { password } = body

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    if (!verifyAdminPassword(password)) {
      console.warn('[admin-login] Failed login attempt')
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Set admin session cookie
    await setAdminSession()

    console.log('[admin-login] ✅ Admin logged in successfully')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[admin-login] Error:', error)
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    )
  }
}

