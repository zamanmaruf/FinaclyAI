import { NextRequest, NextResponse } from 'next/server';
import { getActiveToken, saveToken } from '@/server/qbo/store';
import { refreshToken } from '@/server/qbo/oauth';
import axios from 'axios';
import { env } from '@/env';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const realmId = searchParams.get('realmId');

    if (!realmId) {
      return NextResponse.json({ ok: false, error: 'Missing realmId parameter' }, { status: 400 });
    }

    // Get current token
    const currentToken = await getActiveToken(realmId);
    if (!currentToken) {
      return NextResponse.json({ ok: false, error: 'No token found' }, { status: 400 });
    }

    console.log('Current token expires at:', currentToken.expiresAt.toISOString());

    // Try to refresh the token
    try {
      console.log('Attempting to refresh token...');
      const newToken = await refreshToken(currentToken.refreshToken);
      
      // Save the refreshed token
      await saveToken(realmId, {
        accessToken: newToken.accessToken,
        refreshToken: newToken.refreshToken,
        tokenType: newToken.tokenType,
        expiresAt: newToken.expiresAt,
      });

      console.log('Token refreshed successfully');

      // Now test with the new token
      const baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
      const url = `${baseUrl}/${realmId}/query?query=${encodeURIComponent('select * from Account')}&minorversion=${env.QBO_MINOR_VERSION}`;

      console.log('Testing with refreshed token...');

      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${newToken.accessToken}`,
        },
        timeout: 10000,
      });

      return NextResponse.json({
        ok: true,
        success: true,
        message: 'Token refresh successful and API call works',
        newToken: {
          expiresAt: newToken.expiresAt.toISOString(),
          tokenLength: newToken.accessToken.length
        },
        apiResponse: {
          accountCount: response.data?.QueryResponse?.Account?.length || 0,
          url: url
        }
      });

    } catch (refreshError: any) {
      console.error('Token refresh failed:', refreshError.message);

      // Try with original token anyway
      const baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
      const url = `${baseUrl}/${realmId}/query?query=${encodeURIComponent('select * from Account')}&minorversion=${env.QBO_MINOR_VERSION}`;

      try {
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${currentToken.accessToken}`,
          },
          timeout: 10000,
        });

        return NextResponse.json({
          ok: true,
          success: true,
          message: 'Token refresh failed but original token works',
          originalToken: {
            expiresAt: currentToken.expiresAt.toISOString()
          },
          apiResponse: {
            accountCount: response.data?.QueryResponse?.Account?.length || 0,
            url: url
          }
        });

      } catch (apiError: any) {
        return NextResponse.json({
          ok: false,
          message: 'Both token refresh and API call failed',
          refreshError: refreshError.message,
          apiError: apiError.response?.data?.Fault?.Error?.[0]?.Detail || apiError.message
        });
      }
    }

  } catch (error) {
    console.error('Refresh and test error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
