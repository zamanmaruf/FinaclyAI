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

    // Test with the most basic endpoint - just the company info
    const baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
    const url = `${baseUrl}/${realmId}/companyinfo?minorversion=${env.QBO_MINOR_VERSION}`;

    console.log('Testing simple CompanyInfo:', url);
    console.log('Token (first 50 chars):', token.accessToken.substring(0, 50) + '...');

    try {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`,
        },
        timeout: 15000,
      });

      return NextResponse.json({
        ok: true,
        success: true,
        status: response.status,
        url: url,
        data: response.data
      });

    } catch (error: any) {
      const errorDetails = {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        headers: {
          authorization: error.config?.headers?.Authorization?.substring(0, 50) + '...',
          accept: error.config?.headers?.Accept
        }
      };

      console.error('API Error Details:', errorDetails);

      return NextResponse.json({
        ok: false,
        error: 'API call failed',
        details: errorDetails
      });
    }

  } catch (error) {
    console.error('Test simple error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
