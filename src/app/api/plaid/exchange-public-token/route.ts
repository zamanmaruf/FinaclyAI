import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/server/plaidClient';
import { prisma } from '@/server/db';

/**
 * Exchange Plaid Link public_token for access_token and store the item
 * This runs after user successfully completes Plaid Link flow
 */
export async function POST(request: NextRequest) {
  try {
    const { public_token, institution_id, institution_name } = await request.json();

    if (!public_token) {
      return NextResponse.json(
        { error: 'Missing public_token' },
        { status: 400 }
      );
    }

    console.log('Exchanging public token for access token...');

    // Exchange public token for access token
    const exchangeResponse = await plaidClient.itemPublicTokenExchange({
      public_token,
    });

    const accessToken = exchangeResponse.data.access_token;
    const itemId = exchangeResponse.data.item_id;

    console.log(`✅ Token exchange successful - itemId: ${itemId}`);

    // Fetch accounts for this item
    const accountsResponse = await plaidClient.accountsGet({
      access_token: accessToken,
    });

    const accounts = accountsResponse.data.accounts;

    // Store BankItem with idempotency (upsert by itemId)
    const bankItem = await prisma.bankItem.upsert({
      where: { itemId },
      update: {
        accessToken,
        institutionName: institution_name || 'Unknown Institution',
        updatedAt: new Date(),
      },
      create: {
        itemId,
        accessToken,
        institutionName: institution_name || 'Unknown Institution',
      },
    });

    console.log(`✅ BankItem stored: ${bankItem.id}`);

    // Store or update accounts
    for (const account of accounts) {
      await prisma.bankAccount.upsert({
        where: {
          bankItemId_plaidAccountId: {
            bankItemId: bankItem.id,
            plaidAccountId: account.account_id,
          },
        },
        update: {
          name: account.name,
          officialName: account.official_name || null,
          mask: account.mask || null,
          subtype: account.subtype || null,
          type: account.type,
          currency: (account.balances?.iso_currency_code || 'USD').toUpperCase(),
        },
        create: {
          bankItemId: bankItem.id,
          plaidAccountId: account.account_id,
          name: account.name,
          officialName: account.official_name || null,
          mask: account.mask || null,
          subtype: account.subtype || null,
          type: account.type,
          currency: (account.balances?.iso_currency_code || 'USD').toUpperCase(),
        },
      });
    }

    console.log(`✅ ${accounts.length} accounts stored`);

    return NextResponse.json({
      ok: true,
      itemId: bankItem.id,
      institutionName: bankItem.institutionName,
      accountsCount: accounts.length,
    });
  } catch (error: any) {
    console.error('Error exchanging public token:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to exchange token', 
        details: error.response?.data?.error_message || error.message 
      },
      { status: 500 }
    );
  }
}

