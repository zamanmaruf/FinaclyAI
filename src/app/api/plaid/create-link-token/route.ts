import { NextRequest, NextResponse } from 'next/server';
import { plaidClient } from '@/server/plaidClient';
import { env } from '@/env';
import { CountryCode, Products } from 'plaid';

/**
 * Create a Plaid Link token for frontend Link flow
 * This is the proper way to integrate Plaid - NOT direct sandbox public_token creation
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { userId } = body;

    // Parse configured products and country codes
    const products = env.PLAID_PRODUCTS.split(',').map(p => p.trim()) as Products[];
    const countryCodes = env.PLAID_COUNTRY_CODES.split(',').map(c => c.trim().toUpperCase()) as CountryCode[];

    const configs = {
      user: {
        // In production, this should be a real user ID from your auth system
        client_user_id: userId || 'finacly-user-' + Date.now(),
      },
      client_name: 'Finacly AI',
      products,
      country_codes: countryCodes,
      language: 'en',
      ...(env.PLAID_REDIRECT_URI && { redirect_uri: env.PLAID_REDIRECT_URI }),
    };

    console.log('Creating Plaid Link token with config:', {
      products,
      countryCodes,
      environment: env.PLAID_ENV,
    });

    const response = await plaidClient.linkTokenCreate(configs);

    return NextResponse.json({
      link_token: response.data.link_token,
      expiration: response.data.expiration,
    });
  } catch (error: any) {
    console.error('Error creating link token:', error.response?.data || error.message);
    
    return NextResponse.json(
      { 
        error: 'Failed to create link token', 
        details: error.response?.data?.error_message || error.message 
      },
      { status: 500 }
    );
  }
}

