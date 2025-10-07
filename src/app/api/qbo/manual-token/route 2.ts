import { NextRequest, NextResponse } from 'next/server';
import { saveToken } from '@/server/qbo/store';

export async function POST(request: NextRequest) {
  try {
    const { accessToken, refreshToken, realmId, expiresIn } = await request.json();

    if (!accessToken || !refreshToken || !realmId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing required fields: accessToken, refreshToken, realmId'
      }, { status: 400 });
    }

    // Calculate expiresAt from expiresIn (in seconds)
    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (expiresIn || 3600));

    // Save the token from playground
    await saveToken(realmId, {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresAt,
    });

    console.log('✅ Manual token saved for realmId:', realmId);

    return NextResponse.json({
      ok: true,
      realmId,
      message: 'Token saved successfully from playground',
      expiresAt: expiresAt.toISOString()
    });
  } catch (error) {
    console.error('Manual token error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
