import { NextResponse } from 'next/server';
import { env } from '@/env';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    const state = randomBytes(16).toString('hex');
    
    // Try with the most basic scope that should always work
    const params = new URLSearchParams({
      client_id: env.QBO_CLIENT_ID,
      redirect_uri: env.QBO_REDIRECT_URI,
      response_type: 'code',
      scope: 'com.intuit.quickbooks.accounting', // Keep the same scope for now
      state: state,
    });
    
    const authUrl = `https://appcenter.intuit.com/connect/oauth2?${params.toString()}`;
    
    console.log('🧪 Minimal OAuth URL:', authUrl);
    
    return NextResponse.json({ 
      ok: true, 
      url: authUrl,
      state: state,
      debug: {
        clientId: env.QBO_CLIENT_ID.substring(0, 8) + '...',
        redirectUri: env.QBO_REDIRECT_URI,
        scope: 'com.intuit.quickbooks.accounting',
        environment: env.INTUIT_ENV
      }
    });
  } catch (error) {
    console.error('❌ QBO connect-minimal error:', error);
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
