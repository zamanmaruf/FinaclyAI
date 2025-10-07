import { NextRequest, NextResponse } from 'next/server'
import { isAuthProtected } from './env'

const PROTECTED_PATHS = ['/connect', '/dashboard']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  // Always allow API routes, health, and login
  if (pathname.startsWith('/api/') || pathname === '/login') {
    return NextResponse.next()
  }
  
  // If auth is not protected, allow all access
  if (!isAuthProtected()) {
    return NextResponse.next()
  }
  
  // Check if this path requires auth
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
