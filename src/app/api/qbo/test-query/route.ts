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

    // Test with a simple query endpoint first
    const baseUrl = 'https://sandbox-quickbooks.api.intuit.com/v3/company';
    
    // Test 1: Simple CompanyInfo query
    const companyInfoQuery = `select * from CompanyInfo`;
    const companyInfoUrl = `${baseUrl}/${realmId}/query?query=${encodeURIComponent(companyInfoQuery)}&minorversion=${env.QBO_MINOR_VERSION}`;
    
    // Test 2: Account query (should work based on docs)
    const accountQuery = `select * from Account`;
    const accountUrl = `${baseUrl}/${realmId}/query?query=${encodeURIComponent(accountQuery)}&minorversion=${env.QBO_MINOR_VERSION}`;

    console.log('Testing CompanyInfo query:', companyInfoUrl);
    console.log('Testing Account query:', accountUrl);

    const results = [];

    // Test CompanyInfo query
    try {
      const response = await axios.get(companyInfoUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`,
        },
        timeout: 10000,
      });

      results.push({
        test: 'CompanyInfo Query',
        success: true,
        status: response.status,
        data: response.data
      });

      return NextResponse.json({
        ok: true,
        workingEndpoint: 'CompanyInfo Query',
        companyInfo: response.data,
        url: companyInfoUrl
      });

    } catch (error: any) {
      results.push({
        test: 'CompanyInfo Query',
        success: false,
        error: error.response?.data?.Fault?.Error?.[0]?.Detail || error.message
      });
    }

    // Test Account query
    try {
      const response = await axios.get(accountUrl, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token.accessToken}`,
        },
        timeout: 10000,
      });

      results.push({
        test: 'Account Query',
        success: true,
        status: response.status,
        accountCount: response.data?.QueryResponse?.Account?.length || 0
      });

      return NextResponse.json({
        ok: true,
        workingEndpoint: 'Account Query',
        accounts: response.data,
        url: accountUrl
      });

    } catch (error: any) {
      results.push({
        test: 'Account Query',
        success: false,
        error: error.response?.data?.Fault?.Error?.[0]?.Detail || error.message
      });
    }

    return NextResponse.json({
      ok: false,
      message: 'All query tests failed',
      results
    });

  } catch (error) {
    console.error('Test query error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
