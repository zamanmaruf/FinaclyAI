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
  PLAID_REDIRECT_URI: z.string().url(),
  PLAID_PRODUCTS: z.string().min(1),
  PLAID_COUNTRY_CODES: z.string().min(1),
})

export const env = envSchema.parse(process.env)
