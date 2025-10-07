import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getPlaidClient } from '@/server/plaidClient';
import { env } from '@/env';
import { Products, CountryCode } from 'plaid';

const LinkTokenRequestSchema = z.object({
  userId: z.string().min(1, 'userId is required'),
  products: z.array(z.string()).optional(),
  countryCodes: z.array(z.string()).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validation = LinkTokenRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: 'INVALID_INPUT', message: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { userId, products, countryCodes } = validation.data;

    const plaidClient = getPlaidClient();

    // Use provided products or fall back to env config
    const plaidProducts = (products || env.PLAID_PRODUCTS.split(','))
      .filter(p => p) as Products[];

    // Use provided country codes or fall back to env config
    const plaidCountryCodes = (countryCodes || env.PLAID_COUNTRY_CODES.split(','))
      .filter(c => c) as CountryCode[];

    // Create link_token
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'FinaclyAI',
      products: plaidProducts,
      country_codes: plaidCountryCodes,
      language: 'en',
      redirect_uri: env.PLAID_REDIRECT_URI || undefined,
    });

    return NextResponse.json({
      ok: true,
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    });
  } catch (error: any) {
    console.error('Plaid link token creation failed:', error);
    
    return NextResponse.json(
      {
        error: 'PLAID_LINK_TOKEN_ERROR',
        message: error.response?.data?.error_message || error.message || 'Failed to create link token',
      },
      { status: 500 }
    );
  }
}

