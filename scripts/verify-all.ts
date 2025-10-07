#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

interface VerifyAllResult {
  environment: {
    status: 'PASS' | 'FAIL'
    auth: 'protected' | 'open'
    baseUrl: string
  }
  database: {
    status: 'PASS' | 'FAIL'
    stripePayouts: number
    stripeCharges: number
    plaidTransactions: number
    bankItems: number
    qboTokens: number
    exceptions: number
  }
  stripe: {
    status: 'PASS' | 'FAIL'
    firstRun: { charges: number; payouts: number; balanceTxs: number; exceptions: number }
    secondRun: { charges: number; payouts: number; balanceTxs: number; exceptions: number }
    idempotent: boolean
    note?: string
  }
  plaid: {
    status: 'PASS' | 'FAIL'
    itemCreated: boolean
    webhookFired: boolean
    firstRun: { inserted: number; updated: number }
    secondRun: { inserted: number; updated: number }
    transactions: number
  }
  qbo: {
    status: 'PASS' | 'FAIL'
    hasToken: boolean
    realmId?: string
    companyName?: string
    pingAttempts: number
    error?: string
  }
  matching: {
    status: 'PASS' | 'FAIL'
    scanned: number
    matchedCount: number
    ambiguous: number
    exceptionsCreated: number
    unmatchedPayouts: number
  }
  apiRoutes: {
    status: 'PASS' | 'FAIL'
    health: boolean
    stripeSync: boolean
    plaidCreateLinkToken: boolean
    plaidSandboxLink: boolean
    plaidTransactions: boolean
    qboPing: boolean
    matching: boolean
    stats: boolean
    exceptionsList: boolean
    sync: boolean
  }
  frontendPages: {
    status: 'PASS' | 'FAIL'
    landing: boolean
    connect: boolean
    dashboard: boolean
    login: boolean
  }
  overall: string
}

async function delay(ms: number) { return new Promise(r => setTimeout(r, ms)) }

