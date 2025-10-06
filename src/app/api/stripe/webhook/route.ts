import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/server/stripeClient'
import { env } from '@/env'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      env.STRIPE_WEBHOOK_SECRET
    )

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        console.log('PaymentIntent succeeded:', event.data.object)
        break
      case 'payout.paid':
        console.log('Payout paid:', event.data.object)
        break
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook signature verification failed:', error)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
}
