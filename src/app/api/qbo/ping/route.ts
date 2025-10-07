import { NextRequest, NextResponse } from 'next/server';
import { pingCompany } from '@/server/qbo/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realmId = searchParams.get('realmId');

    if (!realmId) {
      return NextResponse.json(
        { ok: false, code: 'MISSING_REALM_ID', message: 'Missing realmId parameter' },
        { status: 400 }
      );
    }

    const result = await pingCompany(realmId);
    
    if (result.ok) {
      return NextResponse.json({ ok: true, realmId }, { status: 200 });
    } else {
      return NextResponse.json(
        { ok: false, code: result.code, message: result.message },
        { status: result.status }
      );
    }
  } catch (error) {
    console.error('QBO ping error:', error);
    return NextResponse.json(
      { ok: false, code: 'QBO_PING_ERROR', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
