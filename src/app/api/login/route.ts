import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/src/env'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()
    if (!env.SHARED_PASSWORD) {
      // If no password configured, allow access in MVP
      const res = NextResponse.json({ ok: true })
      res.cookies.set('finacly_auth', 'ok', { httpOnly: true, path: '/' })
      return res
    }
    if (password === env.SHARED_PASSWORD) {
      const res = NextResponse.json({ ok: true })
      res.cookies.set('finacly_auth', 'ok', { httpOnly: true, path: '/' })
      return res
    }
    return NextResponse.json({ ok: false }, { status: 401 })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
}
