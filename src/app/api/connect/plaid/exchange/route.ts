import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { db } from '@/server/db'
import { encrypt } from '@/server/crypto'
import { Configuration, PlaidApi, PlaidEnvironments } from 'plaid'

/**
 * POST /api/connect/plaid/exchange
 * 
 * Exchanges Plaid public token for access token and item ID.
 * Encrypts and stores access token, fetches and stores accounts.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { publicToken } = body
    
    if (!publicToken) {
      return NextResponse.json(
        { error: 'publicToken is required' },
        { status: 400 }
      )
    }
    
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
    
    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    })
    
    const accessToken = exchangeResponse.data.access_token
    const itemId = exchangeResponse.data.item_id
    
    if (!accessToken || !itemId) {
      throw new Error('Invalid token exchange response from Plaid')
    }
    
    // Get institution info
    const itemResponse = await plaidClient.itemGet({
      access_token: accessToken,
    })
    
    const institutionId = itemResponse.data.item.institution_id
    let institutionName = 'Unknown Bank'
    
    if (institutionId) {
      try {
        const instResponse = await plaidClient.institutionsGetById({
          institution_id: institutionId,
          country_codes: env.PLAID_COUNTRY_CODES.split(',').map(c => c.trim() as any),
        })
        institutionName = instResponse.data.institution.name
      } catch (error) {
        console.warn('[plaid-exchange] Could not fetch institution name:', error)
      }
    }
    
    // Encrypt access token
    const accessTokenEncrypted = encrypt(accessToken)
    
    // Use hardcoded owner ID for single-tenant mode
    const ownerId = '1'
    
    // Store bank item (idempotent upsert by itemId)
    const bankItem = await db.bankItem.upsert({
      where: { itemId },
      create: {
        itemId,
        institutionName,
        accessToken, // Keep plaintext for backward compatibility (deprecated)
        accessTokenEncrypted,
        ownerId,
      },
      update: {
        institutionName,
        accessToken, // Update plaintext too (deprecated)
        accessTokenEncrypted,
        updatedAt: new Date(),
      },
    })
    
    // Fetch and store accounts
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    })
    
    const accounts = accountsResponse.data.accounts
    
    for (const account of accounts) {
      await db.bankAccount.upsert({
        where: { plaidAccountId: account.account_id },
        create: {
          bankItemId: bankItem.id,
          plaidAccountId: account.account_id,
          name: account.name,
          officialName: account.official_name || null,
          mask: account.mask || null,
          subtype: account.subtype || null,
          type: account.type,
          currency: account.balances.iso_currency_code || 'USD',
        },
        update: {
          name: account.name,
          officialName: account.official_name || null,
          mask: account.mask || null,
          subtype: account.subtype || null,
          type: account.type,
          currency: account.balances.iso_currency_code || 'USD',
          updatedAt: new Date(),
        },
      })
    }
    
    console.log('[plaid-exchange] ✅ Connected bank:', institutionName, 'with', accounts.length, 'account(s)')
    
    return NextResponse.json({
      success: true,
      itemId,
      institutionName,
      accountsCount: accounts.length,
    })
  } catch (error: any) {
    console.error('[plaid-exchange] Error exchanging token:', error.response?.data || error.message)
    
    return NextResponse.json(
      { 
        error: 'Failed to exchange Plaid token',
        details: error.response?.data?.error_message || error.message,
      },
      { status: 500 }
    )
  }
}

