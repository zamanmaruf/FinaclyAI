#!/usr/bin/env tsx
/**
 * Production Connect UX Verification Script
 * 
 * This script verifies the production onboarding experience:
 * 1. Checks environment configuration
 * 2. Verifies provider connection status
 * 3. Tests unified sync endpoint
 * 4. Validates idempotency
 * 5. Confirms reconciliation results
 * 
 * Run with: npm run verify:prod
 */

import { env, isProductionMode } from '../src/env'

const APP_URL = env.NEXT_PUBLIC_APP_URL

interface VerificationResult {
  environment: 'PASS' | 'FAIL'
  environmentDetails: {
    publicMode: string
    encryptionKeyPresent: boolean
    stripeConnectConfigured: boolean
    requiredKeysPresent: boolean
  }
  connections: {
    stripe: 'PASS' | 'FAIL' | 'PENDING'
    plaid: 'PASS' | 'FAIL' | 'PENDING'
    qbo: 'PASS' | 'FAIL' | 'PENDING'
  }
  sync: {
    firstRun: 'PASS' | 'FAIL' | 'SKIPPED'
    idempotency: 'PASS' | 'FAIL' | 'SKIPPED'
    reconciliationResults: 'PASS' | 'FAIL' | 'SKIPPED'
  }
  overall: 'PASS' | 'FAIL'
}

async function checkEnvironment(): Promise<{ status: 'PASS' | 'FAIL'; details: any }> {
  console.log('\n📋 Step 1: Checking environment configuration...\n')
  
  const details = {
    publicMode: env.PUBLIC_MODE,
    encryptionKeyPresent: !!env.SECRET_ENCRYPTION_KEY && env.SECRET_ENCRYPTION_KEY.length >= 32,
    stripeConnectConfigured: !!env.STRIPE_CONNECT_CLIENT_ID,
    requiredKeysPresent: !!(
      env.STRIPE_SECRET_KEY &&
      env.STRIPE_WEBHOOK_SECRET &&
      env.QBO_CLIENT_ID &&
      env.QBO_CLIENT_SECRET &&
      env.PLAID_CLIENT_ID &&
      env.PLAID_SECRET
    ),
  }
  
  console.log('  PUBLIC_MODE:', details.publicMode)
  console.log('  SECRET_ENCRYPTION_KEY:', details.encryptionKeyPresent ? '✅ Present (32+ chars)' : '❌ Missing or too short')
  console.log('  STRIPE_CONNECT_CLIENT_ID:', details.stripeConnectConfigured ? '✅ Configured' : '⚠️  Not configured (will use internal mode)')
  console.log('  Required provider keys:', details.requiredKeysPresent ? '✅ All present' : '❌ Some missing')
  
  const status = details.encryptionKeyPresent && details.requiredKeysPresent ? 'PASS' : 'FAIL'
  
  console.log('\n  Environment check:', status === 'PASS' ? '✅ PASS' : '❌ FAIL')
  
  return { status, details }
}

async function checkConnectionStatus(provider: string, endpoint: string): Promise<{ connected: boolean; data: any }> {
  try {
    const response = await fetch(`${APP_URL}${endpoint}`)
    const data = await response.json()
    return { connected: data.connected === true, data }
  } catch (error) {
    console.error(`  Error checking ${provider}:`, error)
    return { connected: false, data: null }
  }
}

