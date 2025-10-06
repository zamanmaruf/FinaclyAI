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

    // Get token
    const token = await getActiveToken(realmId);
    if (!token) {
      return NextResponse.json({ ok: false, error: 'No token found' }, { status: 400 });
    }

    // Build the API URL manually to debug
    const baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
    const path = `companyinfo/${realmId}`;
    let url = `${baseUrl}/${realmId}/${path}`;
    url += `?minorversion=${env.QBO_MINOR_VERSION}`;

    console.log('🔍 Debug API URL:', url);
    console.log('🔍 Access Token (first 20 chars):', token.accessToken.substring(0, 20) + '...');

    // Make the request manually
    const response = await axios.get(url, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token.accessToken}`,
      },
    });

    return NextResponse.json({
      ok: true,
      url,
      status: response.status,
      data: response.data,
    });
  } catch (error: any) {
    console.error('Debug API error:', error);
    
    return NextResponse.json({
      ok: false,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      url: error.config?.url,
      headers: error.config?.headers,
    }, { status: 500 });
  }
}
