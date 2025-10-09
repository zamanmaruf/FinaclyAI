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

    // Test the correct CompanyInfo endpoint structure
    const baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
    const testUrls = [
      // Option 1: companyinfo/{realmId} (what we're currently using)
      `${baseUrl}/${realmId}/companyinfo/${realmId}?minorversion=${env.QBO_MINOR_VERSION}`,
      
      // Option 2: just companyinfo (without realmId in path)
      `${baseUrl}/${realmId}/companyinfo?minorversion=${env.QBO_MINOR_VERSION}`,
      
      // Option 3: companyinfo with different structure
      `${baseUrl}/${realmId}/companyinfo/${realmId}?minorversion=${env.QBO_MINOR_VERSION}`,
    ];

    const results = [];

    for (let i = 0; i < testUrls.length; i++) {
      try {
        const url = testUrls[i];
        console.log(`Testing URL ${i + 1}: ${url}`);
        
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token.accessToken}`,
          },
          timeout: 10000,
        });

        results.push({
          urlIndex: i + 1,
          url: url,
          status: response.status,
          success: true,
          companyName: response.data?.CompanyInfo?.CompanyName || 'Unknown'
        });
        
        // If successful, return immediately
        return NextResponse.json({
          ok: true,
          workingUrl: url,
          companyName: response.data?.CompanyInfo?.CompanyName || 'Unknown',
          fullResponse: response.data
        });
        
      } catch (error: any) {
        results.push({
          urlIndex: i + 1,
          url: testUrls[i],
          status: error.response?.status || 'timeout',
          success: false,
          error: error.response?.data?.Fault?.Error?.[0]?.Detail || error.message
        });
      }
    }

    return NextResponse.json({
      ok: false,
      message: 'All URL variations failed',
      results
    });
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
