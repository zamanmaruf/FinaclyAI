#!/usr/bin/env tsx
/**
 * Creates test charge and payout for reconciliation testing
 * Uses Stripe API directly
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function createTestPayoutScenario() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     CREATE TEST PAYOUT FOR RECONCILIATION                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');

  try {
    // Step 1: Check current balance
    console.log('📊 Checking current Stripe test balance...\n');
    const balance = await stripe.balance.retrieve();
    
    const availableUSD = balance.available.find(b => b.currency === 'usd');
    const pendingUSD = balance.pending.find(b => b.currency === 'usd');
    
    console.log('💰 Current Balance:');
    console.log(`   Available: $${((availableUSD?.amount || 0) / 100).toFixed(2)}`);
    console.log(`   Pending: $${((pendingUSD?.amount || 0) / 100).toFixed(2)}\n`);

    // Step 2: Create a test charge that bypasses pending period
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Creating Test Charge');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const charge = await stripe.charges.create({
      amount: 5000, // $50.00
      currency: 'usd',
      source: 'tok_bypassPending', // Special token that bypasses pending
      description: 'FinaclyAI Test Reconciliation Charge',
    });

    console.log(`✅ Charge Created: ${charge.id}`);
    console.log(`   Amount: $${(charge.amount / 100).toFixed(2)}`);
    console.log(`   Status: ${charge.status}`);
    console.log(`   Fee: $${((charge.balance_transaction as any)?.fee || 0) / 100 || 'N/A'}\n`);

    // Wait a moment for balance to update
    console.log('⏳ Waiting for balance to update...\n');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Step 3: Check updated balance
    const newBalance = await stripe.balance.retrieve();
    const newAvailableUSD = newBalance.available.find(b => b.currency === 'usd');
    
    console.log('💰 Updated Balance:');
    console.log(`   Available: $${((newAvailableUSD?.amount || 0) / 100).toFixed(2)}\n`);

    // Step 4: Try to create a payout
    const availableAmount = newAvailableUSD?.amount || 0;
    
    if (availableAmount >= 1000) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('Creating Test Payout');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      // Create payout for most of available balance
      const payoutAmount = Math.floor(availableAmount * 0.8);

      try {
        const payout = await stripe.payouts.create({
          amount: payoutAmount,
          currency: 'usd',
          description: 'FinaclyAI Test Reconciliation Payout',
          method: 'instant', // Try instant payout
        });

        console.log(`✅ Payout Created: ${payout.id}`);
        console.log(`   Amount: $${(payout.amount / 100).toFixed(2)}`);
        console.log(`   Status: ${payout.status}`);
        console.log(`   Arrival Date: ${new Date(payout.arrival_date * 1000).toLocaleDateString()}\n`);

      } catch (instantError) {
        // If instant fails, try standard payout
        console.log('⚠️  Instant payout not available, creating standard payout...\n');
        
        const payout = await stripe.payouts.create({
          amount: payoutAmount,
          currency: 'usd',
          description: 'FinaclyAI Test Reconciliation Payout',
        });

        console.log(`✅ Payout Created: ${payout.id}`);
        console.log(`   Amount: $${(payout.amount / 100).toFixed(2)}`);
        console.log(`   Status: ${payout.status}`);
        console.log(`   Arrival Date: ${new Date(payout.arrival_date * 1000).toLocaleDateString()}\n`);
      }

      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('✅ TEST DATA CREATED SUCCESSFULLY!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } else {
      console.log('⚠️  Not enough available balance for payout yet.');
      console.log('   Current: $' + (availableAmount / 100).toFixed(2));
      console.log('   Needed: $10.00\n');
      console.log('💡 The charge was created successfully!');
      console.log('   Balance may take a few minutes to become available.\n');
    }

    // Step 5: Show next steps
    console.log('🎯 NEXT STEP: Test the Reconciliation Flow\n');
    console.log('   Run: npm run test:reconciliation\n');
    console.log('This will:');
    console.log('   1. ✅ Sync Stripe data (charge + payout if created)');
    console.log('   2. ✅ Sync Plaid transactions');
    console.log('   3. ✅ Run matching engine');
    console.log('   4. ✅ Detect exceptions');
    console.log('   5. ✅ Show auto-fix capabilities\n');

    console.log('Or view in dashboard:');
    console.log('   http://localhost:3000/dashboard\n');

  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    
    if (error instanceof Error && error.message.includes('No such token')) {
      console.log('\n💡 Tip: tok_bypassPending is a special Stripe test token.');
      console.log('   If it doesn\'t work, you can use tok_visa instead.');
      console.log('   Balance will be pending for ~2 hours in test mode.\n');
    }
    
    process.exit(1);
  }
}

createTestPayoutScenario();

