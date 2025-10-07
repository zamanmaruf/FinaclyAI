import { z } from 'zod'

const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().url(),
  PRISMA_MIGRATE_SHADOW_DATABASE_URL: z.string().url(),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url(),
  
  // Stripe
  STRIPE_SECRET_KEY: z.string().min(1),
  STRIPE_WEBHOOK_SECRET: z.string().min(1),
  
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
})

export const env = envSchema.parse(process.env)

// Warn (do not crash) if optional Plaid redirect URI is not provided
if (!env.PLAID_REDIRECT_URI) {
  console.warn('[env] PLAID_REDIRECT_URI is not set; Plaid OAuth redirects may be disabled in sandbox.');
}

if (!env.SHARED_PASSWORD) {
  console.warn('[env] SHARED_PASSWORD not set; using unsecured access for MVP unless provided.')
}
