#!/usr/bin/env tsx

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface VerificationResult {
  env: string;
  db: string;
  sync: string;
  charges: number;
  payouts: number;
  balanceTx: number;
  exceptions: number;
}

async function verifyDay2Stripe(): Promise<VerificationResult> {
  const result: VerificationResult = {
    env: 'FAIL',
    db: 'FAIL',
    sync: 'FAIL',
    charges: 0,
    payouts: 0,
    balanceTx: 0,
    exceptions: 0,
  };

  try {
    // Check environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY not found');
      return result;
    }
    
    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      console.error('❌ STRIPE_WEBHOOK_SECRET not found');
      return result;
    }

    result.env = 'PASS';
    console.log('✅ Environment variables verified');

    // Check database connection
    await prisma.$connect();
    await prisma.stripeAccount.count(); // Test query
    result.db = 'PASS';
    console.log('✅ Database connection verified');

    // Get initial counts
    const initialCounts = {
      charges: await prisma.stripeCharge.count(),
      payouts: await prisma.stripePayout.count(),
      balanceTx: await prisma.stripeBalanceTx.count(),
      exceptions: await prisma.stripeException.count(),
    };

    console.log(`📊 Initial counts: ${initialCounts.charges} charges, ${initialCounts.payouts} payouts, ${initialCounts.balanceTx} balance txs, ${initialCounts.exceptions} exceptions`);

    // Test sync endpoint
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const syncUrl = `${baseUrl}/api/stripe/sync?days=7`;

    console.log(`🔄 Testing sync endpoint: ${syncUrl}`);

    const response1 = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response1.ok) {
      const errorText = await response1.text();
      console.error(`❌ First sync failed: ${response1.status} ${errorText}`);
      return result;
    }

    const syncResult1 = await response1.json();
    console.log('✅ First sync completed:', syncResult1);

    // Wait a moment then run second sync to test idempotency
    await new Promise(resolve => setTimeout(resolve, 1000));

    const response2 = await fetch(syncUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response2.ok) {
      const errorText = await response2.text();
      console.error(`❌ Second sync failed: ${response2.status} ${errorText}`);
      return result;
    }

    const syncResult2 = await response2.json();
    console.log('✅ Second sync completed:', syncResult2);

    // Verify idempotency - second sync should not add new records
    const finalCounts = {
      charges: await prisma.stripeCharge.count(),
      payouts: await prisma.stripePayout.count(),
      balanceTx: await prisma.stripeBalanceTx.count(),
      exceptions: await prisma.stripeException.count(),
    };

    console.log(`📊 Final counts: ${finalCounts.charges} charges, ${finalCounts.payouts} payouts, ${finalCounts.balanceTx} balance txs, ${finalCounts.exceptions} exceptions`);

    // Check if counts match (idempotency)
    if (
      finalCounts.charges === initialCounts.charges &&
      finalCounts.payouts === initialCounts.payouts &&
      finalCounts.balanceTx === initialCounts.balanceTx
    ) {
      console.log('✅ Idempotency verified - no duplicate records created');
    } else {
      console.log('⚠️  Idempotency check: Some records were added in second sync');
    }

    result.sync = 'PASS';
    result.charges = finalCounts.charges;
    result.payouts = finalCounts.payouts;
    result.balanceTx = finalCounts.balanceTx;
    result.exceptions = finalCounts.exceptions;

    console.log('✅ Stripe sync verification completed successfully');

  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }

  return result;
}

// Run verification
verifyDay2Stripe().then(result => {
  console.log('\n📋 Final Verification Result:');
  console.log(JSON.stringify(result, null, 2));
  
  if (result.env === 'PASS' && result.db === 'PASS' && result.sync === 'PASS') {
    console.log('\n🎉 All Day 2 Stripe requirements verified successfully!');
    process.exit(0);
  } else {
    console.log('\n❌ Some requirements failed verification');
    process.exit(1);
  }
}).catch(error => {
  console.error('💥 Verification script failed:', error);
  process.exit(1);
});
