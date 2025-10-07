import { NextRequest, NextResponse } from 'next/server';
import { syncTransactions } from '../../../../server/plaid';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30');

    const result = await syncTransactions({ days });

    return NextResponse.json({
      ok: true,
      totals: {
        inserted: result.totalInserted,
        updated: result.totalUpdated,
      },
      perAccount: result.perAccount,
    });
  } catch (error) {
    console.error('Transactions sync error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to sync transactions' },
      { status: 500 }
    );
  }
}