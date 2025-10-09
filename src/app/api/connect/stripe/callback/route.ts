import { NextRequest, NextResponse } from 'next/server'
import { env } from '@/env'
import { db } from '@/server/db'
import { encrypt } from '@/server/crypto'
import Stripe from 'stripe'

/**
 * GET /api/connect/stripe/callback
 * 
 * Handles Stripe Connect OAuth callback.
 * Exchanges authorization code for access token and stores encrypted tokens in DB.
 * Redirects to /connect?stripe=success on success.
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')
  const error = searchParams.get('error')
  const errorDescription = searchParams.get('error_description')
  
  // Handle OAuth errors
  if (error) {
    console.error('[stripe-connect] OAuth error:', error, errorDescription)
    return NextResponse.redirect(
      new URL(`/connect?stripe=error&message=${encodeURIComponent(errorDescription || error)}`, env.NEXT_PUBLIC_APP_URL)
    )
  }
  
  if (!code) {
    console.error('[stripe-connect] No authorization code received')
    return NextResponse.redirect(
      new URL('/connect?stripe=error&message=No+authorization+code+received', env.NEXT_PUBLIC_APP_URL)
    )
  }
  
  try {
    // Exchange code for access token
    const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2024-11-20.acacia' })
    
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: code,
    })
    
    const {
      access_token,
      refresh_token,
      stripe_user_id,
      livemode,
      scope,
      stripe_publishable_key,
    } = response
    
    if (!access_token || !stripe_user_id) {
      throw new Error('Invalid OAuth response from Stripe')
    }
    
    // Encrypt tokens before storing
    const accessTokenEncrypted = encrypt(access_token)
    const refreshTokenEncrypted = refresh_token ? encrypt(refresh_token) : null
    
    // Use hardcoded owner ID for single-tenant mode (can be updated for multi-tenant later)
    const ownerId = '1'
    
    // Store connection in database (idempotent upsert)
    await db.stripeConnect.upsert({
      where: {
        ownerId_accountId: {
          ownerId,
          accountId: stripe_user_id,
        },
      },
      create: {
        ownerId,
        accountId: stripe_user_id,
        accessTokenEncrypted,
        refreshTokenEncrypted,
        publishableKey: stripe_publishable_key || null,
        livemode: livemode || false,
        scope: scope || null,
      },
      update: {
        accessTokenEncrypted,
        refreshTokenEncrypted,
        publishableKey: stripe_publishable_key || null,
        livemode: livemode || false,
        scope: scope || null,
        updatedAt: new Date(),
      },
    })
    
    console.log('[stripe-connect] ✅ Connected account:', stripe_user_id, 'livemode:', livemode)
    
    return NextResponse.redirect(
      new URL('/connect?stripe=success', env.NEXT_PUBLIC_APP_URL)
    )
  } catch (error: any) {
    console.error('[stripe-connect] Error exchanging code:', error)
    const message = error.message || 'Failed to connect Stripe account'
    return NextResponse.redirect(
      new URL(`/connect?stripe=error&message=${encodeURIComponent(message)}`, env.NEXT_PUBLIC_APP_URL)
    )
  }
}

