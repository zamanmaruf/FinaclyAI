import { NextRequest, NextResponse } from 'next/server'

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