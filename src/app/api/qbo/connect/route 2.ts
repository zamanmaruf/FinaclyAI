import { NextResponse } from 'next/server';
import { buildAuthUrl, generateState } from '@/server/qbo/oauth';
import { storeState } from '@/server/qbo/state';

export async function GET() {
  try {
    // Generate a cryptographically random state parameter for CSRF protection
    const state = generateState();
    
    // Store state for validation in callback
    storeState(state);
    
    const authUrl = buildAuthUrl(state);
    
    // Log the full URL server-side for quick inspection
    console.log('🔗 QBO Connect - Full OAuth URL:', authUrl);
    
    // Return 302 redirect to the authorize URL
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('OAuth connect error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to initiate OAuth flow' },
      { status: 500 }
    );
  }
}