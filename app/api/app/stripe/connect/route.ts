import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'
import { encrypt } from '@/lib/encryption'
import Stripe from 'stripe'

// Initialize Stripe with test key for validation
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-09-30.clover',
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { apiKey, companyId } = body

    if (!apiKey || !companyId) {
      return NextResponse.json(
        { error: 'API key and company ID are required' },
        { status: 400 }
      )
    }

    // Validate the Stripe API key by making a test call
    const testStripe = new Stripe(apiKey, {
      apiVersion: '2025-09-30.clover',
    })

    try {
      // Test the API key by fetching account info
      const account = await testStripe.accounts.retrieve()
      
      // Encrypt the API key before storing
      const encryptedApiKey = encrypt(apiKey)
      
      // Store encrypted credentials in database
      await query(`
        INSERT INTO api_credentials (company_id, service, encrypted_credentials, is_active)
        VALUES ($1, $2, $3, true)
        ON CONFLICT (company_id, service) 
        DO UPDATE SET 
          encrypted_credentials = EXCLUDED.encrypted_credentials,
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
      `, [
        companyId,
        'stripe',
        JSON.stringify({
          api_key: encryptedApiKey,
          account_id: account.id,
          account_type: account.type,
          country: account.country,
          currency: account.default_currency
        })
      ])

      return NextResponse.json({
        success: true,
        message: 'Stripe connection established successfully',
        account: {
          id: account.id,
          type: account.type,
          country: account.country,
          currency: account.default_currency
        }
      })

    } catch (stripeError: any) {
      console.error('Stripe API validation error:', stripeError)
      console.error('Stripe error details:', {
        message: stripeError.message,
        type: stripeError.type,
        code: stripeError.code,
        statusCode: stripeError.statusCode
      })
      return NextResponse.json(
        { 
          error: 'Invalid Stripe API key. Please check your key and try again.',
          details: stripeError.message 
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Error connecting Stripe:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const companyId = searchParams.get('companyId')

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Check if Stripe is connected for this company
    const result = await query(
      'SELECT * FROM api_credentials WHERE company_id = $1 AND service = $2 AND is_active = true',
      [companyId, 'stripe']
    )

    if (result.rows.length === 0) {
      return NextResponse.json({
        connected: false,
        message: 'Stripe not connected'
      })
    }

    const credentials = result.rows[0]
    
    return NextResponse.json({
      connected: true,
      account: credentials.encrypted_credentials ? JSON.parse(credentials.encrypted_credentials) : null,
      connectedAt: credentials.created_at
    })

  } catch (error) {
    console.error('Error checking Stripe connection:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
