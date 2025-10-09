import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  PRISMA_MIGRATE_SHADOW_DATABASE_URL: z.string().url(),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Feature Flags
  PUBLIC_MODE: z.enum(['production', 'internal']).optional().default('production'),
  
  // Security
  SECRET_ENCRYPTION_KEY: z.string().min(32, 'SECRET_ENCRYPTION_KEY must be at least 32 characters'),
  
  // Stripe (existing secret key for internal mode)
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  
  // Stripe Connect (for production OAuth)
  STRIPE_CONNECT_CLIENT_ID: z.string().optional(),
  
  // QuickBooks Online
  QBO_CLIENT_ID: z.string().min(1),
  QBO_CLIENT_SECRET: z.string().min(1),
  QBO_REDIRECT_URI: z.string().url(),
  INTUIT_ENV: z.enum(['development', 'production']),
  QBO_MINOR_VERSION: z.string().optional().default('75'),
  
  // Optional QBO configuration
  QBO_SANDBOX_BASE_URL: z.string().url().optional().default('https://sandbox-quickbooks.api.intuit.com/v3/company'),
  QBO_PRODUCTION_BASE_URL: z.string().url().optional().default('https://quickbooks.api.intuit.com/v3/company'),
  
  // Plaid
  PLAID_CLIENT_ID: z.string().min(1),
  PLAID_SECRET: z.string().min(1),
  PLAID_ENV: z.enum(['sandbox', 'development', 'production']),
  PLAID_REDIRECT_URI: z.string().url().optional(),
  PLAID_PRODUCTS: z.string().min(1),
  PLAID_COUNTRY_CODES: z.string().min(1),

  // Minimal shared-password auth (optional)
  SHARED_PASSWORD: z.string().optional(),
  
  // Admin token for test/dev endpoints (optional)
  SHARED_ADMIN_TOKEN: z.string().optional(),
})

export const env = envSchema.parse(process.env)

// Auth helper
export const isAuthProtected = () => {
  return env.SHARED_PASSWORD && env.SHARED_PASSWORD.length > 0
}

// Production mode helper
export const isProductionMode = () => {
  return env.PUBLIC_MODE === 'production'
}

// Production-mode validation
if (isProductionMode()) {
  console.log('[env] 🔒 PUBLIC_MODE=production - sandbox features disabled')
  
  // Ensure encryption key has sufficient entropy
  if (env.SECRET_ENCRYPTION_KEY.length < 32) {
    console.error('[env] ❌ SECRET_ENCRYPTION_KEY must be at least 32 characters in production')
    process.exit(1)
  }
  
  // Validate required provider keys are present (not empty)
  const requiredKeys = [
    'STRIPE_SECRET_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'QBO_CLIENT_ID',
    'QBO_CLIENT_SECRET',
    'PLAID_CLIENT_ID',
    'PLAID_SECRET',
  ]
  
  const missingKeys = requiredKeys.filter(key => !process.env[key] || process.env[key]!.trim() === '')
  if (missingKeys.length > 0) {
    console.error(`[env] ❌ Missing required environment variables in production: ${missingKeys.join(', ')}`)
    process.exit(1)
  }
  
  console.log('[env] ✅ All required provider keys present')
  console.log('[env] ℹ️  Stripe Connect OAuth:', env.STRIPE_CONNECT_CLIENT_ID ? 'enabled' : 'not configured (will use internal mode)')
} else {
  console.log('[env] 🛠️  PUBLIC_MODE=internal - sandbox features enabled')
  console.warn('[env] ⚠️  Internal mode allows test endpoints and sandbox flows')
}

// Warn (do not crash) if optional Plaid redirect URI is not provided
if (!env.PLAID_REDIRECT_URI) {
  console.warn('[env] PLAID_REDIRECT_URI is not set; Plaid OAuth redirects may be disabled in sandbox')
}

// Log auth status at startup
if (!isAuthProtected()) {
  console.warn('[auth] SHARED_PASSWORD not set; access is OPEN for automated testing')
} else {
  console.log('[auth] SHARED_PASSWORD set; access is PROTECTED')
}

// Log encryption status (never print the actual key)
console.log('[crypto] SECRET_ENCRYPTION_KEY:', env.SECRET_ENCRYPTION_KEY ? `present (${env.SECRET_ENCRYPTION_KEY.length} chars)` : 'MISSING')
