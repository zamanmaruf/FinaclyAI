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
      return NextResponse.json({ 
        ok: true, 
        realmId: result.realmId,
        companyName: result.companyName 
      }, { status: 200 });
    } else {
      // Map internal errors to proper HTTP status codes
      const httpStatus = result.status >= 500 ? 502 : result.status === 401 || result.status === 403 ? 503 : result.status;
      
      return NextResponse.json(
        { ok: false, error: result.code, code: result.code, message: result.message },
        { status: httpStatus }
      );
    }
  } catch (error) {
    console.error('QBO ping error:', error);
    return NextResponse.json(
      { ok: false, error: 'QBO_PING_ERROR', code: 'QBO_PING_ERROR', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 502 }
    );
  }
}
