import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const base = new URL(request.url).origin

    // Stripe
    const stripeRes = await fetch(`${base}/api/stripe/sync?days=7`, { method: 'POST' })
    if (!stripeRes.ok) throw new Error('Stripe sync failed')

    // Plaid transactions
    const plaidRes = await fetch(`${base}/api/plaid/transactions?days=30`, { method: 'POST' })
    if (!plaidRes.ok) throw new Error('Plaid sync failed')

    // Matching
    const matchRes = await fetch(`${base}/api/match/payouts-bank`, { method: 'POST' })
    if (!matchRes.ok) throw new Error('Matching failed')

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ ok: false, error: e instanceof Error ? e.message : 'Unknown error' }, { status: 500 })
  }
}
