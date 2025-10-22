// Environment variable validation
// Ensures all required API keys and configuration are present at startup

interface RequiredEnvVars {
  // Database
  DATABASE_URL: string
  
  // Stripe
  STRIPE_SECRET_KEY: string
  STRIPE_PUBLISHABLE_KEY: string
  STRIPE_WEBHOOK_SECRET: string
  
  // Plaid
  PLAID_CLIENT_ID: string
  PLAID_SECRET: string
  PLAID_ENV: string
  
  // QuickBooks
  INTUIT_CLIENT_ID: string
  INTUIT_CLIENT_SECRET: string
  INTUIT_ENVIRONMENT: string
  INTUIT_REDIRECT_URI: string
  
  // Exchange Rates
  EXCHANGE_RATE_API_KEY: string
  
  // Application
  NEXTAUTH_SECRET: string
  ENCRYPTION_KEY: string
}

interface OptionalEnvVars {
  // Email
  SMTP_HOST?: string
  SMTP_PORT?: string
  SMTP_USER?: string
  SMTP_PASS?: string
  
  // Rate limiting
  RATE_LIMIT_REQUESTS_PER_MINUTE?: string
  
  // Logging
  LOG_LEVEL?: string
  
  // Security
  CORS_ORIGIN?: string
  
  // Testing
  DATABASE_URL_TEST?: string
}

const REQUIRED_ENV_VARS: (keyof RequiredEnvVars)[] = [
  'DATABASE_URL',
  'STRIPE_SECRET_KEY',
  'STRIPE_PUBLISHABLE_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'PLAID_CLIENT_ID',
  'PLAID_SECRET',
  'PLAID_ENV',
  'INTUIT_CLIENT_ID',
  'INTUIT_CLIENT_SECRET',
  'INTUIT_ENVIRONMENT',
  'INTUIT_REDIRECT_URI',
  'EXCHANGE_RATE_API_KEY',
  'NEXTAUTH_SECRET',
  'ENCRYPTION_KEY'
]

export function validateEnvironment(): void {
  const missing: string[] = []
  const invalid: string[] = []
  
  // Check required variables
  for (const varName of REQUIRED_ENV_VARS) {
    const value = process.env[varName]
    if (!value) {
      missing.push(varName)
    }
  }
  
  // Validate specific formats
  if (process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    invalid.push('STRIPE_SECRET_KEY must start with sk_test_ or sk_live_')
  }
  
  if (process.env.STRIPE_PUBLISHABLE_KEY && !process.env.STRIPE_PUBLISHABLE_KEY.startsWith('pk_')) {
    invalid.push('STRIPE_PUBLISHABLE_KEY must start with pk_test_ or pk_live_')
  }
  
  if (process.env.PLAID_ENV && !['sandbox', 'development', 'production'].includes(process.env.PLAID_ENV)) {
    invalid.push('PLAID_ENV must be one of: sandbox, development, production')
  }
  
  if (process.env.INTUIT_ENVIRONMENT && !['sandbox', 'production'].includes(process.env.INTUIT_ENVIRONMENT)) {
    invalid.push('INTUIT_ENVIRONMENT must be one of: sandbox, production')
  }
  
  if (process.env.EXCHANGE_RATE_API_KEY && process.env.EXCHANGE_RATE_API_KEY.length < 10) {
    invalid.push('EXCHANGE_RATE_API_KEY must be at least 10 characters long')
  }
  
  if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
    invalid.push('ENCRYPTION_KEY must be at least 32 characters long')
  }
  
  // Report errors
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:')
    missing.forEach(varName => {
      console.error(`   - ${varName}`)
    })
    console.error('\n📖 See .env.example for required variables')
  }
  
  if (invalid.length > 0) {
    console.error('❌ Invalid environment variable values:')
    invalid.forEach(error => {
      console.error(`   - ${error}`)
    })
  }
  
  if (missing.length > 0 || invalid.length > 0) {
    console.error('\n💡 To fix this:')
    console.error('   1. Copy .env.example to .env')
    console.error('   2. Fill in your API keys from the respective services')
    console.error('   3. Restart the application')
    
    throw new Error(`Environment validation failed: ${missing.length} missing, ${invalid.length} invalid`)
  }
  
  console.log('✅ Environment validation passed')
}

export function getEnvironmentConfig(): RequiredEnvVars & OptionalEnvVars {
  validateEnvironment()
  
  return {
    // Database
    DATABASE_URL: process.env.DATABASE_URL!,
    DATABASE_URL_TEST: process.env.DATABASE_URL_TEST,
    
    // Stripe
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY!,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY!,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET!,
    
    // Plaid
    PLAID_CLIENT_ID: process.env.PLAID_CLIENT_ID!,
    PLAID_SECRET: process.env.PLAID_SECRET!,
    PLAID_ENV: process.env.PLAID_ENV!,
    
    // QuickBooks
    INTUIT_CLIENT_ID: process.env.INTUIT_CLIENT_ID!,
    INTUIT_CLIENT_SECRET: process.env.INTUIT_CLIENT_SECRET!,
    INTUIT_ENVIRONMENT: process.env.INTUIT_ENVIRONMENT!,
    INTUIT_REDIRECT_URI: process.env.INTUIT_REDIRECT_URI!,
    
    // Exchange Rates
    EXCHANGE_RATE_API_KEY: process.env.EXCHANGE_RATE_API_KEY!,
    
    // Application
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET!,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY!,
    
    // Optional
    SMTP_HOST: process.env.SMTP_HOST,
    SMTP_PORT: process.env.SMTP_PORT,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASS: process.env.SMTP_PASS,
    RATE_LIMIT_REQUESTS_PER_MINUTE: process.env.RATE_LIMIT_REQUESTS_PER_MINUTE,
    LOG_LEVEL: process.env.LOG_LEVEL,
    CORS_ORIGIN: process.env.CORS_ORIGIN,
  }
}

// Auto-validate on import
if (process.env.NODE_ENV !== 'test') {
  try {
    validateEnvironment()
  } catch (error) {
    // Only throw in production
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
    console.warn('⚠️  Environment validation failed, but continuing in development mode')
  }
}

