import { NextRequest, NextResponse } from 'next/server';
import { exchangeCode } from '@/server/qbo/oauth';
import { saveToken } from '@/server/qbo/store';
import { validateState } from '@/server/qbo/state';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Extract all parameters
    const code = searchParams.get('code');
    const realmId = searchParams.get('realmId');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    
    // Handle OAuth errors from Intuit first
    if (error) {
      console.error('OAuth error from Intuit:', { error, errorDescription });
      
      // Provide helpful error messages for common OAuth errors
      let userMessage = 'OAuth authorization failed';
      if (error === 'access_denied') {
        userMessage = 'User declined to authorize the application';
      } else if (error === 'invalid_request') {
        userMessage = 'Invalid OAuth request - check your app configuration';
      } else if (error === 'unsupported_response_type') {
        userMessage = 'Unsupported response type - check OAuth configuration';
      } else if (error === 'invalid_scope') {
        userMessage = 'Invalid scope requested - check app permissions';
      }
      
      return NextResponse.json({
        ok: false,
        error: error,
        error_description: errorDescription || 'No additional details provided',
        user_message: userMessage,
        troubleshooting: {
          step1: 'Verify your app is properly configured in Intuit Developer Dashboard',
          step2: 'Check that redirect URI matches exactly',
          step3: 'Ensure requested scopes are enabled for your app',
          step4: 'Try the OAuth flow again'
        }
      }, { status: 400 });
    }

    // If user declined and no code is present, return helpful message
    if (!code) {
      return NextResponse.json({
        ok: false,
        error: 'Authorization declined',
        message: 'User declined to authorize the application or there was an OAuth error'
      }, { status: 400 });
    }

    // Validate state parameter to prevent CSRF
    console.log('🔍 Validating state parameter:', state ? `${state.substring(0, 8)}...` : 'undefined');
    
    if (!state || !validateState(state)) {
      console.log('❌ State validation failed for state:', state ? `${state.substring(0, 8)}...` : 'undefined');
      return NextResponse.json({
        ok: false,
        error: 'Invalid state parameter',
        message: 'CSRF protection: state parameter mismatch. Please restart the OAuth flow.',
        troubleshooting: {
          step1: 'The OAuth flow was likely interrupted or the server was restarted',
          step2: 'Go back to /api/qbo/connect to start a fresh OAuth flow',
          step3: 'Complete the entire flow without interruption'
        }
      }, { status: 400 });
    }

    if (!realmId) {
      return NextResponse.json({
        ok: false,
        error: 'Missing realmId parameter',
        message: 'QuickBooks company ID not provided'
      }, { status: 400 });
    }

    // Exchange code for tokens
    const tokenData = await exchangeCode(code, realmId);
    
    // Save tokens to database
    await saveToken(realmId, tokenData);

    // Calculate minutes until expiry
    const now = new Date();
    const expiresAt = tokenData.expiresAt;
    const minutesUntilExpiry = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / (1000 * 60)));

    return NextResponse.json({
      ok: true,
      realmId,
      minutesUntilExpiry
    });

  } catch (error) {
    console.error('QBO callback error:', error);
    
    return NextResponse.json({
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
