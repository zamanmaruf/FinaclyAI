import { NextRequest, NextResponse } from 'next/server'
import { PlaidApi, Configuration, PlaidEnvironments, ItemPublicTokenExchangeRequest } from 'plaid'
import { query } from '@/lib/db'
import { encrypt } from '@/lib/encryption'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { publicToken, companyId } = body

    if (!publicToken || !companyId) {
      return NextResponse.json(
        { error: 'Public token and company ID are required' },
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

    // Exchange public token for access token
    const exchangeRequest: ItemPublicTokenExchangeRequest = {
      public_token: publicToken,
    }

    const response = await client.itemPublicTokenExchange(exchangeRequest)
    const accessToken = response.data.access_token
    const itemId = response.data.item_id

    // Get account information
    const accountsResponse = await client.accountsGet({
      access_token: accessToken,
    })

    // Encrypt the access token before storing
    const encryptedAccessToken = encrypt(accessToken)

    // Store credentials in database
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
      'plaid',
      JSON.stringify({
        access_token: encryptedAccessToken,
        item_id: itemId,
        accounts: accountsResponse.data.accounts,
        institution_id: accountsResponse.data.item?.institution_id,
        connected_at: new Date().toISOString()
      })
    ])

    return NextResponse.json({
      success: true,
      message: 'Plaid connection established successfully',
      accounts: accountsResponse.data.accounts.map(account => ({
        account_id: account.account_id,
        name: account.name,
        type: account.type,
        subtype: account.subtype,
        mask: account.mask
      }))
    })

  } catch (error: any) {
    console.error('Error exchanging Plaid token:', error)
    return NextResponse.json(
      { error: 'Failed to exchange token', details: error.message },
      { status: 500 }
    )
  }
}
