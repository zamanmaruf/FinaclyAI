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

    // Test different cluster URLs
    const clusters = [
      'https://sandbox-quickbooks.api.intuit.com/v3/company',
      'https://appcenter.intuit.com/v3/company', 
      'https://sandbox.api.intuit.com/v3/company',
      'https://quickbooks.api.intuit.com/v3/company',
      // Try with different subdomains
      'https://sandbox-quickbooks.api.intuit.com/v3/company',
      'https://quickbooks.api.intuit.com/v3/company',
    ];

    const results = [];

    for (let i = 0; i < clusters.length; i++) {
      const baseUrl = clusters[i];
      const url = `${baseUrl}/${realmId}/query?query=${encodeURIComponent('select * from Account')}&minorversion=${env.QBO_MINOR_VERSION}`;

      try {
        console.log(`Testing cluster ${i + 1}: ${baseUrl}`);
        
        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token.accessToken}`,
          },
          timeout: 10000,
          validateStatus: () => true, // Don't throw on HTTP errors
        });

        results.push({
          cluster: baseUrl,
          status: response.status,
          success: response.status === 200,
          error: response.status !== 200 ? response.data : null
        });

        // If successful, return immediately
        if (response.status === 200) {
          return NextResponse.json({
            ok: true,
            success: true,
            workingCluster: baseUrl,
            status: response.status,
            accountCount: response.data?.QueryResponse?.Account?.length || 0,
            data: response.data,
            allResults: results
          });
        }

      } catch (error: any) {
        results.push({
          cluster: baseUrl,
          status: error.response?.status || 'timeout',
          success: false,
          error: error.message
        });
      }
    }

    return NextResponse.json({
      ok: false,
      message: 'No working cluster found',
      realmId: realmId,
      results: results,
      recommendation: 'Check if this realmId is on a different cluster or if the company is properly set up'
    });

  } catch (error) {
    console.error('Find cluster error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
