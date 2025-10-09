import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { Configuration, PlaidApi, PlaidEnvironments, Products, CountryCode } from 'plaid'

/**
 * POST /api/connect/plaid/link-token
 * 
 * Creates a Plaid Link token for initializing Plaid Link in the browser.
 * This is the production-safe way to connect bank accounts.
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body for optional user info
    const body = await request.json().catch(() => ({}))
    const userId = body.userId || 'user-1' // Default to single-tenant user ID
    
    // Initialize Plaid client
    const configuration = new Configuration({
      basePath: PlaidEnvironments[env.PLAID_ENV],
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': env.PLAID_CLIENT_ID,
          'PLAID-SECRET': env.PLAID_SECRET,
        },
      },
    })
    
    const plaidClient = new PlaidApi(configuration)
    
    // Parse products and country codes from env
    const products = env.PLAID_PRODUCTS.split(',').map(p => p.trim() as Products)
    const countryCodes = env.PLAID_COUNTRY_CODES.split(',').map(c => c.trim() as CountryCode)
    
    // Create link token
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'FinaclyAI',
      products: products,
      country_codes: countryCodes,
      language: 'en',
      redirect_uri: env.PLAID_REDIRECT_URI || undefined,
    })
    
    console.log('[plaid-link] ✅ Created link token for user:', userId)
    
    return NextResponse.json({
      linkToken: response.data.link_token,
      expiration: response.data.expiration,
    })
  } catch (error: any) {
    console.error('[plaid-link] Error creating link token:', error.response?.data || error.message)
    
    return NextResponse.json(
      { 
        error: 'Failed to create Plaid Link token',
        details: error.response?.data?.error_message || error.message,
      },
      { status: 500 }
    )
  }
}

