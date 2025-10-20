import { NextRequest, NextResponse } from 'next/server'
import { PlaidApi, Configuration, PlaidEnvironments, LinkTokenCreateRequest } from 'plaid'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { companyId } = body

    if (!companyId) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      )
    }

    // Initialize Plaid client
    const configuration = new Configuration({
      basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments] || PlaidEnvironments.sandbox,
      baseOptions: {
        headers: {
          'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
          'PLAID-SECRET': process.env.PLAID_SECRET,
        },
      },
    })

    const client = new PlaidApi(configuration)

    // Create link token request
    const linkTokenRequest: LinkTokenCreateRequest = {
      user: {
        client_user_id: companyId.toString(),
      },
      client_name: 'Finacly AI',
      products: ['transactions'] as any,
      country_codes: ['US', 'CA'] as any,
      language: 'en',
      webhook: `${process.env.NEXT_PUBLIC_APP_URL}/api/app/plaid/webhook`,
    }

    // Generate link token
    const response = await client.linkTokenCreate(linkTokenRequest)
    
    return NextResponse.json({
      success: true,
      link_token: response.data.link_token,
      expiration: response.data.expiration
    })

  } catch (error: any) {
    console.error('Error creating Plaid link token:', error)
    return NextResponse.json(
      { error: 'Failed to create link token', details: error.message },
      { status: 500 }
    )
  }
}