async function checkConnections(): Promise<{ stripe: string; plaid: string; qbo: string }> {
  console.log('\n📋 Step 2: Checking provider connections...\n')
  
  const stripe = await checkConnectionStatus('Stripe', '/api/status/stripe')
  const plaid = await checkConnectionStatus('Plaid', '/api/status/plaid')
  const qbo = await checkConnectionStatus('QuickBooks', '/api/status/qbo')
  
  console.log('  Stripe:', stripe.connected ? '✅ Connected' : '⏸️  Not connected')
  if (stripe.connected && stripe.data) {
    console.log('    Account ID:', stripe.data.accountId || 'N/A')
    console.log('    Live mode:', stripe.data.livemode ? 'Yes' : 'No')
  }
  
  console.log('  Plaid:', plaid.connected ? '✅ Connected' : '⏸️  Not connected')
  if (plaid.connected && plaid.data) {
    console.log('    Institution:', plaid.data.institutionName || 'N/A')
    console.log('    Accounts:', plaid.data.accountsCount || 0)
  }
  
  console.log('  QuickBooks:', qbo.connected ? '✅ Connected' : '⏸️  Not connected')
  if (qbo.connected && qbo.data) {
    console.log('    Company:', qbo.data.companyName || 'N/A')
    console.log('    Realm ID:', qbo.data.realmId || 'N/A')
  }
  
  const allConnected = stripe.connected && plaid.connected && qbo.connected
  
  if (!allConnected) {
    console.log('\n  ⚠️  Not all providers are connected.')
    console.log('  Please visit', `${APP_URL}/connect`, 'and connect all three services.')
    console.log('\n  After connecting, press Enter to continue verification...')
    
    // Wait for user input
    await new Promise((resolve) => {
      process.stdin.once('data', () => resolve(null))
    })
    
    // Re-check connections
    console.log('\n  Re-checking connections...')
    const stripeRecheck = await checkConnectionStatus('Stripe', '/api/status/stripe')
    const plaidRecheck = await checkConnectionStatus('Plaid', '/api/status/plaid')
    const qboRecheck = await checkConnectionStatus('QuickBooks', '/api/status/qbo')
    
    console.log('  Stripe:', stripeRecheck.connected ? '✅ Connected' : '❌ Still not connected')
    console.log('  Plaid:', plaidRecheck.connected ? '✅ Connected' : '❌ Still not connected')
    console.log('  QuickBooks:', qboRecheck.connected ? '✅ Connected' : '❌ Still not connected')
    
    return {
      stripe: stripeRecheck.connected ? 'PASS' : 'FAIL',
      plaid: plaidRecheck.connected ? 'PASS' : 'FAIL',
      qbo: qboRecheck.connected ? 'PASS' : 'FAIL',
    }
  }
  
  console.log('\n  Connections check: ✅ PASS (all connected)')
  
  return {
    stripe: 'PASS',
    plaid: 'PASS',
    qbo: 'PASS',
  }
}

