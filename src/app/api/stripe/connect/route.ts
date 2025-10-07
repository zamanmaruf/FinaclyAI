import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { secretKey } = body

    if (!secretKey || !secretKey.startsWith('sk_')) {
      return NextResponse.json(
        { error: 'Invalid Stripe secret key format' },
        { status: 400 }
      )
    }

    // Test the Stripe key by making a simple API call
    const stripe = new Stripe(secretKey, {
      apiVersion: '2023-10-16',
    })

    // Fetch account to verify the key works
    const account = await stripe.accounts.retrieve()

    // In a real app, you'd store this key securely in the database
    // For now, just verify it works
    return NextResponse.json({
      ok: true,
      message: 'Stripe connected successfully',
      accountId: account.id,
      email: account.email,
      country: account.country,
      currency: account.default_currency
    })
  } catch (error: any) {
    console.error('Stripe connection error:', error)
    
    if (error.type === 'StripeAuthenticationError') {
      return NextResponse.json(
        { error: 'Invalid Stripe API key' },
        { status: 401 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to connect to Stripe: ' + error.message },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    // This would normally redirect to Stripe OAuth
    // For now, just return a message
    return NextResponse.json({ 
      message: 'Stripe OAuth not implemented yet',
      redirectUrl: 'https://connect.stripe.com/oauth/authorize?response_type=code&client_id=YOUR_CLIENT_ID&scope=read_write'
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to initiate Stripe connection' },
      { status: 500 }
    )
  }
}