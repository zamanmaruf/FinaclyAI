import { NextRequest, NextResponse } from 'next/server';
import { syncTransactions } from '@/server/plaid';

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const days = Number(url.searchParams.get('days') ?? '30');

  try {
    const result = await syncTransactions({ days });
    return NextResponse.json({
      ok: true,
      totals: {
        totalTransactions: result.totalTransactions,
        insertedTransactions: result.insertedTransactions,
        updatedTransactions: result.updatedTransactions,
      },
      perAccount: result.perAccount,
    });
  } catch (error) {
    console.error('Transaction sync error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
