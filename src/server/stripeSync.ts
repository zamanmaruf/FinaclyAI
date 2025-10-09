import { stripe, getStripeClient } from './stripeClient';
import { db } from './db';
import { toMinorUnits } from './money';
import { isProductionMode } from '@/env';
import type Stripe from 'stripe';

interface SyncResult {
  charges: number;
  payouts: number;
  balanceTxs: number;
  exceptions: number;
}

export async function syncCharges({ days, stripeClient }: { days: number; stripeClient?: Stripe }): Promise<number> {
  const client = stripeClient || stripe;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startTimestamp = Math.floor(startDate.getTime() / 1000);

  let allCharges: any[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  // Fetch all charges for the specified period
  while (hasMore) {
    const params: any = {
      created: { gte: startTimestamp },
      limit: 100,
    };
    
    if (startingAfter) {
      params.starting_after = startingAfter;
    }

    const charges = await client.charges.list(params);
    allCharges = allCharges.concat(charges.data);
    
    hasMore = charges.has_more;
    if (hasMore && charges.data.length > 0) {
      startingAfter = charges.data[charges.data.length - 1].id;
    }
  }

  let syncedCount = 0;

  for (const charge of allCharges) {
    try {
      // Get balance transaction for fee/net amounts
      let fee = 0;
      let net = 0;
      
      if (charge.balance_transaction) {
        const balanceTx = await client.balanceTransactions.retrieve(charge.balance_transaction as string);
        fee = balanceTx.fee;
        net = balanceTx.net;
      }

      // Ensure we have an account record
      const accountId = 'acct_default'; // Use default account for test mode
      await db.stripeAccount.upsert({
        where: { id: accountId },
        update: {},
        create: {
          id: accountId,
          defaultCurrency: charge.currency.toUpperCase(),
        },
      });

      // Upsert charge
      await db.stripeCharge.upsert({
        where: { id: charge.id },
        update: {
          amount: toMinorUnits(charge.amount),
          currency: charge.currency.toUpperCase(),
          fee: toMinorUnits(fee),
          net: toMinorUnits(net),
          status: charge.status || 'unknown',
          description: charge.description || null,
          payoutId: charge.transfer_data?.destination || null,
          metadataJson: charge.metadata,
          updatedAt: new Date(),
        },
        create: {
          id: charge.id,
          accountId,
          customerId: charge.customer as string || null,
          paymentIntent: charge.payment_intent as string || null,
          amount: toMinorUnits(charge.amount),
          currency: charge.currency.toUpperCase(),
          fee: toMinorUnits(fee),
          net: toMinorUnits(net),
          status: charge.status || 'unknown',
          createdAtUnix: charge.created,
          createdAt: new Date(charge.created * 1000),
          description: charge.description || null,
          payoutId: charge.transfer_data?.destination || null,
          metadataJson: charge.metadata,
        },
      });

      syncedCount++;
    } catch (error) {
      console.error(`Error syncing charge ${charge.id}:`, error);
      
      // Record exception
      await db.stripeException.create({
        data: {
          kind: 'CHARGE_SYNC_ERROR',
          refId: charge.id,
          message: error instanceof Error ? error.message : 'Unknown error',
          data: { chargeId: charge.id, error: String(error) },
        },
      });
    }
  }

  return syncedCount;
}

export async function syncPayouts({ days, stripeClient }: { days: number; stripeClient?: Stripe }): Promise<number> {
  const client = stripeClient || stripe;
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  const startTimestamp = Math.floor(startDate.getTime() / 1000);

  let allPayouts: any[] = [];
  let hasMore = true;
  let startingAfter: string | undefined;

  // Fetch all payouts for the specified period
  while (hasMore) {
    const params: any = {
      created: { gte: startTimestamp },
      limit: 100,
    };
    
    if (startingAfter) {
      params.starting_after = startingAfter;
    }

    const payouts = await client.payouts.list(params);
    allPayouts = allPayouts.concat(payouts.data);
    
    hasMore = payouts.has_more;
    if (hasMore && payouts.data.length > 0) {
      startingAfter = payouts.data[payouts.data.length - 1].id;
    }
  }

  let syncedCount = 0;

  for (const payout of allPayouts) {
    try {
      const accountId = 'acct_default';
      
      // Ensure account exists
      await db.stripeAccount.upsert({
        where: { id: accountId },
        update: {},
        create: {
          id: accountId,
          defaultCurrency: payout.currency.toUpperCase(),
        },
      });

      // Upsert payout
      await db.stripePayout.upsert({
        where: { id: payout.id },
        update: {
          amount: toMinorUnits(payout.amount),
          currency: payout.currency.toUpperCase(),
          status: payout.status,
          description: payout.description || null,
          statementDescriptor: payout.statement_descriptor || null,
          metadataJson: payout.metadata,
          updatedAt: new Date(),
        },
        create: {
          id: payout.id,
          accountId,
          amount: toMinorUnits(payout.amount),
          currency: payout.currency.toUpperCase(),
          status: payout.status,
          arrivalDateUnix: payout.arrival_date,
          arrivalDate: new Date(payout.arrival_date * 1000),
          description: payout.description || null,
          statementDescriptor: payout.statement_descriptor || null,
          metadataJson: payout.metadata,
          createdAtUnix: payout.created,
          createdAt: new Date(payout.created * 1000),
        },
      });

      // Fetch and sync balance transactions for this payout
      let balanceTxs: any[] = [];
      let hasMoreBts = true;
      let startingAfterBt: string | undefined;

      while (hasMoreBts) {
        const btParams: any = {
          payout: payout.id,
          limit: 100,
        };
        
        if (startingAfterBt) {
          btParams.starting_after = startingAfterBt;
        }

        const balanceTransactions = await client.balanceTransactions.list(btParams);
        balanceTxs = balanceTxs.concat(balanceTransactions.data);
        
        hasMoreBts = balanceTransactions.has_more;
        if (hasMoreBts && balanceTransactions.data.length > 0) {
          startingAfterBt = balanceTransactions.data[balanceTransactions.data.length - 1].id;
        }
      }

      // Sync balance transactions
      for (const bt of balanceTxs) {
        try {
          await db.stripeBalanceTx.upsert({
            where: { id: bt.id },
            update: {
              type: bt.type,
              amount: toMinorUnits(bt.amount),
              currency: bt.currency.toUpperCase(),
              fee: toMinorUnits(bt.fee || 0),
              net: toMinorUnits(bt.net || 0),
              availableOnUnix: bt.available_on || null,
              reportingCategory: bt.reporting_category || null,
              sourceId: bt.source || null,
              payoutId: payout.id,
              rawJson: bt,
              updatedAt: new Date(),
            },
            create: {
              id: bt.id,
              accountId,
              type: bt.type,
              amount: toMinorUnits(bt.amount),
              currency: bt.currency.toUpperCase(),
              fee: toMinorUnits(bt.fee || 0),
              net: toMinorUnits(bt.net || 0),
              availableOnUnix: bt.available_on || null,
              createdUnix: bt.created,
              createdAt: new Date(bt.created * 1000),
              reportingCategory: bt.reporting_category || null,
              sourceId: bt.source || null,
              payoutId: payout.id,
              rawJson: bt,
            },
          });

          // Link charges to payouts via balance transactions
          if (bt.source && bt.type === 'charge') {
            await db.stripeCharge.updateMany({
              where: { id: bt.source },
              data: { payoutId: payout.id },
            });
          }
        } catch (error) {
          console.error(`Error syncing balance transaction ${bt.id}:`, error);
          
          await db.stripeException.create({
            data: {
              kind: 'BALANCE_TX_SYNC_ERROR',
              refId: bt.id,
              message: error instanceof Error ? error.message : 'Unknown error',
              data: { balanceTxId: bt.id, payoutId: payout.id, error: String(error) },
            },
          });
        }
      }

      syncedCount++;
    } catch (error) {
      console.error(`Error syncing payout ${payout.id}:`, error);
      
      await db.stripeException.create({
        data: {
          kind: 'PAYOUT_SYNC_ERROR',
          refId: payout.id,
          message: error instanceof Error ? error.message : 'Unknown error',
          data: { payoutId: payout.id, error: String(error) },
        },
      });
    }
  }

  return syncedCount;
}

export async function syncStripe({ days }: { days: number }): Promise<{ payouts: { inserted: number }; charges: { inserted: number }; balanceTxs: number; exceptions: number }> {
  console.log(`Starting Stripe sync for last ${days} days...`);
  
  // Get appropriate Stripe client (production OAuth or internal env key)
  const stripeClient = isProductionMode() ? await getStripeClient() : stripe;
  
  const charges = await syncCharges({ days, stripeClient });
  const payouts = await syncPayouts({ days, stripeClient });
  
  // Count balance transactions and exceptions
  const balanceTxs = await db.stripeBalanceTx.count();
  const exceptions = await db.stripeException.count();
  
  console.log(`Stripe sync complete: ${charges} charges, ${payouts} payouts, ${balanceTxs} balance txs, ${exceptions} exceptions`);
  
  return {
    charges: { inserted: charges },
    payouts: { inserted: payouts },
    balanceTxs,
    exceptions,
  };
}

// Backward compatibility alias
export const syncStripeAll = syncStripe;