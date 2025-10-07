import { plaidClient } from './plaidClient';
import { prisma } from './db';

export async function ensureSandboxItem() {
  // Check if a BankItem already exists
  const existingItem = await prisma.bankItem.findFirst();
  if (existingItem) {
    return existingItem;
  }

  try {
    // Create sandbox public token
    const publicTokenResponse = await plaidClient.sandboxPublicTokenCreate({
      institution_id: 'ins_109508',
      initial_products: ['transactions'],
      options: {
        override_username: 'user_good',
        override_password: 'pass_good',
      },
    });

    const publicToken = publicTokenResponse.data.public_token;

    // Exchange public token for access token
    const tokenResponse = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    const accessToken = tokenResponse.data.access_token;
    const itemId = tokenResponse.data.item_id;

    // Get accounts
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    // Create BankItem
    const bankItem = await prisma.bankItem.create({
      data: {
        institutionName: 'Chase',
        itemId,
        accessToken,
      },
    });

    // Create BankAccounts
    for (const account of accountsResponse.data.accounts) {
      await prisma.bankAccount.create({
        data: {
          bankItemId: bankItem.id,
          plaidAccountId: account.account_id,
          name: account.name,
          officialName: account.official_name || null,
          mask: account.mask || null,
          subtype: account.subtype || null,
          type: account.type || null,
          currency: (account.balance?.iso_currency_code || 'USD').toUpperCase(),
        },
      });
    }

    return bankItem;
  } catch (error) {
    console.error('Error creating sandbox item:', error);
    throw error;
  }
}

/**
 * Sync transactions using Plaid /transactions/sync API with cursor pagination
 * This is the modern, recommended approach that handles real-time updates efficiently
 */
export async function syncTransactions({ days }: { days: number }) {
  const results = {
    totalInserted: 0,
    totalUpdated: 0,
    totalRemoved: 0,
    webhookFired: false,
    perAccount: [] as Array<{
      accountId: string;
      inserted: number;
      updated: number;
    }>,
  };

  try {
    const bankItems = await prisma.bankItem.findMany({
      include: {
        accounts: true,
      },
    });

    if (bankItems.length === 0) {
      console.log('⚠️  No bank items found - please connect a bank account first');
      return results;
    }

    for (const item of bankItems) {
      console.log(`Syncing transactions for item: ${item.itemId}`);

      // In sandbox mode, fire webhook to generate test transactions if this is first sync
      const hasExistingTransactions = await prisma.plaidTransaction.count({
        where: {
          bankAccount: {
            bankItemId: item.id,
          },
        },
      });

      if (process.env.PLAID_ENV === 'sandbox' && hasExistingTransactions === 0) {
        try {
          console.log('🔥 Firing Plaid sandbox webhook to generate test transactions...');
          await plaidClient.sandboxItemFireWebhook({
            access_token: item.accessToken,
            webhook_code: 'DEFAULT_UPDATE' as any,
          });
          results.webhookFired = true;
          console.log('✅ Sandbox webhook fired - waiting 2s for data...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        } catch (error: any) {
          console.warn('Sandbox webhook fire failed (non-fatal):', error.message);
        }
      }

      // Use transactions/sync API with cursor pagination
      let cursor = item.syncCursor || undefined;
      let hasMore = true;
      let added: any[] = [];
      let modified: any[] = [];
      let removed: any[] = [];

      try {
        // Fetch all updates since last sync using cursor pagination
        while (hasMore) {
          const syncResponse = await plaidClient.transactionsSync({
            access_token: item.accessToken,
            cursor,
            count: 500, // Max per request
          });

          added = added.concat(syncResponse.data.added);
          modified = modified.concat(syncResponse.data.modified);
          removed = removed.concat(syncResponse.data.removed);

          hasMore = syncResponse.data.has_more;
          cursor = syncResponse.data.next_cursor;
        }

        // Update cursor for next sync (idempotency)
        await prisma.bankItem.update({
          where: { id: item.id },
          data: { syncCursor: cursor },
        });

        console.log(`Plaid sync for ${item.itemId}: ${added.length} added, ${modified.length} modified, ${removed.length} removed`);

        // Process added transactions
        for (const transaction of added) {
          const account = item.accounts.find(a => a.plaidAccountId === transaction.account_id);
          if (!account) continue;

          const amountMinor = BigInt(Math.round(transaction.amount * 100));
          const currency = (transaction.iso_currency_code || 'USD').toUpperCase();

          await prisma.plaidTransaction.upsert({
            where: { id: transaction.transaction_id },
            update: {
              name: transaction.name,
              amountMinor,
              currency,
              pending: transaction.pending,
              merchantName: transaction.merchant_name || null,
              category: transaction.personal_finance_category?.primary || null,
              counterpart: transaction.counterparties?.[0]?.name || null,
              isoCurrencyCode: transaction.iso_currency_code || null,
              updatedAt: new Date(),
            },
            create: {
              id: transaction.transaction_id,
              bankAccountId: account.id,
              date: new Date(transaction.date),
              name: transaction.name,
              amountMinor,
              currency,
              pending: transaction.pending,
              merchantName: transaction.merchant_name || null,
              category: transaction.personal_finance_category?.primary || null,
              counterpart: transaction.counterparties?.[0]?.name || null,
              isoCurrencyCode: transaction.iso_currency_code || null,
            },
          });

          results.totalInserted++;
        }

        // Process modified transactions
        for (const transaction of modified) {
          const amountMinor = BigInt(Math.round(transaction.amount * 100));
          const currency = (transaction.iso_currency_code || 'USD').toUpperCase();

          await prisma.plaidTransaction.update({
            where: { id: transaction.transaction_id },
            data: {
              name: transaction.name,
              amountMinor,
              currency,
              pending: transaction.pending,
              merchantName: transaction.merchant_name || null,
              category: transaction.personal_finance_category?.primary || null,
              counterpart: transaction.counterparties?.[0]?.name || null,
              isoCurrencyCode: transaction.iso_currency_code || null,
              updatedAt: new Date(),
            },
          });

          results.totalUpdated++;
        }

        // Process removed transactions (soft delete or mark as removed)
        for (const removed_tx of removed) {
          await prisma.plaidTransaction.deleteMany({
            where: { id: removed_tx.transaction_id },
          });

          results.totalRemoved++;
        }
      } catch (error: any) {
        console.error(`Error syncing item ${item.itemId}:`, error.response?.data || error.message);
        // Continue with other items
      }
    }

    console.log(`✅ Plaid sync complete: ${results.totalInserted} inserted, ${results.totalUpdated} updated, ${results.totalRemoved} removed`);

    return results;
  } catch (error: any) {
    console.error('Fatal error syncing transactions:', error);
    throw error;
  }
}