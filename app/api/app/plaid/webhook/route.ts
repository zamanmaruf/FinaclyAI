import { NextRequest, NextResponse } from 'next/server'
import { query } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Handle different webhook event types
    switch (body.webhook_type) {
      case 'TRANSACTIONS':
        if (body.webhook_code === 'INITIAL_UPDATE' || body.webhook_code === 'HISTORICAL_UPDATE') {
          console.log('Plaid webhook: New transactions available for sync')
          // In a production app, you might want to queue a background job here
          // to sync transactions for the affected item
        }
        break
        
      case 'ITEM':
        if (body.webhook_code === 'ERROR') {
          console.error('Plaid webhook: Item error', body.error)
          // Handle item errors (e.g., credentials expired)
        } else if (body.webhook_code === 'NEW_ACCOUNTS_AVAILABLE') {
          console.log('Plaid webhook: New accounts available')
          // Handle new accounts being added
        }
        break
        
      default:
        console.log('Unhandled Plaid webhook type:', body.webhook_type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Error processing Plaid webhook:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
