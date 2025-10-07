import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/server/stripeClient'
import { env } from '@/env'

/**
 * Stripe webhook handler with signature verification
 * SECURITY: Rejects unsigned requests, never logs raw payloads
 */
export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    console.warn('Stripe webhook rejected: missing signature')
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  const webhookSecret = env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error('FATAL: STRIPE_WEBHOOK_SECRET not configured')
    return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    // Log event type only, never log sensitive payload
    console.log(`Stripe webhook received: ${event.type} [id: ${event.id}]`)

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Trigger charge sync or handle in real-time
        console.log(`PaymentIntent succeeded: ${event.data.object.id}`)
        break
      
      case 'payout.paid':
      case 'payout.failed':
        // Trigger payout sync
        console.log(`Payout ${event.type}: ${event.data.object.id}`)
        break
      
      case 'charge.succeeded':
      case 'charge.failed':
        // Optionally sync individual charge
        console.log(`Charge ${event.type}: ${event.data.object.id}`)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true, eventId: event.id })
  } catch (error) {
    // NEVER log the error object (might contain raw payload)
    console.error('Stripe webhook signature verification failed')
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }
}
