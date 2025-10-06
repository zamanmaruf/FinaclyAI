import { NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET() {
  try {
    // Validate environment configuration
    const config = {
      environment: env.INTUIT_ENV,
      clientId: env.QBO_CLIENT_ID,
      redirectUri: env.QBO_REDIRECT_URI,
      minorVersion: env.QBO_MINOR_VERSION,
      sandboxBaseUrl: env.QBO_SANDBOX_BASE_URL,
      productionBaseUrl: env.QBO_PRODUCTION_BASE_URL,
      
      // Validation results
      validation: {
        clientIdValid: !!env.QBO_CLIENT_ID && env.QBO_CLIENT_ID.length > 0,
        clientSecretValid: !!env.QBO_CLIENT_SECRET && env.QBO_CLIENT_SECRET.length > 0,
        redirectUriValid: /^https?:\/\//.test(env.QBO_REDIRECT_URI),
        environmentValid: ['development', 'production'].includes(env.INTUIT_ENV),
        minorVersionValid: /^\d+$/.test(env.QBO_MINOR_VERSION),
      }
    };

    // Determine current base URL based on environment
    const currentBaseUrl = env.INTUIT_ENV === 'production' 
      ? env.QBO_PRODUCTION_BASE_URL 
      : env.QBO_SANDBOX_BASE_URL;

    const issues = [];
    if (!config.validation.clientIdValid) issues.push('QBO_CLIENT_ID is missing or empty');
    if (!config.validation.clientSecretValid) issues.push('QBO_CLIENT_SECRET is missing or empty');
    if (!config.validation.redirectUriValid) issues.push('QBO_REDIRECT_URI is not a valid URL');
    if (!config.validation.environmentValid) issues.push('INTUIT_ENV must be "development" or "production"');
    if (!config.validation.minorVersionValid) issues.push('QBO_MINOR_VERSION must be a number');

    return NextResponse.json({
      ok: true,
      config,
      currentBaseUrl,
      issues: issues.length > 0 ? issues : ['No configuration issues found'],
      recommendations: [
        '1. Ensure all QBO environment variables are set correctly',
        '2. For development, use sandbox companies and development environment',
        '3. For production, use production environment and live companies',
        '4. Verify your redirect URI matches exactly in Intuit Developer Dashboard',
        '5. Check that your app has the correct scopes configured'
      ],
      oauthUrl: `https://appcenter.intuit.com/connect/oauth2?client_id=${env.QBO_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.QBO_REDIRECT_URI)}&response_type=code&scope=com.intuit.quickbooks.accounting&state=test`
    });
  } catch (error) {
    return NextResponse.json(
      { 
        ok: false, 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Failed to validate environment configuration'
      },
      { status: 500 }
    );
  }
}