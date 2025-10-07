import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/env';
import { getStripeClient } from '@/server/stripeClient';
import { logger } from '@/server/logger';

export async function POST(request: NextRequest) {
  // Forbid in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Seed payout not available in production' },
      { status: 403 }
    );
  }

  // Require admin token
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.replace('Bearer ', '');
  
  if (!env.SHARED_ADMIN_TOKEN || token !== env.SHARED_ADMIN_TOKEN) {
    return NextResponse.json(
      { error: 'UNAUTHORIZED', message: 'Invalid or missing SHARED_ADMIN_TOKEN' },
      { status: 401 }
    );
  }

  try {
    const stripe = getStripeClient();

    // Check if we're in test mode
    const secretKey = env.STRIPE_SECRET_KEY;
    if (!secretKey.startsWith('sk_test_')) {
      return NextResponse.json(
        { error: 'INVALID_MODE', message: 'Seed payout only works with test mode keys (sk_test_)' },
        { status: 400 }
      );
    }

    logger.info('Creating test payout via Stripe API');

    // In Stripe test mode, we can create a test payout
    // First, check balance
    const balance = await stripe.balance.retrieve();
    const availableBalance = balance.available.find(b => b.currency === 'usd');

    if (!availableBalance || availableBalance.amount < 1000) {
      return NextResponse.json({
        error: 'INSUFFICIENT_BALANCE',
        message: 'Test account has insufficient available balance. Create test charges first or use Stripe CLI: stripe trigger payout.created',
        tip: 'Run: stripe trigger payout.created',
        availableBalance: availableBalance?.amount || 0,
      }, { status: 400 });
    }

    // Create a test payout (minimum $10.00 = 1000 cents)
    const payout = await stripe.payouts.create({
      amount: 1000,
      currency: 'usd',
      description: 'FinaclyAI Test Payout',
      statement_descriptor: 'FINACLY TEST',
    });

    logger.info('Test payout created', {
      payoutId: payout.id,
      amount: payout.amount,
      currency: payout.currency,
    });

    return NextResponse.json({
      ok: true,
      payout: {
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        status: payout.status,
        arrival_date: payout.arrival_date,
      },
      message: 'Test payout created successfully. Run /api/stripe/sync to pull it into the database.',
    });
  } catch (error: any) {
    logger.error('Stripe seed payout failed', { error });

    const errorMessage = error.message || 'Unknown error';
    const errorCode = error.code || 'STRIPE_ERROR';

    // Provide helpful tips based on error
    if (errorMessage.includes('balance') || errorMessage.includes('insufficient')) {
      return NextResponse.json({
        error: errorCode,
        message: 'Insufficient balance. Create test charges first or use Stripe CLI.',
        tip: 'Run: stripe trigger payout.created',
      }, { status: 400 });
    }

    if (errorMessage.includes('payout') && errorMessage.includes('not') && errorMessage.includes('enabled')) {
      return NextResponse.json({
        error: errorCode,
        message: 'Payouts not enabled on this test account. Use Stripe CLI instead.',
        tip: 'Run: stripe trigger payout.created',
      }, { status: 400 });
    }

    return NextResponse.json({
      error: errorCode,
      message: errorMessage,
      tip: 'If payouts cannot be created, use Stripe CLI: stripe trigger payout.created',
    }, { status: 500 });
  }
}
