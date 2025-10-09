import { NextRequest, NextResponse } from 'next/server';
import { getActiveToken, validateToken } from '@/server/qbo/store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realmId = searchParams.get('realmId');

    if (!realmId) {
      return NextResponse.json({ ok: false, error: 'Missing realmId parameter' }, { status: 400 });
    }

    const token = await getActiveToken(realmId);
    if (!token) {
      return NextResponse.json({ ok: false, error: 'No token found' }, { status: 400 });
    }

    // Enhanced token validation
    const validation = validateToken({
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      tokenType: token.tokenType,
      expiresAt: token.expiresAt,
      realmId: realmId
    });

    const now = new Date();
    const minutesUntilExpiry = Math.round((token.expiresAt.getTime() - now.getTime()) / (1000 * 60));

    return NextResponse.json({
      ok: true,
      token: {
        exists: true,
        expiresAt: token.expiresAt.toISOString(),
        isExpired: validation.isExpired,
        minutesUntilExpiry,
        tokenLength: token.accessToken.length,
        refreshTokenLength: token.refreshToken.length,
        tokenType: token.tokenType,
        validation: validation
      },
      realmId,
      recommendations: {
        usePlayground: validation.tokenType === 'playground' ? 
          "Token appears to be from OAuth Playground - this is normal for testing" :
          "For API testing, use Intuit OAuth Playground",
        playgroundUrl: "https://developer.intuit.com/v2/OAuth2Playground/",
        nextSteps: validation.tokenType === 'playground' ? [
          "1. Token is from OAuth Playground (expected for testing)",
          "2. Test API endpoints directly with this token",
          "3. If API calls fail, check cluster configuration",
          "4. Consider using production OAuth flow for full testing"
        ] : [
          "1. Token appears to be from production OAuth flow",
          "2. Test API endpoints directly",
          "3. If issues persist, check company permissions",
          "4. Verify the company is on the correct cluster"
        ]
      }
    });
  } catch (error) {
    console.error('Validate token error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
