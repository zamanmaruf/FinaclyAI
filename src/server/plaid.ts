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

export async function syncTransactions({ days }: { days: number }) {
  const results = {
    totalInserted: 0,
    totalUpdated: 0,
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

    for (const item of bankItems) {
      // Check if this item has never synced transactions in sandbox
      const hasExistingTransactions = await prisma.plaidTransaction.count({
        where: {
          bankAccount: {
            bankItemId: item.id,
          },
        },
      });

      // In sandbox, fire webhook if no transactions exist yet
      if (process.env.PLAID_ENV === 'sandbox' && hasExistingTransactions === 0) {
        try {
          console.log('🔥 Firing Plaid sandbox webhook for item:', item.itemId);
          await plaidClient.sandboxTransactionsFireWebhook({
            access_token: item.accessToken,
          });
          results.webhookFired = true;
          console.log('✅ Plaid sandbox webhook fired successfully');
        } catch (error) {
          console.error('Failed to fire Plaid sandbox webhook:', error);
          // Continue with sync even if webhook fails
        }
      }

      for (const account of item.accounts) {
        let inserted = 0;
        let updated = 0;

        try {
          // Calculate start date
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);

          // Get transactions with pagination support
          let hasMore = true;
          let cursor = null;
          let passCount = 0;
          const maxPasses = 2; // Allow up to 2 passes to let webhook data populate

          while (hasMore && passCount < maxPasses) {
            passCount++;
            console.log(`Plaid sync pass ${passCount} for account ${account.plaidAccountId}`);

            const transactionsResponse = await plaidClient.transactionsGet({
              access_token: item.accessToken,
              start_date: startDate,
              end_date: new Date(),
              account_ids: [account.plaidAccountId],
              cursor: cursor || undefined,
            });

            // Process transactions
            for (const transaction of transactionsResponse.data.transactions) {
              const amountMinor = BigInt(Math.round(transaction.amount * 100));
              const currency = (transaction.iso_currency_code || 'USD').toUpperCase();

              const upsertResult = await prisma.plaidTransaction.upsert({
                where: { id: transaction.transaction_id },
                update: {
                  name: transaction.name,
                  amountMinor,
                  currency,
                  pending: transaction.pending,
                  merchantName: transaction.merchant_name || null,
                  category: transaction.category ? transaction.category.join(', ') : null,
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
                  category: transaction.category ? transaction.category.join(', ') : null,
                  counterpart: transaction.counterparties?.[0]?.name || null,
                  isoCurrencyCode: transaction.iso_currency_code || null,
                },
              });

              if (upsertResult.createdAt.getTime() === upsertResult.updatedAt.getTime()) {
                inserted++;
              } else {
                updated++;
              }
            }

            // Check if there are more transactions
            hasMore = transactionsResponse.data.has_more;
            cursor = transactionsResponse.data.next_cursor;

            // If we got transactions or no more data, we're done
            if (transactionsResponse.data.transactions.length > 0 || !hasMore) {
              break;
            }

            // If no transactions on first pass and webhook was fired, wait a moment before retry
            if (passCount === 1 && transactionsResponse.data.transactions.length === 0 && results.webhookFired) {
              console.log('⏳ Waiting for webhook data to populate...');
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          }

          results.perAccount.push({
            accountId: account.plaidAccountId,
            inserted,
            updated,
          });

          results.totalInserted += inserted;
          results.totalUpdated += updated;
        } catch (error) {
          console.error(`Error syncing account ${account.plaidAccountId}:`, error);
          // Continue with other accounts
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error syncing transactions:', error);
    throw error;
  }
}