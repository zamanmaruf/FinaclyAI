import { NextRequest, NextResponse } from 'next/server';
import { qboGet } from '@/server/qbo/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realmId = searchParams.get('realmId');

    if (!realmId) {
      return NextResponse.json({ ok: false, error: 'Missing realmId parameter' }, { status: 400 });
    }

    // Call GET /v3/company/{realmId}/companyinfo/{realmId} as requested
    const companyInfo = await qboGet<{ CompanyInfo: any }>(realmId, `companyinfo/${realmId}`);

    return NextResponse.json({
      ok: true,
      realmId,
      companyInfo: companyInfo.CompanyInfo
    });

  } catch (error) {
    console.error('QBO company error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
