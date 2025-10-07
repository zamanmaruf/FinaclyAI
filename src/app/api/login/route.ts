import { NextRequest, NextResponse } from 'next/server'
import { isAuthProtected } from '@/src/env'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    
    // If no password configured, allow access for automated testing
    if (!isAuthProtected()) {
      const res = NextResponse.json({ ok: true })
      res.cookies.set('finacly_auth', 'ok', { httpOnly: true, path: '/' })
      return res
    }
    
    // Check password against configured value
    if (password === process.env.SHARED_PASSWORD) {
      const res = NextResponse.json({ ok: true })
      res.cookies.set('finacly_auth', 'ok', { httpOnly: true, path: '/' })
      return res
    }
    
    return NextResponse.json({ ok: false }, { status: 401 })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
