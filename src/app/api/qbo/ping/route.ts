import { NextRequest, NextResponse } from 'next/server';
import { qboGet } from '@/server/qbo/client';
import { withQboAccess } from '@/server/qbo/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realmId = searchParams.get('realmId');

    if (!realmId) {
      return NextResponse.json(
        { ok: false, error: 'Missing realmId parameter' },
        { status: 400 }
      );
    }

    const companyInfo = await qboGet<{ CompanyInfo: { CompanyName: string } }>(realmId, `companyinfo/${realmId}`);
    const companyName = companyInfo.CompanyInfo.CompanyName;

    return NextResponse.json({ ok: true, companyName });
  } catch (error) {
    console.error('QBO ping error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
