import { NextResponse } from 'next/server';
import { plaidClient } from '@/server/plaidClient';

export async function GET() {
  try {
    console.log('Testing Plaid API...');
    
    // Test a simple API call
    const response = await plaidClient.institutionsGet({
      count: 1,
      offset: 0,
      country_codes: ['US'],
    });
    
    console.log('Plaid response:', response);
    
    return NextResponse.json({
      ok: true,
      institution: response.institutions?.[0]?.name || 'No institutions found',
      totalInstitutions: response.institutions?.length || 0,
    });
  } catch (error: any) {
    console.error('Plaid API error:', error);
    console.error('Error details:', error.response?.data || error.message);
    return NextResponse.json({
      ok: false,
      error: error.response?.data || error.message,
      errorType: error.constructor.name,
    }, { status: 500 });
  }
}
