import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const base = new URL(request.url).origin

    // Stripe sync
    const stripeRes = await fetch(`${base}/api/stripe/sync?days=7`, { method: 'POST' })
    if (!stripeRes.ok) throw new Error('Stripe sync failed')
    const stripeData = await stripeRes.json()

    // Plaid transactions
    const plaidRes = await fetch(`${base}/api/plaid/transactions?days=30`, { method: 'POST' })
    if (!plaidRes.ok) throw new Error('Plaid sync failed')
    const plaidData = await plaidRes.json()

    // Matching
    const matchRes = await fetch(`${base}/api/match/payouts-bank`, { method: 'POST' })
    if (!matchRes.ok) throw new Error('Matching failed')
    const matchData = await matchRes.json()

    return NextResponse.json({ 
      ok: true,
      stripe: {
        charges: stripeData.charges || 0,
        payouts: stripeData.payouts || 0,
        balanceTxs: stripeData.balanceTxs || 0,
      },
      plaid: {
        transactions: plaidData.totals?.inserted || plaidData.totals?.totalTransactions || 0,
      },
      matching: {
        matched: matchData.matchedCount || 0,
        exceptions: matchData.exceptionsCreated || 0,
      }
    })
  } catch (e) {
    return NextResponse.json({ 
      ok: false, 
      error: e instanceof Error ? e.message : 'Unknown error' 
    }, { status: 500 })
  }
}
