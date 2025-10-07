import { NextRequest, NextResponse } from 'next/server'

const PROTECTED_PATHS = ['/connect', '/dashboard']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  const requiresAuth = PROTECTED_PATHS.some(p => pathname.startsWith(p))
  if (!requiresAuth) return NextResponse.next()

  const cookie = req.cookies.get('finacly_auth')?.value
  if (cookie === 'ok') return NextResponse.next()

  const loginUrl = new URL('/login', req.url)
  loginUrl.searchParams.set('next', pathname)
  return NextResponse.redirect(loginUrl)
}

export const config = {
  matcher: ['/connect', '/dashboard'],
}
