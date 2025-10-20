import { NextRequest, NextResponse } from 'next/server'
import OAuthClient from 'intuit-oauth'

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
      state: companyId // Pass company ID in state for callback
    })

    return NextResponse.json({
      success: true,
      authUrl: authUri
    })

  } catch (error) {
    console.error('Error generating QuickBooks auth URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