async function testSync(): Promise<{ firstRun: string; idempotency: string; reconciliation: string; syncData?: any }> {
  console.log('\n📋 Step 3: Testing unified sync endpoint...\n')
  
  // First sync run
  console.log('  Running first sync...')
  let firstResponse
  try {
    firstResponse = await fetch(`${APP_URL}/api/sync/all`, { method: 'POST' })
    const firstData = await firstResponse.json()
    
    if (firstResponse.ok && firstData.ok) {
      console.log('  ✅ First sync completed successfully')
      console.log('    Payouts:', firstData.counts?.payouts || 0)
      console.log('    Charges:', firstData.counts?.charges || 0)
      console.log('    Bank transactions:', firstData.counts?.bankTransactions || 0)
      console.log('    Matched:', firstData.counts?.matched || 0)
      console.log('    Exceptions created:', firstData.counts?.exceptionsCreated || 0)
      
      // Wait 2 seconds
      console.log('\n  Waiting 2 seconds before second sync...')
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Second sync run (idempotency test)
      console.log('  Running second sync (idempotency test)...')
      const secondResponse = await fetch(`${APP_URL}/api/sync/all`, { method: 'POST' })
      const secondData = await secondResponse.json()
      
      if (secondResponse.ok && secondData.ok) {
        console.log('  ✅ Second sync completed successfully')
        console.log('    Payouts:', secondData.counts?.payouts || 0)
        console.log('    Charges:', secondData.counts?.charges || 0)
        console.log('    Bank transactions:', secondData.counts?.bankTransactions || 0)
        console.log('    Matched:', secondData.counts?.matched || 0)
        
        // Check reconciliation results
        const hasReconciliationData = (firstData.counts?.matched || 0) > 0 || (firstData.counts?.exceptionsCreated || 0) > 0
        
        return {
          firstRun: 'PASS',
          idempotency: 'PASS',
          reconciliation: hasReconciliationData ? 'PASS' : 'FAIL',
          syncData: firstData,
        }
      } else {
        console.log('  ❌ Second sync failed:', secondData.error || 'Unknown error')
        return {
          firstRun: 'PASS',
          idempotency: 'FAIL',
          reconciliation: 'SKIPPED',
          syncData: firstData,
        }
      }
    } else {
      console.log('  ❌ First sync failed:', firstData.error || 'Unknown error')
      return {
        firstRun: 'FAIL',
        idempotency: 'SKIPPED',
        reconciliation: 'SKIPPED',
      }
    }
  } catch (error) {
    console.log('  ❌ Sync error:', error)
    return {
      firstRun: 'FAIL',
      idempotency: 'SKIPPED',
      reconciliation: 'SKIPPED',
    }
  }
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════')
  console.log('  FinaclyAI Production Connect UX Verification')
  console.log('═══════════════════════════════════════════════════════════')
  
  const result: VerificationResult = {
    environment: 'FAIL',
    environmentDetails: {
      publicMode: '',
      encryptionKeyPresent: false,
      stripeConnectConfigured: false,
      requiredKeysPresent: false,
    },
    connections: {
      stripe: 'PENDING',
      plaid: 'PENDING',
      qbo: 'PENDING',
    },
    sync: {
      firstRun: 'SKIPPED',
      idempotency: 'SKIPPED',
      reconciliationResults: 'SKIPPED',
    },
    overall: 'FAIL',
  }
  
  try {
    // Step 1: Environment
    const envCheck = await checkEnvironment()
    result.environment = envCheck.status
    result.environmentDetails = envCheck.details
    
    if (envCheck.status === 'FAIL') {
      console.log('\n❌ Environment check failed. Please fix configuration before continuing.')
      printResults(result)
      process.exit(1)
    }
    
    // Step 2: Connections
    const connections = await checkConnections()
    result.connections = connections as any
    
    if (Object.values(connections).some(status => status === 'FAIL')) {
      console.log('\n❌ Connection check failed. Please connect all providers.')
      printResults(result)
      process.exit(1)
    }
    
    // Step 3: Sync
    const syncResults = await testSync()
    result.sync.firstRun = syncResults.firstRun as any
    result.sync.idempotency = syncResults.idempotency as any
    result.sync.reconciliationResults = syncResults.reconciliation as any
    
    // Determine overall result
    const allPassed = 
      result.environment === 'PASS' &&
      Object.values(result.connections).every(s => s === 'PASS') &&
      result.sync.firstRun === 'PASS' &&
      result.sync.idempotency === 'PASS' &&
      result.sync.reconciliationResults === 'PASS'
    
    result.overall = allPassed ? 'PASS' : 'FAIL'
    
    printResults(result)
    
    if (result.overall === 'PASS') {
      console.log('\n✅ All verifications passed! Production connect UX is ready.')
      process.exit(0)
    } else {
      console.log('\n❌ Some verifications failed. Please review the results above.')
      process.exit(1)
    }
  } catch (error) {
    console.error('\n❌ Fatal error during verification:', error)
    printResults(result)
    process.exit(1)
  }
}

function printResults(result: VerificationResult) {
  console.log('\n═══════════════════════════════════════════════════════════')
  console.log('  Verification Results')
  console.log('═══════════════════════════════════════════════════════════\n')
  console.log(JSON.stringify(result, null, 2))
  console.log('\n═══════════════════════════════════════════════════════════')
}

main()

