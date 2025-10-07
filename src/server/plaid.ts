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
      for (const account of item.accounts) {
        let inserted = 0;
        let updated = 0;

        try {
          // Calculate start date
          const startDate = new Date();
          startDate.setDate(startDate.getDate() - days);

          // Get transactions
          const transactionsResponse = await plaidClient.transactionsGet({
            access_token: item.accessToken,
            start_date: startDate,
            end_date: new Date(),
            account_ids: [account.plaidAccountId],
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