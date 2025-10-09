import { NextRequest, NextResponse } from 'next/server';
import { getActiveToken } from '@/server/qbo/store';
import axios from 'axios';
import { env } from '@/env';

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

    const baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
    const url = `${baseUrl}/${realmId}/query?query=${encodeURIComponent('select * from Account')}&minorversion=${env.QBO_MINOR_VERSION}`;

    // Log all the details
    console.log('🔍 Debug Auth Details:');
    console.log('URL:', url);
    console.log('Token (first 50 chars):', token.accessToken.substring(0, 50) + '...');
    console.log('Token length:', token.accessToken.length);
    console.log('Token type:', token.tokenType);
    console.log('Expires at:', token.expiresAt.toISOString());
    console.log('Realm ID:', realmId);

    const headers = {
      'Accept': 'application/json',
      'Authorization': `Bearer ${token.accessToken}`,
      'User-Agent': 'FinaclyAI/1.0',
    };

    console.log('Headers:', headers);

    try {
      const response = await axios.get(url, {
        headers,
        timeout: 15000,
        validateStatus: () => true, // Don't throw on HTTP errors
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.status === 200) {
        return NextResponse.json({
          ok: true,
          success: true,
          status: response.status,
          data: response.data,
          url: url,
          tokenInfo: {
            length: token.accessToken.length,
            type: token.tokenType,
            expiresAt: token.expiresAt.toISOString()
          }
        });
      } else {
        return NextResponse.json({
          ok: false,
          status: response.status,
          statusText: response.statusText,
          data: response.data,
          url: url,
          headers: headers,
          tokenInfo: {
            length: token.accessToken.length,
            type: token.tokenType,
            expiresAt: token.expiresAt.toISOString()
          }
        });
      }

    } catch (error: any) {
      console.error('Axios error:', error.message);
      
      return NextResponse.json({
        ok: false,
        error: error.message,
        response: error.response?.data,
        status: error.response?.status,
        url: url,
        headers: headers,
        tokenInfo: {
          length: token.accessToken.length,
          type: token.tokenType,
          expiresAt: token.expiresAt.toISOString()
        }
      });
    }

  } catch (error) {
    console.error('Debug auth error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
