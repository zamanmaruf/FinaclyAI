import { NextRequest, NextResponse } from 'next/server';
import { getActiveToken } from '@/server/qbo/store';
import axios from 'axios';

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

    // Test different sandbox URLs
    const testUrls = [
      'https://sandbox-quickbooks.api.intuit.com/v3/company',
      'https://sandbox.api.intuit.com/v3/company',
      'https://quickbooks.api.intuit.com/v3/company',
    ];

    const results = [];

    for (const baseUrl of testUrls) {
      try {
        const url = `${baseUrl}/${realmId}/companyinfo/${realmId}?minorversion=75`;
        console.log(`Testing URL: ${url}`);
        
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token.accessToken}`,
          },
          timeout: 5000,
        });

        results.push({
          url: baseUrl,
          status: response.status,
          success: true,
          data: response.data
        });
        break; // If successful, stop testing
        
      } catch (error: any) {
        results.push({
          url: baseUrl,
          status: error.response?.status || 'timeout',
          success: false,
          error: error.response?.data?.Fault?.Error?.[0]?.Detail || error.message
        });
      }
    }

    return NextResponse.json({
      ok: true,
      realmId,
      results,
      workingUrl: results.find(r => r.success)?.url || 'None found'
    });
  } catch (error) {
    console.error('Test clusters error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
