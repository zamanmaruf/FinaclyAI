import { NextResponse } from 'next/server';
import { env } from '@/env';
import { randomBytes } from 'crypto';

export async function GET() {
  try {
    const state = randomBytes(16).toString('hex');
    
    // Try different OAuth URL formats to see which one works
    const oauthVariations = {
      standard: {
        url: `https://appcenter.intuit.com/connect/oauth2?client_id=${env.QBO_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.QBO_REDIRECT_URI)}&response_type=code&scope=com.intuit.quickbooks.accounting+com.intuit.quickbooks.payment&state=${state}`,
        description: "Standard OAuth URL with both scopes"
      },
      accountingOnly: {
        url: `https://appcenter.intuit.com/connect/oauth2?client_id=${env.QBO_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.QBO_REDIRECT_URI)}&response_type=code&scope=com.intuit.quickbooks.accounting&state=${state}`,
        description: "OAuth URL with only accounting scope"
      },
      withRealm: {
        url: `https://appcenter.intuit.com/connect/oauth2?client_id=${env.QBO_CLIENT_ID}&redirect_uri=${encodeURIComponent(env.QBO_REDIRECT_URI)}&response_type=code&scope=com.intuit.quickbooks.accounting+com.intuit.quickbooks.payment&state=${state}&realmId=9341455462850759`,
        description: "OAuth URL with explicit realmId (CA company)"
      },
      playground: {
        url: "https://developer.intuit.com/v2/OAuth2Playground/",
        description: "Intuit's OAuth Playground for testing"
      }
    };

    const debug = {
      issue: "OAuth not showing company options",
      possibleCauses: [
        "App not properly configured for company access",
        "Scopes not matching app configuration",
        "Sandbox companies not linked to developer account",
        "OAuth flow needs explicit realmId parameter"
      ],
      troubleshooting: {
        step1: "Try Intuit OAuth Playground first",
        step2: "Verify app configuration matches OAuth request",
        step3: "Check if sandbox companies are accessible via API",
        step4: "Try with explicit realmId parameter"
      },
      oauthVariations,
      currentConfig: {
        clientId: env.QBO_CLIENT_ID,
        redirectUri: env.QBO_REDIRECT_URI,
        environment: env.INTUIT_ENV,
        sandboxCompanies: [
          { name: "Sandbox Company_US_1", id: "9341455460817411", features: "Accounting, Payments" },
          { name: "Sandbox Company_CA_2", id: "9341455462850759", features: "Accounting" }
        ]
      }
    };

    return NextResponse.json(debug);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
