#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerificationResult {
  env: string;
  db: string;
  plaidItem: string;
  plaidTransactions: {
    PASS: boolean;
    inserted: number;
    afterSecondRunDelta: number;
  };
  stripePresence: string;
  matching: {
    status: string;
    matched: number;
    exceptions: {
      PAYOUT_NO_BANK_MATCH: number;
      AMBIGUOUS_BANK_MATCH: number;
    };
  };
}

async function verifyDay4(): Promise<VerificationResult> {
  const result: VerificationResult = {
    env: 'FAIL',
    db: 'FAIL',
    plaidItem: 'FAIL',
    plaidTransactions: {
      PASS: false,
      inserted: 0,
      afterSecondRunDelta: 0,
    },
    stripePresence: 'FAIL',
    matching: {
      status: 'FAIL',
      matched: 0,
      exceptions: {
        PAYOUT_NO_BANK_MATCH: 0,
        AMBIGUOUS_BANK_MATCH: 0,
      },
    },
  };

  try {
    // 1. Environment check
    console.log('🔍 Checking environment variables...');
    
    if (!process.env.PLAID_CLIENT_ID || !process.env.PLAID_SECRET) {
      console.error('❌ PLAID_CLIENT_ID or PLAID_SECRET not found');
      return result;
    }
    
    if (process.env.PLAID_ENV !== 'sandbox') {
      console.error('❌ PLAID_ENV must be "sandbox"');
      return result;
    }
    
    result.env = 'PASS';
    console.log('✅ Environment variables verified');

    // 2. Database health check
    console.log('🔍 Checking database connection...');
    await prisma.$connect();
    await prisma.stripePayout.count(); // Test query
    result.db = 'PASS';
    console.log('✅ Database connection verified');

    // 3. Ensure sandbox item
    console.log('🔍 Ensuring sandbox item...');
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const sandboxUrl = `${baseUrl}/api/plaid/sandbox-link`;

    const sandboxResponse = await fetch(sandboxUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!sandboxResponse.ok) {
      const errorText = await sandboxResponse.text();
      console.error(`❌ Sandbox link failed: ${sandboxResponse.status} ${errorText}`);
      return result;
    }

    const sandboxResult = await sandboxResponse.json();
    if (!sandboxResult.ok) {
      console.error('❌ Sandbox link returned error:', sandboxResult.error);
      return result;
    }

    result.plaidItem = 'PASS';
    console.log('✅ Sandbox item created/verified');

    // 4. Transactions sync
    console.log('🔍 Testing transactions sync...');
    const transactionsUrl = `${baseUrl}/api/plaid/transactions?days=30`;

    // First sync
    const syncResponse1 = await fetch(transactionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!syncResponse1.ok) {
      const errorText = await syncResponse1.text();
      console.error(`❌ First sync failed: ${syncResponse1.status} ${errorText}`);
      return result;
    }

    const syncResult1 = await syncResponse1.json();
    if (!syncResult1.ok) {
      console.error('❌ First sync returned error:', syncResult1.error);
      return result;
    }

    result.plaidTransactions.inserted = syncResult1.totals.inserted + syncResult1.totals.updated;
    console.log(`✅ First sync completed: ${result.plaidTransactions.inserted} transactions`);

    // Second sync for idempotency test
    const syncResponse2 = await fetch(transactionsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!syncResponse2.ok) {
      const errorText = await syncResponse2.text();
      console.error(`❌ Second sync failed: ${syncResponse2.status} ${errorText}`);
      return result;
    }

    const syncResult2 = await syncResponse2.json();
    if (!syncResult2.ok) {
      console.error('❌ Second sync returned error:', syncResult2.error);
      return result;
    }

    const secondRunTotal = syncResult2.totals.inserted + syncResult2.totals.updated;
    result.plaidTransactions.afterSecondRunDelta = secondRunTotal;
    
    if (secondRunTotal === 0) {
      result.plaidTransactions.PASS = true;
      console.log('✅ Idempotency verified - no new transactions in second run');
    } else {
      console.log(`⚠️  Second run added ${secondRunTotal} transactions`);
    }

    // 5. Stripe presence check
    console.log('🔍 Checking Stripe data presence...');
    const payoutCount = await prisma.stripePayout.count();
    
    if (payoutCount > 0) {
      result.stripePresence = 'PASS';
      console.log(`✅ Found ${payoutCount} Stripe payouts`);
    } else {
      result.stripePresence = 'WARN';
      console.log('⚠️  No Stripe payouts found - matching will be skipped');
    }

    // 6. Matching (only if we have payouts)
    if (payoutCount > 0) {
      console.log('🔍 Testing payout↔bank matching...');
      const matchingUrl = `${baseUrl}/api/match/payouts-bank`;

      const matchingResponse = await fetch(matchingUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!matchingResponse.ok) {
        const errorText = await matchingResponse.text();
        console.error(`❌ Matching failed: ${matchingResponse.status} ${errorText}`);
        result.matching.status = 'FAIL';
      } else {
        const matchingResult = await matchingResponse.json();
        if (!matchingResult.ok) {
          console.error('❌ Matching returned error:', matchingResult.error);
          result.matching.status = 'FAIL';
        } else {
          result.matching.matched = matchingResult.matched;
          result.matching.status = 'PASS';
          console.log(`✅ Matching completed: ${matchingResult.matched} matched, ${matchingResult.exceptions} exceptions`);
        }
      }

      // Count exceptions by type
      const noMatchExceptions = await prisma.stripeException.count({
        where: { kind: 'PAYOUT_NO_BANK_MATCH' },
      });
      const ambiguousExceptions = await prisma.stripeException.count({
        where: { kind: 'AMBIGUOUS_BANK_MATCH' },
      });

      result.matching.exceptions.PAYOUT_NO_BANK_MATCH = noMatchExceptions;
      result.matching.exceptions.AMBIGUOUS_BANK_MATCH = ambiguousExceptions;
    } else {
      result.matching.status = 'WARN';
      console.log('⚠️  Skipping matching - no payouts available');
    }

    console.log('✅ Day 4 verification completed successfully');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }

  return result;
}

// Run verification
verifyDay4().then(result => {
  console.log('\n📋 Day 4 Verification Result:');
  console.log(JSON.stringify(result, null, 2));
  
  // Determine exit code
  const criticalFailures = [
    result.env === 'FAIL',
    result.db === 'FAIL',
    result.plaidItem === 'FAIL',
    !result.plaidTransactions.PASS,
  ];
  
  if (criticalFailures.some(fail => fail)) {
    console.log('\n❌ Critical requirements failed verification');
    process.exit(1);
  } else {
    console.log('\n🎉 Day 4 requirements verified successfully!');
    process.exit(0);
  }
}).catch(error => {
  console.error('💥 Verification script failed:', error);
  process.exit(1);
});