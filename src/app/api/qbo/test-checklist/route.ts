import { NextResponse } from 'next/server';

export async function GET() {
  const checklist = {
    title: "🧪 QBO Manual Test Checklist",
    steps: [
      {
        step: 1,
        action: "Start OAuth Flow",
        url: "/api/qbo/connect",
        method: "GET",
        description: "Visit this URL to begin QuickBooks authorization",
        expected: "Returns OAuth URL to redirect to Intuit"
      },
      {
        step: 2,
        action: "Complete OAuth",
        description: "Complete authorization in browser, get redirected back with code",
        expected: "Callback should return {ok: true, realmId: '...'}"
      },
      {
        step: 3,
        action: "Test Connection",
        url: "/api/qbo/ping?realmId=<YOUR_REALM_ID>",
        method: "GET", 
        description: "Verify connection works",
        expected: "Returns company name"
      },
      {
        step: 4,
        action: "Check Status",
        url: "/api/qbo/status?realmId=<YOUR_REALM_ID>",
        method: "GET",
        description: "Check token status and expiry",
        expected: "Returns connected: true with token info"
      },
      {
        step: 5,
        action: "List Accounts",
        url: "/api/qbo/accounts?realmId=<YOUR_REALM_ID>",
        method: "GET",
        description: "Get list of QBO accounts for testing",
        expected: "Returns all company accounts"
      },
      {
        step: 6,
        action: "Sync Invoices",
        url: "/api/qbo/invoices?realmId=<YOUR_REALM_ID>&days=30",
        method: "GET",
        description: "Fetch and store recent invoices",
        expected: "Returns count of synced invoices"
      },
      {
        step: 7,
        action: "Sync Payments", 
        url: "/api/qbo/payments?realmId=<YOUR_REALM_ID>&days=30",
        method: "GET",
        description: "Fetch and store recent payments",
        expected: "Returns count of synced payments"
      }
    ],
    troubleshooting: {
      "undefined didn't connect": "Check Intuit Developer Dashboard: redirect URI, scopes, app status",
      "401 errors": "Token expired - should auto-refresh",
      "Missing realmId": "User declined authorization or OAuth error occurred"
    }
  };

  return NextResponse.json(checklist);
}
