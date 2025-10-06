import { NextRequest, NextResponse } from 'next/server';
import { qboGet } from '@/server/qbo/client';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realmId = searchParams.get('realmId');

    if (!realmId) {
      return NextResponse.json({ ok: false, error: 'Missing realmId parameter' }, { status: 400 });
    }

    // Run SQL-like query as requested: select Id,Name,AccountType from Account maxresults 200
    const query = 'select Id,Name,AccountType from Account maxresults 200';
    const accounts = await qboGet<{ QueryResponse: { Account?: any[] } }>(realmId, `query?query=${encodeURIComponent(query)}`);

    return NextResponse.json({
      ok: true,
      realmId,
      accounts: accounts.QueryResponse?.Account || [],
      count: accounts.QueryResponse?.Account?.length || 0
    });

  } catch (error) {
    console.error('QBO accounts error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}