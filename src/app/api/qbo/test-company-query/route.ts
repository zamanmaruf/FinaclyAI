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
    
    // Test different query approaches for company info
    const queries = [
      'select * from CompanyInfo',
      'select * from Company', 
      'select * from CompanyInfo where id = \'1\'',
      'select * from Company where id = \'1\''
    ];

    for (const query of queries) {
      try {
        const url = `${baseUrl}/${realmId}/query?query=${encodeURIComponent(query)}&minorversion=${env.QBO_MINOR_VERSION}`;
        console.log(`Testing query: ${query}`);
        console.log(`URL: ${url}`);

        const response = await axios.get(url, {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token.accessToken}`,
          },
          timeout: 10000,
        });

        return NextResponse.json({
          ok: true,
          success: true,
          query: query,
          url: url,
          data: response.data
        });

      } catch (error: any) {
        console.log(`Query failed: ${query} - ${error.response?.data?.Fault?.Error?.[0]?.Detail || error.message}`);
        continue;
      }
    }

    // If all queries fail, try a simple account query to test basic connectivity
    try {
      const accountUrl = `${baseUrl}/${realmId}/query?query=${encodeURIComponent('select * from Account')}&minorversion=${env.QBO_MINOR_VERSION}`;
      console.log('Testing basic Account query for connectivity...');

      const response = await axios.get(accountUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`,
        },
        timeout: 10000,
      });

      return NextResponse.json({
        ok: true,
        success: true,
        message: 'Basic connectivity works, but CompanyInfo queries failed',
        testQuery: 'select * from Account',
        url: accountUrl,
        accountCount: response.data?.QueryResponse?.Account?.length || 0
      });

    } catch (error: any) {
      return NextResponse.json({
        ok: false,
        message: 'All queries failed - possible authentication or configuration issue',
        error: error.response?.data?.Fault?.Error?.[0]?.Detail || error.message,
        testedQueries: queries
      });
    }

  } catch (error) {
    console.error('Test company query error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
