import { plaidClient } from './plaidClient';
import { db } from './db';
import { env } from '@/env';

export interface SyncResult {
  totalTransactions: number;
  insertedTransactions: number;
  updatedTransactions: number;
  perAccount: Array<{
    accountId: string;
    accountName: string;
    transactions: number;
  }>;
}

export async function ensureSandboxItem() {
  // Check if we already have a sandbox item
  const existingItem = await db.bankItem.findFirst();
  if (existingItem) {
    console.log(`Using existing sandbox item: ${existingItem.id}`);
    return existingItem;
  }

  console.log('Creating new sandbox item...');

  // Create public token for sandbox using direct API call
  let publicTokenResponse;
  try {
    const response = await fetch('https://sandbox.plaid.com/sandbox/public_token/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': env.PLAID_CLIENT_ID,
        'PLAID-SECRET': env.PLAID_SECRET,
        'PLAID-VERSION': '2020-09-14',
      },
      body: JSON.stringify({
        institution_id: 'ins_130347', // Chiphone Credit Union
        initial_products: ['transactions'],
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Plaid API error: ${errorData.error_message || response.statusText}`);
    }

    publicTokenResponse = await response.json();
    console.log('Public token created successfully');
  } catch (error) {
    console.error('Error creating public token:', error);
    throw new Error(`Failed to create public token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Exchange public token for access token
  const exchangeResponse = await plaidClient.itemPublicTokenExchange({
    public_token: publicTokenResponse.public_token,
  });

  const accessToken = exchangeResponse.access_token;
  const itemId = exchangeResponse.item_id;

  // Get item info
  const itemResponse = await plaidClient.itemGet({
    access_token: accessToken,
  });

  const institutionId = itemResponse.item.institution_id;
  const institutionResponse = await plaidClient.institutionsGetById({
    institution_id: institutionId!,
    country_codes: ['US', 'CA'],
  });

  const institutionName = institutionResponse.institution.name;

  // Create BankItem
  const bankItem = await db.bankItem.create({
    data: {
      institutionName,
      itemId,
      accessToken,
    },
  });

  // Get accounts
  const accountsResponse = await plaidClient.accountsGet({
    access_token: accessToken,
  });

  // Create BankAccount records
  for (const account of accountsResponse.accounts) {
    await db.bankAccount.create({
      data: {
        bankItemId: bankItem.id,
        plaidAccountId: account.account_id,
        name: account.name,
        officialName: account.official_name || null,
        mask: account.mask || null,
        subtype: account.subtype || null,
        type: account.type || null,
        currency: (account.balances.iso_currency_code || 'USD').toUpperCase(),
      },
    });
  }

  console.log(`Created sandbox item with ${accountsResponse.accounts.length} accounts`);
  return bankItem;
}

export async function syncTransactions({ days }: { days: number }): Promise<SyncResult> {
  console.log(`Starting Plaid transaction sync for last ${days} days...`);

  const result: SyncResult = {
    totalTransactions: 0,
    insertedTransactions: 0,
    updatedTransactions: 0,
    perAccount: [],
  };

  // Get all bank items
  const bankItems = await db.bankItem.findMany({
    include: {
      accounts: true,
    },
  });

  if (bankItems.length === 0) {
    console.log('No bank items found. Please create a sandbox item first.');
    return result;
  }

  for (const item of bankItems) {
    console.log(`Syncing transactions for item: ${item.institutionName}`);

    for (const account of item.accounts) {
      try {
        console.log(`Syncing account: ${account.name} (${account.plaidAccountId})`);

        // Calculate start date
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const startDateStr = startDate.toISOString().split('T')[0];

        // Get transactions
        const transactionsResponse = await plaidClient.transactionsGet({
          access_token: item.accessToken,
          start_date: startDateStr,
          end_date: new Date().toISOString().split('T')[0],
          account_ids: [account.plaidAccountId],
        });

        let accountInserted = 0;
        let accountUpdated = 0;

        // Process transactions
        for (const tx of transactionsResponse.transactions) {
          try {
            // Convert amount to BigInt minor units
            const amountMinor = BigInt(Math.round(tx.amount * 100));
            const currency = (tx.iso_currency_code || 'USD').toUpperCase();

            // Prepare category string
            const category = tx.category ? tx.category.join(', ') : null;

            // Upsert transaction
            const upsertResult = await db.plaidTransaction.upsert({
              where: { id: tx.transaction_id },
              update: {
                date: new Date(tx.date),
                name: tx.name,
                amountMinor,
                currency,
                pending: tx.pending,
                merchantName: tx.merchant_name || null,
                category,
                counterpart: tx.merchant_name || null,
                isoCurrencyCode: tx.iso_currency_code || null,
                updatedAt: new Date(),
              },
              create: {
                id: tx.transaction_id,
                bankAccountId: account.id,
                date: new Date(tx.date),
                name: tx.name,
                amountMinor,
                currency,
                pending: tx.pending,
                merchantName: tx.merchant_name || null,
                category,
                counterpart: tx.merchant_name || null,
                isoCurrencyCode: tx.iso_currency_code || null,
              },
            });

            if (upsertResult.createdAt.getTime() === upsertResult.updatedAt.getTime()) {
              accountInserted++;
            } else {
              accountUpdated++;
            }

            result.totalTransactions++;
          } catch (txError) {
            console.error(`Error processing transaction ${tx.transaction_id}:`, txError);
            // Continue with other transactions
          }
        }

        result.insertedTransactions += accountInserted;
        result.updatedTransactions += accountUpdated;

        result.perAccount.push({
          accountId: account.id,
          accountName: account.name,
          transactions: transactionsResponse.transactions.length,
        });

        console.log(`Account ${account.name}: ${transactionsResponse.transactions.length} transactions (${accountInserted} new, ${accountUpdated} updated)`);
      } catch (accountError) {
        console.error(`Error syncing account ${account.name}:`, accountError);
        // Continue with other accounts
      }
    }
  }

  console.log(`Transaction sync complete: ${result.totalTransactions} total, ${result.insertedTransactions} inserted, ${result.updatedTransactions} updated`);
  return result;
}
