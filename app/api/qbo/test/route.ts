import { NextRequest, NextResponse } from 'next/server'
import OAuthClient from 'intuit-oauth'

export async function GET(request: NextRequest) {
  try {
    // Initialize OAuth client
    const oauthClient = new OAuthClient({
      clientId: process.env.QBO_CLIENT_ID!,
      clientSecret: process.env.QBO_CLIENT_SECRET!,
      environment: process.env.INTUIT_ENV as 'sandbox' | 'production' || 'sandbox',
      redirectUri: process.env.QBO_REDIRECT_URI!
    })

    // Generate authorization URL
    const authUri = oauthClient.authorizeUri({
      scope: [OAuthClient.scopes.Accounting],
      state: '1' // Test company ID
    })

    return NextResponse.json({
      success: true,
      authUrl: authUri,
      config: {
        clientId: process.env.QBO_CLIENT_ID,
        environment: process.env.INTUIT_ENV,
        redirectUri: process.env.QBO_REDIRECT_URI
      }
    })

  } catch (error: any) {
    console.error('Error in QuickBooks test:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error.message },
      { status: 500 }
    )
  }
}
