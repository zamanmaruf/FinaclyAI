import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const response = await fetch('https://sandbox.plaid.com/institutions/get', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID!,
        'PLAID-SECRET': process.env.PLAID_SECRET!,
        'PLAID-VERSION': '2020-09-14',
      },
      body: JSON.stringify({
        count: 10,
        offset: 0,
        country_codes: ['US'],
      }),
    });

    const data = await response.json();
    
    if (response.ok) {
      return NextResponse.json({
        ok: true,
        institutions: data.institutions?.map((inst: any) => ({
          institution_id: inst.institution_id,
          name: inst.name,
          products: inst.products,
        })) || [],
      });
    } else {
      return NextResponse.json({
        ok: false,
        error: data.error_message || 'Failed to get institutions',
      }, { status: response.status });
    }
  } catch (error) {
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 });
  }
}
