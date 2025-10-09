import { NextRequest, NextResponse } from 'next/server';
import { isAuthProtected } from './env';
import { isAdminAuthenticatedFromRequest } from './server/adminAuth';

// Product pages requiring admin authentication
const ADMIN_PROTECTED_PATHS = ['/connect', '/dashboard'];

// Public marketing pages (no auth required)
const PUBLIC_PATHS = ['/', '/pricing', '/how-it-works', '/privacy', '/terms', '/admin/login'];

// Simple in-memory rate limiter (use Redis in production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function rateLimit(ip: string, limit: number = 100, windowMs: number = 60000): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= limit) {
    return false;
  }

  record.count++;
  return true;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Apply security headers to all responses
  const response = NextResponse.next();

  // Security headers for production-grade app
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  
  // Content Security Policy - allow Plaid Link, Stripe, and QuickBooks
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://cdn.plaid.com https://js.stripe.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://sandbox.plaid.com https://production.plaid.com https://api.stripe.com https://oauth.platform.intuit.com https://sandbox-quickbooks.api.intuit.com https://quickbooks.api.intuit.com",
    "frame-src 'self' https://cdn.plaid.com https://appcenter.intuit.com",
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // Rate limiting on API routes
  if (pathname.startsWith('/api/')) {
    const ip = req.ip || req.headers.get('x-forwarded-for') || 'unknown';
    
    // Stricter limits for sensitive endpoints
    const isSensitive = pathname.includes('/login') || 
                       pathname.includes('/stripe/connect') || 
                       pathname.includes('/qbo/connect');
    
    const limit = isSensitive ? 10 : 100;
    
    if (!rateLimit(ip, limit)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { 
          status: 429,
          headers: {
            'Retry-After': '60',
            ...Object.fromEntries(response.headers),
          },
        }
      );
    }
  }

  // Public API routes (always allow)
  const publicApiRoutes = [
    '/api/health',
    '/api/waitlist',
    '/api/status/stripe',
    '/api/status/plaid', 
    '/api/status/qbo',
  ];
  
  if (publicApiRoutes.some(route => pathname === route || pathname.startsWith(route))) {
    return response;
  }

  // Check if this is an admin-protected path (product pages)
  const isAdminProtectedPath = ADMIN_PROTECTED_PATHS.some((p) => pathname.startsWith(p));
  
  if (isAdminProtectedPath) {
    // Check admin authentication
    if (!isAdminAuthenticatedFromRequest(req)) {
      const loginUrl = new URL('/admin/login', req.url);
      loginUrl.searchParams.set('next', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Admin authenticated, allow access
    return response;
  }

  // Protected API routes (require admin auth, except public ones above)
  if (pathname.startsWith('/api/')) {
    if (!isAdminAuthenticatedFromRequest(req)) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 401 }
      );
    }
    return response;
  }

  // Public paths always allowed
  if (PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p))) {
    return response;
  }

  // Legacy SHARED_PASSWORD auth for /login
  if (pathname === '/login') {
    if (!isAuthProtected()) {
      return response;
    }
    
    const cookie = req.cookies.get('finacly_auth')?.value;
    if (cookie === 'ok') return response;
    
    return response; // Allow login page
  }

  // Default: allow access
  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.svg|og.svg|og.png|.*\\.jpg|.*\\.png|.*\\.svg).*)',
  ],
};
