import { NextRequest, NextResponse } from 'next/server';
import { getActiveToken } from '@/server/qbo/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realmId = searchParams.get('realmId');

    if (!realmId) {
      return NextResponse.json({ ok: false, error: 'Missing realmId parameter' }, { status: 400 });
    }

    const token = await getActiveToken(realmId);
    
    if (!token) {
      return NextResponse.json({
        connected: false,
        realmId,
        minutesUntilExpiry: 0,
        hasRefreshToken: false,
        lastRefreshedAt: null
      });
    }

    // Calculate minutes until expiry
    const now = new Date();
    const expiresAt = token.expiresAt;
    const minutesUntilExpiry = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60)));

    return NextResponse.json({
      connected: true,
      realmId,
      minutesUntilExpiry,
      hasRefreshToken: !!token.refreshToken,
      lastRefreshedAt: token.updatedAt
    });

  } catch (error) {
    console.error('QBO status error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}