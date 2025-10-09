#!/usr/bin/env tsx
/**
 * Creates a complete test scenario for reconciliation
 * Uses Stripe API directly to create test data
 */

import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

async function createTestScenario() {
  console.log('\n🎯 Creating Test Reconciliation Scenario\n');
  
  try {
    // Check current balance
    console.log('📊 Checking Stripe test balance...');
    const balance = await stripe.balance.retrieve();
    console.log(`   Available: $${(balance.available[0]?.amount || 0) / 100}`);
    console.log(`   Pending: $${(balance.pending[0]?.amount || 0) / 100}`);
    
    // List recent payouts
    console.log('\n💰 Checking recent payouts...');
    const payouts = await stripe.payouts.list({ limit: 5 });
    console.log(`   Found ${payouts.data.length} recent payouts`);
    
    if (payouts.data.length > 0) {
      console.log('\n   Latest payouts:');
      payouts.data.forEach(p => {
        const amount = (p.amount / 100).toFixed(2);
        const date = new Date(p.created * 1000).toLocaleDateString();
        console.log(`   • ${p.id}: $${amount} on ${date} (${p.status})`);
      });
    }
    
    // Check if we can create a payout
    const availableAmount = balance.available[0]?.amount || 0;
    
    if (availableAmount > 100) {
      console.log('\n✅ You have enough balance to create a test payout!');
      console.log('\n📝 To create a test payout:');
      console.log('   1. Go to: https://dashboard.stripe.com/test/balance/payouts/new');
      console.log('   2. Create a payout for $10.00');
      console.log('   3. Choose "Instant" for immediate testing');
      console.log('   4. Run: npm run test-reconciliation-flow');
    } else {
      console.log('\n⚠️  Not enough balance for a payout.');
      console.log('\n📝 To add test balance:');
      console.log('   1. Create test charges in Stripe dashboard');
      console.log('   2. Or use Stripe CLI: stripe charges create');
      console.log('   3. Wait for balance to settle');
    }
    
    // Show existing charges
    console.log('\n💳 Recent charges in your account:');
    const charges = await stripe.charges.list({ limit: 5 });
    
    if (charges.data.length > 0) {
      charges.data.forEach(c => {
        const amount = (c.amount / 100).toFixed(2);
        const date = new Date(c.created * 1000).toLocaleDateString();
        console.log(`   • ${c.id}: $${amount} on ${date} (${c.status})`);
      });
    } else {
      console.log('   No charges found');
    }
    
    console.log('\n✅ Test scenario check complete!');
    console.log('\n🎯 Next Steps:');
    console.log('   1. Create a test payout in Stripe dashboard (if you have balance)');
    console.log('   2. Run: npm run test-reconciliation-flow');
    console.log('   3. Watch the reconciliation happen automatically!\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

createTestScenario();

