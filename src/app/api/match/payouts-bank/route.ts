import { NextRequest, NextResponse } from 'next/server';
import { matchPayoutsToBank } from '@/server/matching';

export async function POST(request: NextRequest) {
  const url = new URL(request.url);
  const dateToleranceDays = Number(url.searchParams.get('dateToleranceDays') ?? '2');

  try {
    const result = await matchPayoutsToBank({ dateToleranceDays });
    return NextResponse.json({
      ok: true,
      matched: result.matchedCount,
      exceptions: result.noMatchCount + result.ambiguousCount,
      details: {
        matchedCount: result.matchedCount,
        noMatchCount: result.noMatchCount,
        ambiguousCount: result.ambiguousCount,
      },
    });
  } catch (error) {
    console.error('Payout matching error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
