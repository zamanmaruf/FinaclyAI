import { NextRequest, NextResponse } from 'next/server'
import OAuthClient from 'intuit-oauth'
import { query } from '@/lib/db'
import { encrypt } from '@/lib/encryption'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // This contains the company ID
    const realmId = searchParams.get('realmId')

    console.log('QuickBooks callback received:', { code: code?.substring(0, 10) + '...', state, realmId })

    if (!code || !state || !realmId) {
      console.error('Missing required parameters:', { code: !!code, state: !!state, realmId: !!realmId })
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    const companyId = parseInt(state)

    // Initialize OAuth client
    const oauthClient = new OAuthClient({
      clientId: process.env.QBO_CLIENT_ID!,
      clientSecret: process.env.QBO_CLIENT_SECRET!,
      environment: process.env.INTUIT_ENV as 'sandbox' | 'production' || 'sandbox',
      redirectUri: process.env.QBO_REDIRECT_URI!
    })

    console.log('OAuth client initialized with redirect URI:', process.env.QBO_REDIRECT_URI)

    // Exchange authorization code for tokens
    console.log('Attempting token exchange...')
    const authResponse = await oauthClient.createToken(request.url)
    console.log('Token exchange response:', {
      hasToken: !!authResponse.token,
      tokenType: authResponse.token?.token_type,
      hasAccessToken: !!authResponse.token?.access_token,
      hasRefreshToken: !!authResponse.token?.refresh_token,
      expiresIn: authResponse.token?.expires_in
    })
    
    if (authResponse.token) {
      // Encrypt the tokens before storing
      const tokenData = {
        access_token: authResponse.token.access_token,
        refresh_token: authResponse.token.refresh_token,
        token_type: authResponse.token.token_type,
        expires_in: authResponse.token.expires_in,
        x_refresh_token_expires_in: authResponse.token.x_refresh_token_expires_in
      }

      const encryptedTokens = encrypt(JSON.stringify(tokenData))

      // Store encrypted credentials in database
      await query(`
        INSERT INTO api_credentials (company_id, service, encrypted_credentials, expires_at, is_active)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (company_id, service) 
        DO UPDATE SET 
          encrypted_credentials = EXCLUDED.encrypted_credentials,
          expires_at = EXCLUDED.expires_at,
          is_active = true,
          updated_at = CURRENT_TIMESTAMP
      `, [
        companyId,
        'quickbooks',
        JSON.stringify({
          tokens: encryptedTokens,
          realm_id: realmId,
          connected_at: new Date().toISOString()
        }),
        new Date(Date.now() + (authResponse.token.expires_in * 1000)) // Convert seconds to milliseconds
      ])

      // Redirect to the app dashboard
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/app/dashboard?quickbooks=connected`)
    } else {
      console.error('No token received from QuickBooks:', {
        authResponse: authResponse,
        response: authResponse.response,
        body: authResponse.body,
        json: authResponse.json
      })
      return NextResponse.json(
        { error: 'Failed to obtain access token', details: authResponse.response || 'No response from QuickBooks' },
        { status: 400 }
      )
    }

  } catch (error: any) {
    console.error('Error in QuickBooks callback:', error)
    console.error('Error details:', {
      message: error.message,
      authResponse: error.authResponse,
      originalMessage: error.originalMessage,
      errorDescription: error.error_description
    })
    return NextResponse.json(
      { error: 'OAuth callback failed', details: error.message },
      { status: 500 }
    )
  }
}
