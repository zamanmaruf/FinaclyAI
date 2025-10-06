import { stripe } from "./stripeClient";
import { prisma } from "./db";
import type Stripe from "stripe";

const toDate = (unix: number) => new Date(unix * 1000);

async function ensureAccount(acctId: string) {
  if (acctId === "acct_1") {
    // For platform account, create a placeholder
    await prisma.stripeAccount.upsert({
      where: { id: "acct_1" },
      update: { defaultCurrency: "usd" },
      create: { id: "acct_1", defaultCurrency: "usd" },
    });
    return "acct_1";
  }
  
  const acct = await stripe.accounts.retrieve(acctId);
  await prisma.stripeAccount.upsert({
    where: { id: acct.id },
    update: { defaultCurrency: acct.default_currency || "usd" },
    create: { id: acct.id, defaultCurrency: acct.default_currency || "usd" },
  });
  return acct.id;
}

export async function syncCharges(params: {
  accountId: string;
  sinceUnix?: number;
}) {
  const { accountId, sinceUnix } = params;
  await ensureAccount(accountId);

  const iter = stripe.charges.list({
    limit: 100,
    ...(sinceUnix ? { created: { gte: sinceUnix } } : {}),
    expand: ["data.balance_transaction"],
  });

  for await (const ch of iter) {
    const bt = ch.balance_transaction as unknown as Stripe.BalanceTransaction | null;
    const fee = bt?.fee != null ? BigInt(bt.fee) : null;
    const net = bt?.net != null ? BigInt(bt.net) : null;

    await prisma.stripeCharge.upsert({
      where: { id: ch.id },
      update: {
        accountId,
        customerId: ch.customer ? String(ch.customer) : null,
        paymentIntent: ch.payment_intent ? String(ch.payment_intent) : null,
        amount: BigInt(ch.amount),
        currency: ch.currency.toUpperCase(),
        fee,
        net,
        status: ch.status,
        createdAtUnix: ch.created,
        createdAt: toDate(ch.created),
        description: ch.description ?? null,
        metadataJson: ch.metadata as any,
      },
      create: {
        id: ch.id,
        accountId,
        customerId: ch.customer ? String(ch.customer) : null,
        paymentIntent: ch.payment_intent ? String(ch.payment_intent) : null,
        amount: BigInt(ch.amount),
        currency: ch.currency.toUpperCase(),
        fee,
        net,
        status: ch.status,
        createdAtUnix: ch.created,
        createdAt: toDate(ch.created),
        description: ch.description ?? null,
        metadataJson: ch.metadata as any,
      },
    });
  }
}

export async function syncPayouts(params: {
  accountId: string;
  sinceUnix?: number;
}) {
  const { accountId, sinceUnix } = params;
  await ensureAccount(accountId);

  const iter = stripe.payouts.list({
    limit: 100,
    ...(sinceUnix ? { created: { gte: sinceUnix } } : {}),
    expand: ["data.destination"],
  });

  for await (const po of iter) {
    await prisma.stripePayout.upsert({
      where: { id: po.id },
      update: {
        accountId,
        amount: BigInt(po.amount),
        currency: po.currency.toUpperCase(),
        status: po.status,
        arrivalDateUnix: po.arrival_date,
        arrivalDate: toDate(po.arrival_date),
        description: po.description ?? null,
        statementDescriptor: po.statement_descriptor ?? null,
        metadataJson: po.metadata as any,
        createdAtUnix: po.created,
        createdAt: toDate(po.created),
      },
      create: {
        id: po.id,
        accountId,
        amount: BigInt(po.amount),
        currency: po.currency.toUpperCase(),
        status: po.status,
        arrivalDateUnix: po.arrival_date,
        arrivalDate: toDate(po.arrival_date),
        description: po.description ?? null,
        statementDescriptor: po.statement_descriptor ?? null,
        metadataJson: po.metadata as any,
        createdAtUnix: po.created,
        createdAt: toDate(po.created),
      },
    });

    // Pull the payout breakdown from balance transactions
    const btIter = stripe.balanceTransactions.list({
      limit: 100,
      payout: po.id,
    });

    for await (const tx of btIter) {
      await prisma.stripeBalanceTx.upsert({
        where: { id: tx.id },
        update: {
          accountId,
          type: tx.type,
          amount: BigInt(tx.amount),
          currency: tx.currency.toUpperCase(),
          fee: tx.fee != null ? BigInt(tx.fee) : null,
          net: tx.net != null ? BigInt(tx.net) : null,
          availableOnUnix: tx.available_on ?? null,
          createdUnix: tx.created,
          createdAt: toDate(tx.created),
          reportingCategory: tx.reporting_category ?? null,
          sourceId: tx.source ? String(tx.source) : null,
          payoutId: (tx as any).payout ?? null,
          rawJson: tx as any,
        },
        create: {
          id: tx.id,
          accountId,
          type: tx.type,
          amount: BigInt(tx.amount),
          currency: tx.currency.toUpperCase(),
          fee: tx.fee != null ? BigInt(tx.fee) : null,
          net: tx.net != null ? BigInt(tx.net) : null,
          availableOnUnix: tx.available_on ?? null,
          createdUnix: tx.created,
          createdAt: toDate(tx.created),
          reportingCategory: tx.reporting_category ?? null,
          sourceId: tx.source ? String(tx.source) : null,
          payoutId: (tx as any).payout ?? null,
          rawJson: tx as any,
        },
      });

      // If the balance tx is tied to a charge, associate that charge to this payout
      const sourceId = tx.source ? String(tx.source) : null;
      if (sourceId?.startsWith("ch_") && (tx as any).payout) {
        await prisma.stripeCharge.updateMany({
          where: { id: sourceId, accountId },
          data: { payoutId: (tx as any).payout },
        });
      }

      // Multi-currency flag: payout currency != tx currency
      if ((tx as any).payout && tx.currency.toUpperCase() !== po.currency.toUpperCase()) {
        await prisma.stripeException.create({
          data: {
            kind: "MULTI_CURRENCY_PAYOUT",
            refId: (tx as any).payout,
            message: `Payout ${(tx as any).payout} is ${po.currency} but balance tx ${tx.id} is ${tx.currency}`,
            data: { payoutCurrency: po.currency, txCurrency: tx.currency, txId: tx.id },
          },
        });
      }
    }
  }
}

export async function syncStripeAll(params: { accountId: string; days?: number }) {
  const { accountId, days = 30 } = params;
  const sinceUnix = Math.floor((Date.now() - days * 24 * 60 * 60 * 1000) / 1000);

  await syncCharges({ accountId, sinceUnix });
  await syncPayouts({ accountId, sinceUnix });

  // Simple sanity flags: charges without payout after 5 days
  const fiveDaysAgo = new Date(Date.now() - 5 * 24 * 60 * 60 * 1000);
  const dangling = await prisma.stripeCharge.findMany({
    where: { payoutId: null, createdAt: { lt: fiveDaysAgo } },
    select: { id: true, amount: true, currency: true, createdAt: true },
  });
  for (const ch of dangling) {
    await prisma.stripeException.create({
      data: {
        kind: "CHARGE_NO_PAYOUT",
        refId: ch.id,
        message: `Charge ${ch.id} has no associated payout (aged)`,
        data: { amount: ch.amount.toString(), currency: ch.currency, createdAt: ch.createdAt },
      },
    });
  }

  return { ok: true };
}
