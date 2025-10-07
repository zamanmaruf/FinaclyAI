import { NextRequest, NextResponse } from 'next/server';
import { ensureSandboxItem } from '../../../../server/plaid';
import { prisma } from '../../../../server/db';

export async function POST(request: NextRequest) {
  try {
    const item = await ensureSandboxItem();
    
    // Get accounts for the item
    const accounts = await prisma.bankAccount.findMany({
      where: { bankItemId: item.id },
      select: {
        plaidAccountId: true,
        name: true,
        officialName: true,
        currency: true,
      },
    });

    return NextResponse.json({
      ok: true,
      itemId: item.itemId,
      accounts,
    });
  } catch (error) {
    console.error('Sandbox link error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to create sandbox link' },
      { status: 500 }
    );
  }
}