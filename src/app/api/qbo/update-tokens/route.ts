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

    // Save the fresh token from playground
    await saveToken(realmId, {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresAt,
    });

    console.log('✅ Fresh tokens saved from playground for realmId:', realmId);

    return NextResponse.json({
      ok: true,
      realmId,
      message: 'Fresh tokens saved successfully',
      expiresAt: expiresAt.toISOString(),
      nextStep: 'Now test the API endpoints with fresh tokens'
    });
  } catch (error) {
    console.error('Update tokens error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
