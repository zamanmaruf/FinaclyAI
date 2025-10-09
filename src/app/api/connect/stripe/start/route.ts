import { NextResponse } from 'next/server'
import { env, isProductionMode } from '@/env'

/**
 * POST /api/connect/stripe/start
 * 
 * Generates Stripe Connect OAuth URL for production mode.
 * In internal mode, returns a message to use the paste-key flow instead.
 */
export async function POST() {
  try {
    // Check if Stripe Connect is configured
    if (!env.STRIPE_CONNECT_CLIENT_ID) {
      if (isProductionMode()) {
        return NextResponse.json(
          { 
            error: 'Stripe Connect OAuth is not configured. Please set STRIPE_CONNECT_CLIENT_ID.',
            mode: 'production',
            fallback: 'internal'
          },
          { status: 503 }
        )
      } else {
        // In internal mode, user can use paste-key flow
        return NextResponse.json(
          {
            error: 'Stripe Connect OAuth not configured. Use the paste-key flow in internal mode.',
            mode: 'internal',
            usePasteKey: true
          },
          { status: 200 }
        )
      }
    }
    
    // Generate OAuth URL
    const redirectUri = `${env.NEXT_PUBLIC_APP_URL}/api/connect/stripe/callback`
    const state = generateRandomState()
    
    // Build Stripe Connect OAuth URL
    const params = new URLSearchParams({
      client_id: env.STRIPE_CONNECT_CLIENT_ID,
      state: state,
      scope: 'read_write', // Standard scope for reading payouts, charges, balance transactions
      redirect_uri: redirectUri,
      response_type: 'code',
    })
    
    const oauthUrl = `https://connect.stripe.com/oauth/authorize?${params.toString()}`
    
    console.log('[stripe-connect] Generated OAuth URL')
    
    return NextResponse.json({ url: oauthUrl, state })
  } catch (error) {
    console.error('[stripe-connect] Error generating OAuth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate Stripe Connect URL' },
      { status: 500 }
    )
  }
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + 
         Math.random().toString(36).substring(2, 15)
}

