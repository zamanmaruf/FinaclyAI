#!/usr/bin/env tsx
/**
 * Complete Reconciliation Flow Test
 * Tests the entire flow with real sandbox data
 */

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
const REALM_ID = '9341455460817411';

interface TestResult {
  step: string;
  status: 'PASS' | 'FAIL' | 'INFO';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

function log(step: string, status: 'PASS' | 'FAIL' | 'INFO', message: string, data?: any) {
  results.push({ step, status, message, data });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '📊';
  console.log(`${icon} ${step}: ${message}`);
  if (data && Object.keys(data).length > 0) {
    console.log(`   ${JSON.stringify(data, null, 2).split('\n').join('\n   ')}`);
  }
}

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  
  return { status: response.status, data };
}

async function runReconciliationTest() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     FINACLYAI RECONCILIATION FLOW TEST                     ║');
  console.log('║     Testing with Real Sandbox Data                         ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  // Step 1: Check initial state
  console.log('\n━━━ STEP 1: INITIAL STATE ━━━\n');
  
  const { data: initialStats } = await fetchAPI('/api/stats');
  log('Initial Stats', 'INFO', 'Current database state', initialStats);

  // Step 2: Sync Stripe
  console.log('\n━━━ STEP 2: SYNC STRIPE DATA ━━━\n');
  
  const { data: stripeSync } = await fetchAPI('/api/stripe/sync?days=30', { method: 'POST' });
  
  if (stripeSync.ok) {
    log('Stripe Sync', 'PASS', `Synced ${stripeSync.charges} charges, ${stripeSync.payouts} payouts`, {
      charges: stripeSync.charges,
      payouts: stripeSync.payouts,
      balanceTxs: stripeSync.balanceTxs
    });
  } else {
    log('Stripe Sync', 'FAIL', `Failed: ${stripeSync.error}`);
  }

  // Step 3: Sync Plaid
  console.log('\n━━━ STEP 3: SYNC PLAID TRANSACTIONS ━━━\n');
  
  const { data: plaidSync } = await fetchAPI('/api/plaid/transactions', { method: 'POST' });
  
  if (plaidSync.ok) {
    const total = plaidSync.totals.inserted + plaidSync.totals.updated;
    log('Plaid Sync', total > 0 ? 'PASS' : 'INFO', 
        `${plaidSync.totals.inserted} inserted, ${plaidSync.totals.updated} updated`, 
        plaidSync.totals);
  } else {
    log('Plaid Sync', 'INFO', `No Plaid data or connection not set up`);
  }

  // Step 4: Sync QuickBooks
  console.log('\n━━━ STEP 4: SYNC QUICKBOOKS DATA ━━━\n');
  
  const { data: qboSync } = await fetchAPI(`/api/qbo/sync`, { method: 'POST' });
  
  if (qboSync.ok) {
    log('QBO Sync', 'PASS', `Synced invoices and payments`, {
      invoices: qboSync.invoices || 0,
      payments: qboSync.payments || 0
    });
  } else {
    log('QBO Sync', 'INFO', `QBO sync status: ${qboSync.message || 'Not configured'}`);
  }

  // Step 5: Run Matching Engine
  console.log('\n━━━ STEP 5: RUN MATCHING ENGINE ━━━\n');
  
  const { data: matching } = await fetchAPI('/api/match/payouts-bank', { method: 'POST' });
  
  if (matching.ok || matching.scanned !== undefined) {
    log('Matching Engine', 'PASS', 
        `Scanned ${matching.scanned} payouts → ${matching.matchedCount} matched`, {
      scanned: matching.scanned,
      matched: matching.matchedCount,
      noMatch: matching.noMatchCount,
      ambiguous: matching.ambiguousCount,
      multiCurrency: matching.multiCurrencyCount || 0,
      partialPayment: matching.partialPaymentCount || 0,
      exceptionsCreated: matching.exceptionsCreated
    });
  } else {
    log('Matching Engine', 'FAIL', `Failed to run matching: ${matching.error}`);
  }

  // Step 6: Check for Exceptions
  console.log('\n━━━ STEP 6: EXCEPTION ANALYSIS ━━━\n');
  
  const { data: exceptions } = await fetchAPI('/api/exceptions/list');
  
  if (exceptions.rows) {
    log('Exceptions', exceptions.rows.length > 0 ? 'INFO' : 'PASS', 
        `Found ${exceptions.rows.length} exceptions`, {
      total: exceptions.rows.length
    });
    
    if (exceptions.rows.length > 0) {
      console.log('\n   Exception Breakdown:');
      const byType = exceptions.rows.reduce((acc: any, ex: any) => {
        acc[ex.kind] = (acc[ex.kind] || 0) + 1;
        return acc;
      }, {});
      
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`   • ${type}: ${count}`);
      });
      
      // Show first 3 exceptions
      console.log('\n   Latest Exceptions:');
      exceptions.rows.slice(0, 3).forEach((ex: any) => {
        console.log(`   • [${ex.kind}] ${ex.message.substring(0, 60)}...`);
      });
      
      // Test auto-fix if we have fixable exceptions
      const fixableException = exceptions.rows.find((ex: any) => 
        ex.kind === 'PAYOUT_NO_QBO_DEPOSIT'
      );
      
      if (fixableException) {
        console.log('\n━━━ STEP 7: TEST AUTO-FIX ━━━\n');
        console.log(`   Found fixable exception: ${fixableException.id}`);
        console.log(`   Testing Fix Now functionality...`);
        
        const { data: fixResult } = await fetchAPI(
          `/api/fix/payout?id=${fixableException.id}`, 
          { method: 'POST' }
        );
        
        if (fixResult.ok) {
          log('Auto-Fix', 'PASS', 'Successfully fixed exception', {
            exceptionId: fixableException.id,
            qboDeposit: fixResult.depositId || 'Created'
          });
        } else {
          log('Auto-Fix', 'FAIL', `Fix failed: ${fixResult.error}`);
        }
      }
    }
  }

  // Step 7: Final State
  console.log('\n━━━ FINAL STATE ━━━\n');
  
  const { data: finalStats } = await fetchAPI('/api/stats');
  log('Final Stats', 'INFO', 'After reconciliation', finalStats);
  
  // Summary
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║                    TEST SUMMARY                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const info = results.filter(r => r.status === 'INFO').length;
  
  console.log(`   ✅ Passed: ${passed}`);
  console.log(`   ❌ Failed: ${failed}`);
  console.log(`   📊 Info: ${info}`);
  
  if (stripeSync.charges > 0 || stripeSync.payouts > 0) {
    console.log(`\n   📈 Data Processed:`);
    console.log(`      Stripe Charges: ${stripeSync.charges}`);
    console.log(`      Stripe Payouts: ${stripeSync.payouts}`);
    console.log(`      Plaid Transactions: ${plaidSync.totals?.inserted || 0 + plaidSync.totals?.updated || 0}`);
    console.log(`      Matches Created: ${matching.matchedCount || 0}`);
    console.log(`      Exceptions: ${exceptions.rows?.length || 0}`);
  }
  
  console.log('\n   🎯 Reconciliation Flow: ' + (failed === 0 ? '✅ WORKING' : '⚠️  NEEDS ATTENTION'));
  console.log('\n');
  
  process.exit(failed > 0 ? 1 : 0);
}

runReconciliationTest().catch(err => {
  console.error('\n❌ Test failed with error:', err.message);
  process.exit(1);
});

