#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface VerifyAllResult {
  env: 'PASS' | 'FAIL'
  db: 'PASS' | 'FAIL'
  stripe: {
    status: 'PASS' | 'FAIL'
    charges: number
    payouts: number
    balanceTxs: number
    exceptions: number
    secondRunDelta: number
  }
  plaid: {
    status: 'PASS' | 'FAIL'
    firstRunInserted: number
    secondRunDelta: number
  }
  matching: {
    status: 'PASS' | 'WARN' | 'FAIL'
    matched: number
    exceptions: number
  }
  qbo: {
    status: 'PASS' | 'WARN' | 'FAIL'
    hasToken: boolean
  }
  app: {
    landing200: boolean
    healthOk: boolean
  }
}

async function main() {
  const result: VerifyAllResult = {
    env: 'FAIL',
    db: 'FAIL',
    stripe: { status: 'FAIL', charges: 0, payouts: 0, balanceTxs: 0, exceptions: 0, secondRunDelta: 0 },
    plaid: { status: 'FAIL', firstRunInserted: 0, secondRunDelta: 0 },
    matching: { status: 'FAIL', matched: 0, exceptions: 0 },
    qbo: { status: 'WARN', hasToken: false },
    app: { landing200: false, healthOk: false },
  }

  try {
    // Env
    if (
      process.env.DATABASE_URL &&
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.QBO_CLIENT_ID &&
      process.env.QBO_CLIENT_SECRET &&
      process.env.QBO_REDIRECT_URI &&
      process.env.INTUIT_ENV === 'development' &&
      process.env.PLAID_CLIENT_ID &&
      process.env.PLAID_SECRET &&
      process.env.PLAID_ENV === 'sandbox' &&
      process.env.NEXT_PUBLIC_APP_URL
    ) {
      result.env = 'PASS'
    }

    // DB
    await prisma.$connect()
    await prisma.$queryRaw`SELECT 1`
    result.db = 'PASS'

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    // Stripe sync x2
    const syncStripe = async () => {
      const res = await fetch(`${baseUrl}/api/stripe/sync?days=7`, { method: 'POST' })
      if (!res.ok) throw new Error(`Stripe sync failed: ${res.status}`)
      return res.json()
    }
    const firstStripe = await syncStripe()
    result.stripe.charges = firstStripe.charges ?? 0
    result.stripe.payouts = firstStripe.payouts ?? 0
    result.stripe.balanceTxs = firstStripe.balanceTxs ?? 0
    result.stripe.exceptions = firstStripe.exceptions ?? 0

    const secondStripe = await syncStripe()
    // consider delta as sum of fields change; ideally zero
    const delta =
      (secondStripe.charges ?? 0) - result.stripe.charges +
      (secondStripe.payouts ?? 0) - result.stripe.payouts +
      ((secondStripe.balanceTxs ?? 0) - result.stripe.balanceTxs)
    result.stripe.secondRunDelta = delta
    result.stripe.status = 'PASS'

    // Plaid: ensure item + sync x2
    const resItem = await fetch(`${baseUrl}/api/plaid/sandbox-link`, { method: 'POST' })
    if (!resItem.ok) throw new Error('Plaid sandbox-link failed')
    const resSync1 = await fetch(`${baseUrl}/api/plaid/transactions?days=30`, { method: 'POST' })
    if (!resSync1.ok) throw new Error('Plaid transactions first run failed')
    const json1 = await resSync1.json()
    const firstInserted = (json1?.totals?.inserted ?? 0) + (json1?.totals?.updated ?? 0)
    result.plaid.firstRunInserted = firstInserted

    const resSync2 = await fetch(`${baseUrl}/api/plaid/transactions?days=30`, { method: 'POST' })
    if (!resSync2.ok) throw new Error('Plaid transactions second run failed')
    const json2 = await resSync2.json()
    const secondInserted = (json2?.totals?.inserted ?? 0) + (json2?.totals?.updated ?? 0)
    result.plaid.secondRunDelta = secondInserted
    result.plaid.status = 'PASS'

    // Matching
    const resMatch = await fetch(`${baseUrl}/api/match/payouts-bank`, { method: 'POST' })
    if (resMatch.ok) {
      const m = await resMatch.json()
      result.matching.matched = m?.matched ?? 0
      result.matching.exceptions = m?.exceptions ?? 0
      result.matching.status = 'PASS'
    } else {
      result.matching.status = 'WARN'
    }

    // QBO ping & token presence
    const tokenCount = await prisma.qboToken.count()
    result.qbo.hasToken = tokenCount > 0
    try {
      const ping = await fetch(`${baseUrl}/api/qbo/ping`)
      result.qbo.status = ping.ok ? 'PASS' : (result.qbo.hasToken ? 'FAIL' : 'WARN')
    } catch {
      result.qbo.status = result.qbo.hasToken ? 'FAIL' : 'WARN'
    }

    // Landing 200
    try {
      const landing = await fetch(`${baseUrl}`)
      result.app.landing200 = landing.ok
    } catch {
      result.app.landing200 = false
    }

    // Health
    try {
      const health = await fetch(`${baseUrl}/api/health`)
      const j = health.ok ? await health.json() : null
      result.app.healthOk = !!(j && j.ok === true && j.db === 'up')
    } catch {
      result.app.healthOk = false
    }

  } catch (error) {
    console.error('verify-all failed:', error)
  } finally {
    await prisma.$disconnect()
  }

  console.log(JSON.stringify(result, null, 2))

  const criticalFail = !(result.env === 'PASS' && result.db === 'PASS')
    || result.stripe.status !== 'PASS'
    || result.plaid.status !== 'PASS'

  if (criticalFail) process.exit(1)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
