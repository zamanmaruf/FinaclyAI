import { env } from '@/env';
import { randomBytes } from 'crypto';
import axios from 'axios';

export function buildAuthUrl(state: string): string {
  // Build OAuth URL with proper parameter encoding
  // Use URLSearchParams to ensure proper encoding of all parameters
  const params = new URLSearchParams({
    client_id: env.QBO_CLIENT_ID,
    redirect_uri: env.QBO_REDIRECT_URI,
    response_type: 'code',
    scope: 'com.intuit.quickbooks.accounting',
    state: state,
  });

  // Construct the full OAuth URL with properly encoded parameters
  const baseUrl = 'https://appcenter.intuit.com/connect/oauth2';
  const authUrl = `${baseUrl}?${params.toString()}`;
  
  console.log('🔗 QBO OAuth URL:', authUrl);
  console.log('🔗 Redirect URI:', env.QBO_REDIRECT_URI);
  console.log('🔗 Client ID:', env.QBO_CLIENT_ID);
  console.log('🔗 Environment:', env.INTUIT_ENV);
  
  return authUrl;
}

export function generateState(): string {
  return randomBytes(32).toString('hex');
}

export async function exchangeCode(code: string, realmId: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: string;
  realmId: string;
}> {
  try {
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    
    // Use URL-encoded form data like the playground
    const formData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: env.QBO_REDIRECT_URI,
    });
    
    const response = await axios.post(tokenUrl, formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: env.QBO_CLIENT_ID,
        password: env.QBO_CLIENT_SECRET,
      },
    });

    const token = response.data;
    
    if (!token.access_token || !token.refresh_token) {
      throw new Error('Invalid token response from Intuit');
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (token.expires_in || 3600));

    console.log('✅ Token exchange successful for realmId:', realmId);

    return {
      accessToken: token.access_token,
      refreshToken: token.refresh_token,
      expiresAt,
      tokenType: token.token_type || 'Bearer',
      realmId,
    };
  } catch (error: any) {
    console.error('Token exchange error:', error.response?.data || error.message);
    
    // Handle specific OAuth errors
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      if (errorData.error === 'invalid_grant') {
        throw new Error('Invalid authorization code. The code may have expired or already been used.');
      } else if (errorData.error === 'invalid_client') {
        throw new Error('Invalid client credentials. Please check your QBO_CLIENT_ID and QBO_CLIENT_SECRET.');
      } else if (errorData.error === 'invalid_request') {
        throw new Error(`Invalid request: ${errorData.error_description || 'Check your redirect URI and request parameters.'}`);
      }
    }
    
    const errorMessage = error.response?.data?.error_description || 
                        error.response?.data?.error || 
                        error.message || 
                        'Unknown error during token exchange';
    throw new Error(`Token exchange failed: ${errorMessage}`);
  }
}

export async function refreshToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresAt: Date;
  tokenType: string;
}> {
  try {
    const tokenUrl = 'https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer';
    
    // Use URL-encoded form data like the playground
    const formData = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });
    
    const response = await axios.post(tokenUrl, formData, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      auth: {
        username: env.QBO_CLIENT_ID,
        password: env.QBO_CLIENT_SECRET,
      },
    });

    const token = response.data;
    
    if (!token.access_token) {
      throw new Error('Invalid refresh token response from Intuit');
    }

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + (token.expires_in || 3600));

    console.log('✅ Token refresh successful');

    return {
      accessToken: token.access_token,
      refreshToken: token.refresh_token || refreshToken, // Use new refresh token if provided
      expiresAt,
      tokenType: token.token_type || 'Bearer',
    };
  } catch (error: any) {
    console.error('Token refresh error:', error.response?.data || error.message);
    
    // Handle specific refresh token errors
    if (error.response?.status === 400) {
      const errorData = error.response.data;
      if (errorData.error === 'invalid_grant') {
        throw new Error('Refresh token is invalid or expired. Re-authentication required.');
      } else if (errorData.error === 'invalid_client') {
        throw new Error('Invalid client credentials for token refresh.');
      }
    }
    
    const errorMessage = error.response?.data?.error_description || 
                        error.response?.data?.error || 
                        error.message || 
                        'Unknown error during token refresh';
    throw new Error(`Token refresh failed: ${errorMessage}`);
  }
}