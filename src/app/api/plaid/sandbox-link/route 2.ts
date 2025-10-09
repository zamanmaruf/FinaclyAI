import { NextResponse } from 'next/server';
import { ensureSandboxItem } from '@/server/plaid';
import { db } from '@/server/db';

export async function POST() {
  try {
    const bankItem = await ensureSandboxItem();
    
    // Get accounts for this item
    const accounts = await db.bankAccount.findMany({
      where: { bankItemId: bankItem.id },
      select: {
        id: true,
        name: true,
        plaidAccountId: true,
        currency: true,
      },
    });

    return NextResponse.json({
      ok: true,
      itemId: bankItem.id,
      institutionName: bankItem.institutionName,
      accounts: accounts,
    });
  } catch (error) {
    console.error('Sandbox link error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
