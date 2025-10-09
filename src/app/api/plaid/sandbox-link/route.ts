import { NextRequest, NextResponse } from 'next/server';
import { ensureSandboxItem } from '../../../../server/plaid';
import { prisma } from '../../../../server/db';
import { env } from '@/env';

export async function POST(request: NextRequest) {
  // Guard: forbid in production
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json(
      { error: 'FORBIDDEN', message: 'Sandbox link not available in production' },
      { status: 403 }
    );
  }

  // Require admin token in non-dev environments
  if (env.SHARED_ADMIN_TOKEN) {
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token !== env.SHARED_ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'UNAUTHORIZED', message: 'Invalid or missing SHARED_ADMIN_TOKEN' },
        { status: 401 }
      );
    }
  }

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