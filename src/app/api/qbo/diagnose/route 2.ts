import { NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET() {
  const diagnosis = {
    issue: "QuickBooks Company Required",
    description: "The 'undefined didn't connect' error typically means you need a QuickBooks company to authorize against.",
    requirements: [
      "A QuickBooks Online account (even sandbox/test account)",
      "At least one company set up in your QuickBooks account",
      "Be signed in to QuickBooks during OAuth flow"
    ],
    solutions: [
      {
        title: "Create Intuit Sandbox Company",
        steps: [
          "Go to https://developer.intuit.com/",
          "Sign in to your Intuit Developer account",
          "Navigate to your app dashboard",
          "Look for 'Sandbox' or 'Sample Data' section",
          "Create a test QuickBooks company"
        ]
      },
      {
        title: "Use Existing QuickBooks Account",
        steps: [
          "Sign in to your existing QuickBooks Online account",
          "Make sure you have at least one company set up",
          "Try the OAuth flow again"
        ]
      },
      {
        title: "QuickBooks Trial Account",
        steps: [
          "Create a free QuickBooks Online trial account",
          "Set up a test company",
          "Use this for OAuth testing"
        ]
      }
    ],
    testSteps: [
      "1. Ensure you have a QuickBooks account with at least one company",
      "2. Sign in to QuickBooks before attempting OAuth",
      "3. Try the OAuth flow: /api/qbo/connect",
      "4. You should see a company selection screen during OAuth",
      "5. If no companies appear, that confirms this diagnosis"
    ],
    currentConfig: {
      clientId: env.QBO_CLIENT_ID.substring(0, 8) + '...',
      redirectUri: env.QBO_REDIRECT_URI,
      environment: env.INTUIT_ENV,
      scopes: 'com.intuit.quickbooks.accounting com.intuit.quickbooks.payment'
    }
  };

  return NextResponse.json(diagnosis);
}
