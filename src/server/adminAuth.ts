import { env } from '@/env'
import { cookies } from 'next/headers'
import { NextRequest } from 'next/server'

const ADMIN_COOKIE_NAME = 'finacly_admin_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

/**
 * Verify admin password
 */
export function verifyAdminPassword(password: string): boolean {
  return password === env.ADMIN_PASSWORD
}

/**
 * Create admin session cookie value (simple hash)
 */
function createSessionToken(): string {
  const timestamp = Date.now()
  const random = Math.random().toString(36).substring(2, 15)
  return `admin_${timestamp}_${random}`
}

/**
 * Set admin session cookie
 */
export async function setAdminSession() {
  const cookieStore = await cookies()
  const sessionToken = createSessionToken()
  
  cookieStore.set(ADMIN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  })
  
  return sessionToken
}

/**
 * Clear admin session cookie
 */
export async function clearAdminSession() {
  const cookieStore = await cookies()
  cookieStore.delete(ADMIN_COOKIE_NAME)
}

/**
 * Check if user is authenticated as admin
 */
export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(ADMIN_COOKIE_NAME)
  
  // Check session cookie
  if (sessionCookie && sessionCookie.value.startsWith('admin_')) {
    return true
  }
  
  return false
}

/**
 * Check admin auth from request (for middleware)
 */
export function isAdminAuthenticatedFromRequest(request: NextRequest): boolean {
  const sessionCookie = request.cookies.get(ADMIN_COOKIE_NAME)
  
  // Check session cookie
  if (sessionCookie && sessionCookie.value.startsWith('admin_')) {
    return true
  }
  
  return false
}

