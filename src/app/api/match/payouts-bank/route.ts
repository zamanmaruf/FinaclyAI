import { NextRequest, NextResponse } from 'next/server';
import { matchPayoutsToBank } from '../../../../server/matching';

export async function POST(request: NextRequest) {
  try {
    const result = await matchPayoutsToBank({ dateToleranceDays: 2 });

    return NextResponse.json({
      ok: true,
      scanned: result.scanned,
      matchedCount: result.matchedCount,
      ambiguous: result.ambiguousCount,
      exceptionsCreated: result.exceptionsCreated,
      unmatchedPayouts: result.unmatchedPayouts,
    });
  } catch (error) {
    console.error('Matching error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to match payouts to bank transactions' },
      { status: 500 }
    );
  }
}