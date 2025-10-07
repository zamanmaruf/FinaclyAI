import { NextRequest, NextResponse } from 'next/server';
import { stripeClient } from '@/server/stripeClient';
import { env } from '@/src/env';

export async function POST(request: NextRequest) {
  try {
    // Only allow in non-production environments
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { ok: false, message: 'Payout seeding not available in production' },
        { status: 403 }
      );
    }

    // Only allow with test Stripe keys
    if (!env.STRIPE_SECRET_KEY.startsWith('sk_test_')) {
      return NextResponse.json(
        { ok: false, message: 'Payout seeding only available with Stripe test keys' },
        { status: 403 }
      );
    }

    // Check if we have any existing payouts first
    const existingPayouts = await stripeClient.payouts.list({
      limit: 1,
    });

    // If we already have payouts, don't create more
    if (existingPayouts.data.length > 0) {
      return NextResponse.json(
        { ok: false, message: 'Test payouts already exist. Use existing payouts for testing.' },
        { status: 409 }
      );
    }

    // Check if we have a balance to payout from
    const balance = await stripeClient.balance.retrieve();
    const availableBalance = balance.available[0]; // First currency
    
    if (!availableBalance || availableBalance.amount === 0) {
      return NextResponse.json(
        { 
          ok: false, 
          message: 'No available balance for payout. Use Stripe CLI to create test charges first: stripe trigger payment_intent.succeeded' 
        },
        { status: 400 }
      );
    }

    // Create a test payout with a small amount
    const payoutAmount = Math.min(100, availableBalance.amount); // $1.00 or less

    const payout = await stripeClient.payouts.create({
      amount: payoutAmount,
      currency: availableBalance.currency,
      description: 'Test payout for FinaclyAI matching verification',
    });

    console.log('✅ Created test payout:', payout.id);

    return NextResponse.json({
      ok: true,
      payoutId: payout.id,
      amount: payoutAmount,
      currency: payout.currency,
    });

  } catch (error: any) {
    console.error('Stripe payout seeding error:', error.message);
    
    // Handle specific Stripe errors
    if (error.code === 'balance_insufficient') {
      return NextResponse.json(
        { 
          ok: false, 
          message: 'Insufficient balance for payout. Use Stripe CLI to create test charges: stripe trigger payment_intent.succeeded' 
        },
        { status: 400 }
      );
    }

    if (error.code === 'invalid_request_error') {
      return NextResponse.json(
        { 
          ok: false, 
          message: 'Invalid payout request. Check Stripe account configuration.' 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        ok: false, 
        message: `Failed to create test payout: ${error.message}` 
      },
      { status: 500 }
    );
  }
}