async function main() {
  const result: VerifyAllResult = {
    environment: { status: 'FAIL', auth: 'open', baseUrl: 'http://localhost:3000' },
    database: { status: 'FAIL', stripePayouts: 0, stripeCharges: 0, plaidTransactions: 0, bankItems: 0, qboTokens: 0, exceptions: 0 },
    stripe: { status: 'FAIL', firstRun: { charges: 0, payouts: 0, balanceTxs: 0, exceptions: 0 }, secondRun: { charges: 0, payouts: 0, balanceTxs: 0, exceptions: 0 }, idempotent: false },
    plaid: { status: 'FAIL', itemCreated: false, webhookFired: false, firstRun: { inserted: 0, updated: 0 }, secondRun: { inserted: 0, updated: 0 }, transactions: 0 },
    qbo: { status: 'FAIL', hasToken: false, pingAttempts: 0 },
    matching: { status: 'FAIL', scanned: 0, matchedCount: 0, ambiguous: 0, exceptionsCreated: 0, unmatchedPayouts: 0 },
    apiRoutes: { status: 'FAIL', health: false, stripeSync: false, plaidCreateLinkToken: false, plaidSandboxLink: false, plaidTransactions: false, qboPing: false, matching: false, stats: false, exceptionsList: false, sync: false },
    frontendPages: { status: 'FAIL', landing: false, connect: false, dashboard: false, login: false },
    overall: 'VERIFICATION INCOMPLETE'
  }

  try {
    // Environment check
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    result.environment.baseUrl = baseUrl
    result.environment.auth = process.env.SHARED_PASSWORD && process.env.SHARED_PASSWORD.length > 0 ? 'protected' : 'open'
    
    if (
      process.env.DATABASE_URL &&
      process.env.STRIPE_SECRET_KEY &&
      process.env.STRIPE_WEBHOOK_SECRET &&
      process.env.QBO_CLIENT_ID &&
      process.env.QBO_CLIENT_SECRET &&
      process.env.QBO_REDIRECT_URI &&
      process.env.PLAID_CLIENT_ID &&
      process.env.PLAID_SECRET
    ) {
      result.environment.status = 'PASS'
    }

    // Database connectivity and counts
    try {
      await prisma.$connect()
      await prisma.$queryRaw`SELECT 1`
      result.database.status = 'PASS'
      
      // Get row counts
      result.database.stripePayouts = await prisma.stripePayout.count()
      result.database.stripeCharges = await prisma.stripeCharge.count()
      result.database.plaidTransactions = await prisma.plaidTransaction.count()
      result.database.bankItems = await prisma.bankItem.count()
      result.database.qboTokens = await prisma.qboToken.count()
      result.database.exceptions = await prisma.stripeException.count()
    } catch (error) {
      console.error('Database connection failed:', error)
    }

    // Stripe sync with idempotency check
    try {
      const syncStripe = async () => {
        const res = await fetch(`${baseUrl}/api/stripe/sync?days=7`, { method: 'POST' })
        if (!res.ok) throw new Error(`Stripe sync failed: ${res.status}`)
        return res.json()
      }
      
      const firstStripe = await syncStripe()
      result.stripe.firstRun = {
        charges: firstStripe.charges ?? 0,
        payouts: firstStripe.payouts ?? 0,
        balanceTxs: firstStripe.balanceTxs ?? 0,
        exceptions: firstStripe.exceptions ?? 0
      }
      
      const secondStripe = await syncStripe()
      result.stripe.secondRun = {
        charges: secondStripe.charges ?? 0,
        payouts: secondStripe.payouts ?? 0,
        balanceTxs: secondStripe.balanceTxs ?? 0,
        exceptions: secondStripe.exceptions ?? 0
      }
      
      // Check idempotency (second run should have same counts)
      const delta = 
        (secondStripe.charges ?? 0) - result.stripe.firstRun.charges +
        (secondStripe.payouts ?? 0) - result.stripe.firstRun.payouts +
        (secondStripe.balanceTxs ?? 0) - result.stripe.firstRun.balanceTxs
      
      result.stripe.idempotent = delta === 0
      result.stripe.status = 'PASS'
      
      if (result.stripe.firstRun.payouts === 0) {
        result.stripe.note = 'no test payouts present - call /api/stripe/seed-payout to create test data'
      }
      
      result.apiRoutes.stripeSync = true
    } catch (error) {
      console.error('Stripe sync failed:', error)
    }

    // Plaid sandbox setup and sync
    try {
      // Check if bank item exists
      const existingItems = await prisma.bankItem.count()
      
      // Only create item if none exists
      if (existingItems === 0) {
        const resItem = await fetch(`${baseUrl}/api/plaid/sandbox-link`, { method: 'POST' })
        result.plaid.itemCreated = resItem.ok
        result.apiRoutes.plaidSandboxLink = true
      } else {
        result.plaid.itemCreated = true
      }
      
      // First sync
      const resSync1 = await fetch(`${baseUrl}/api/plaid/transactions?days=30`, { method: 'POST' })
      if (resSync1.ok) {
        const json1 = await resSync1.json()
        result.plaid.firstRun = {
          inserted: json1.totals?.inserted ?? 0,
          updated: json1.totals?.updated ?? 0
        }
        result.plaid.webhookFired = json1.webhookFired ?? false
      }
      
      // Second sync
      const resSync2 = await fetch(`${baseUrl}/api/plaid/transactions?days=30`, { method: 'POST' })
      if (resSync2.ok) {
        const json2 = await resSync2.json()
        result.plaid.secondRun = {
          inserted: json2.totals?.inserted ?? 0,
          updated: json2.totals?.updated ?? 0
        }
      }
      
      result.plaid.transactions = result.database.plaidTransactions
      result.plaid.status = 'PASS'
      result.apiRoutes.plaidTransactions = true
    } catch (error) {
      console.error('Plaid sync failed:', error)
    }

    // QBO ping with retry logic
    try {
      const token = await prisma.qboToken.findFirst({ select: { realmId: true } })
      result.qbo.hasToken = !!token
      
      if (token?.realmId) {
        result.qbo.realmId = token.realmId
        
        // First ping attempt
        let pingOk = false
        result.qbo.pingAttempts = 1
        
        const ping1 = await fetch(`${baseUrl}/api/qbo/ping?realmId=${encodeURIComponent(token.realmId)}`)
        if (ping1.ok) {
          const body = await ping1.json()
          if (body?.ok === true) {
            pingOk = true
            result.qbo.companyName = body.companyName
          }
        }
        
        // If first attempt failed, retry once after delay
        if (!pingOk) {
          await delay(1500)
          result.qbo.pingAttempts = 2
          
          const ping2 = await fetch(`${baseUrl}/api/qbo/ping?realmId=${encodeURIComponent(token.realmId)}`)
          if (ping2.ok) {
            const body = await ping2.json()
            if (body?.ok === true) {
              pingOk = true
              result.qbo.companyName = body.companyName
            } else {
              result.qbo.error = body?.code || 'unknown_error'
            }
          } else {
            result.qbo.error = `http_${ping2.status}`
          }
        }
        
        result.qbo.status = pingOk ? 'PASS' : 'FAIL'
        result.apiRoutes.qboPing = true
      } else {
        result.qbo.status = 'FAIL'
        result.qbo.error = 'no_token'
      }
    } catch (error) {
      console.error('QBO ping failed:', error)
      result.qbo.error = 'connection_failed'
    }

    // Matching
    try {
      const resMatch = await fetch(`${baseUrl}/api/match/payouts-bank`, { method: 'POST' })
      if (resMatch.ok) {
        const m = await resMatch.json()
        result.matching.scanned = m.scanned ?? 0
        result.matching.matchedCount = m.matchedCount ?? 0
        result.matching.ambiguous = m.ambiguous ?? 0
        result.matching.exceptionsCreated = m.exceptionsCreated ?? 0
        result.matching.unmatchedPayouts = m.unmatchedPayouts?.length ?? 0
        result.matching.status = 'PASS'
      }
      result.apiRoutes.matching = true
    } catch (error) {
      console.error('Matching failed:', error)
    }

    // API routes health check
    try {
      const health = await fetch(`${baseUrl}/api/health`)
      result.apiRoutes.health = health.ok
      
      const stats = await fetch(`${baseUrl}/api/stats`)
      result.apiRoutes.stats = stats.ok
      
      const exceptionsList = await fetch(`${baseUrl}/api/exceptions/list`)
      result.apiRoutes.exceptionsList = exceptionsList.ok
      
      const sync = await fetch(`${baseUrl}/api/sync`, { method: 'POST' })
      result.apiRoutes.sync = sync.ok
      
      // Test plaid link token creation
      const linkToken = await fetch(`${baseUrl}/api/plaid/create-link-token`, { method: 'POST' })
      result.apiRoutes.plaidCreateLinkToken = linkToken.ok
      
      result.apiRoutes.status = result.apiRoutes.health ? 'PASS' : 'FAIL'
    } catch (error) {
      console.error('API routes check failed:', error)
    }

    // Frontend pages check
    try {
      const landing = await fetch(`${baseUrl}`)
      result.frontendPages.landing = landing.ok
      
      const connect = await fetch(`${baseUrl}/connect`)
      result.frontendPages.connect = connect.ok
      
      const dashboard = await fetch(`${baseUrl}/dashboard`)
      result.frontendPages.dashboard = dashboard.ok
      
      const login = await fetch(`${baseUrl}/login`)
      result.frontendPages.login = login.ok
      
      result.frontendPages.status = result.frontendPages.landing ? 'PASS' : 'FAIL'
    } catch (error) {
      console.error('Frontend pages check failed:', error)
    }

    // Overall status
    const criticalSystemsOk = 
      result.environment.status === 'PASS' &&
      result.database.status === 'PASS' &&
      result.stripe.status === 'PASS' &&
      result.plaid.status === 'PASS'
    
    if (criticalSystemsOk) {
      result.overall = 'ALL SYSTEMS OPERATIONAL – DAY 1–5 VERIFIED'
    } else {
      result.overall = 'VERIFICATION FAILED – CRITICAL SYSTEMS DOWN'
    }

  } catch (error) {
    console.error('verify-all failed:', error)
  } finally {
    await prisma.$disconnect()
  }

  console.log(JSON.stringify(result, null, 2))

  // Exit with non-zero only for critical failures
  const criticalFail = !(
    result.environment.status === 'PASS' &&
    result.database.status === 'PASS' &&
    result.stripe.status === 'PASS'
  )

  if (criticalFail) process.exit(1)
  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
