import { NextResponse } from 'next/server';
import { env } from '@/env';

export async function GET() {
  try {
    const analysis = {
      issue: "OAuth URL comparison between working playground and our implementation",
      playground: {
        description: "The playground worked with company selection",
        url: "https://developer.intuit.com/v2/OAuth2Playground/",
        redirectUri: "https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl"
      },
      ourImplementation: {
        description: "Our implementation shows 'undefined didn't connect'",
        redirectUri: env.QBO_REDIRECT_URI,
        clientId: env.QBO_CLIENT_ID
      },
      possibleIssues: [
        "Redirect URI mismatch between app config and OAuth request",
        "Missing or incorrect OAuth parameters",
        "App not properly configured for our redirect URI",
        "Intuit app settings don't match our implementation"
      ],
      solutions: [
        {
          title: "Try playground redirect URI",
          description: "Test if using the playground's redirect URI works",
          redirectUri: "https://developer.intuit.com/v2/OAuth2Playground/RedirectUrl"
        },
        {
          title: "Check app configuration",
          description: "Verify redirect URI in Intuit Developer Dashboard",
          steps: [
            "Go to Intuit Developer Dashboard",
            "Check if 'http://localhost:3000/api/qbo/callback' is listed",
            "Try adding the playground URI as well"
          ]
        },
        {
          title: "Use playground for token exchange",
          description: "Get tokens from playground, then use them directly"
        }
      ],
      testUrls: {
        playgroundRedirect: `https://appcenter.intuit.com/connect/oauth2?client_id=${env.QBO_CLIENT_ID}&redirect_uri=https%3A%2F%2Fdeveloper.intuit.com%2Fv2%2FOAuth2Playground%2FRedirectUrl&response_type=code&scope=com.intuit.quickbooks.accounting+com.intuit.quickbooks.payment&state=test123`,
        ourRedirect: `https://appcenter.intuit.com/connect/oauth2?client_id=${env.QBO_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fapi%2Fqbo%2Fcallback&response_type=code&scope=com.intuit.quickbooks.accounting+com.intuit.quickbooks.payment&state=test123`
      }
    };

    return NextResponse.json(analysis);
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
