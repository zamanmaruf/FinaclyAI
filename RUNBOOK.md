# FinaclyAI Production Connect UX Runbook

This runbook guides you through deploying and verifying the production-ready onboarding experience for FinaclyAI.

## Overview

The production connect UX provides:
- **Stripe Connect OAuth** for secure payment data access
- **Plaid Link** for bank account connections
- **QuickBooks OAuth** for accounting integration
- **Unified "Sync Now"** endpoint for one-click reconciliation
- **Token encryption at rest** using AES-256-GCM
- **Feature flag** support for internal/production modes

## Prerequisites

### Required Environment Variables

Create a `.env` file with the following variables:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/finacly"
PRISMA_MIGRATE_SHADOW_DATABASE_URL="postgresql://user:password@localhost:5432/finacly_shadow"

# Application
NEXT_PUBLIC_APP_URL="https://your-production-domain.com"

# Feature Flags
PUBLIC_MODE="production"  # or "internal" for development

# Security (CRITICAL)
SECRET_ENCRYPTION_KEY="your-32-plus-character-encryption-key-here"

# Stripe
STRIPE_SECRET_KEY="sk_live_..."  # For internal mode fallback
STRIPE_WEBHOOK_SECRET="whsec_..."
STRIPE_CONNECT_CLIENT_ID="ca_..."  # Optional, for production OAuth

# QuickBooks Online
QBO_CLIENT_ID="your-qbo-client-id"
QBO_CLIENT_SECRET="your-qbo-client-secret"
QBO_REDIRECT_URI="https://your-production-domain.com/api/qbo/callback"
INTUIT_ENV="production"  # or "development" for sandbox

# Plaid
PLAID_CLIENT_ID="your-plaid-client-id"
PLAID_SECRET="your-plaid-secret"
PLAID_ENV="production"  # or "sandbox" for testing
PLAID_REDIRECT_URI="https://your-production-domain.com"  # Optional
PLAID_PRODUCTS="transactions"
PLAID_COUNTRY_CODES="US"

# Optional: Auth Protection
SHARED_PASSWORD="optional-access-password"
SHARED_ADMIN_TOKEN="optional-admin-token-for-internal-endpoints"
```

### Generating SECRET_ENCRYPTION_KEY

Generate a secure 32+ character key:

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Using a password generator (min 32 chars)
# Example: "a8f3e9d2c7b6a5f4e3d2c1b0a9f8e7d6c5b4a3f2e1d0"
```

**IMPORTANT:** Store this key securely. If lost, all encrypted tokens will be unrecoverable.

### Provider Configuration URLs

#### Stripe Connect

1. Go to: https://dashboard.stripe.com/settings/connect
2. Create a Connect platform (if not already created)
3. Configure OAuth settings:
   - **Redirect URI:** `https://your-production-domain.com/api/connect/stripe/callback`
   - **Required scopes:** `read_write` (for payouts, charges, balance transactions)
4. Copy your **Connect client ID** (`ca_...`) to `STRIPE_CONNECT_CLIENT_ID`

#### Stripe Webhooks

1. Go to: https://dashboard.stripe.com/webhooks
2. Add endpoint: `https://your-production-domain.com/api/stripe/webhook`
3. Select events:
   - `charge.succeeded`
   - `payout.paid`
   - `payout.failed`
4. Copy **Signing secret** to `STRIPE_WEBHOOK_SECRET`

#### Plaid

1. Go to: https://dashboard.plaid.com/team/api
2. Get your **Client ID** and **Production Secret**
3. Configure allowed redirect URIs (if using OAuth redirect):
   - `https://your-production-domain.com`

#### QuickBooks (Intuit)

1. Go to: https://developer.intuit.com/app/developer/myapps
2. Create or select your app
3. Configure OAuth redirect URIs:
   - **Redirect URI:** `https://your-production-domain.com/api/qbo/callback`
4. Copy **Client ID** and **Client Secret**
5. Set **Environment** to `production` in your `.env`

## Deployment Steps

### 1. Database Setup

```bash
# Terminal 1: Start PostgreSQL (if not running)
# Ensure PostgreSQL is accessible at the DATABASE_URL

# Apply schema and run migrations
npx prisma db push
npx prisma generate

# Encrypt existing tokens (if migrating from a previous version)
npm run migrate:encrypt
```

### 2. Start the Application

```bash
# Terminal 2: Start the Next.js development server
npm run dev

# Or for production build:
npm run build
npm start
```

The application will start on `http://localhost:3000` (or your configured port).

### 3. Connect Providers Through the UI

1. **Open the app** in your browser: `http://localhost:3000`

2. **Navigate to Connect page**: `http://localhost:3000/connect`

3. **Connect each provider:**

   **Stripe:**
   - In **production mode**: Click "Connect with Stripe" → authorize on Stripe → redirected back
   - In **internal mode**: Paste your Stripe secret key

   **Bank (Plaid):**
   - In **production mode**: Click "Connect Bank" → Plaid Link opens → select bank → authorize
   - In **internal mode**: Click "Connect Test Bank" (sandbox)

   **QuickBooks:**
   - Click "Connect QuickBooks" → redirected to Intuit → authorize → redirected back

4. **Verify connections:**
   - All three cards should show green checkmarks
   - Click "Test Connection" on each card to verify

5. **Run initial sync:**
   - Click the **"Sync Now"** button
   - Wait for sync to complete
   - Review sync summary (payouts, charges, bank transactions, matches)

### 4. Run Verification Script

```bash
# Terminal 3: Run production verification
npm run verify:prod
```

The script will:
1. ✅ Check environment configuration
2. ✅ Verify all three providers are connected
3. ✅ Run sync endpoint twice to test idempotency
4. ✅ Confirm reconciliation results exist

**Expected output:**
```json
{
  "environment": "PASS",
  "connections": {
    "stripe": "PASS",
    "plaid": "PASS",
    "qbo": "PASS"
  },
  "sync": {
    "firstRun": "PASS",
    "idempotency": "PASS",
    "reconciliationResults": "PASS"
  },
  "overall": "PASS"
}
```

## Feature Modes

### Production Mode (`PUBLIC_MODE=production`)

- **Stripe:** OAuth via Stripe Connect (requires `STRIPE_CONNECT_CLIENT_ID`)
- **Plaid:** Plaid Link (production or sandbox)
- **QuickBooks:** OAuth (production or sandbox based on `INTUIT_ENV`)
- **Sandbox features:** Hidden from UI, dev tools not shown
- **Token validation:** Strict validation, fails if encryption key missing

### Internal Mode (`PUBLIC_MODE=internal`)

- **Stripe:** Paste secret key OR OAuth
- **Plaid:** Sandbox quick connect OR Plaid Link
- **QuickBooks:** OAuth (same as production)
- **Developer tools:** Visible in navigation (Dev Tools badge)
- **Sandbox features:** Visible and accessible
- **Token validation:** Warnings instead of hard failures

## Troubleshooting

### "SECRET_ENCRYPTION_KEY must be at least 32 characters"

**Solution:** Generate a secure 32+ character key (see instructions above) and set it in `.env`

### "No Stripe Connect account linked"

**Solution:**
- If `PUBLIC_MODE=production`: Set `STRIPE_CONNECT_CLIENT_ID` and complete OAuth flow
- If `PUBLIC_MODE=internal`: Use paste-key flow or complete OAuth

### "QuickBooks authorization expired"

**Solution:** QuickBooks tokens expire after 100 days. Disconnect and reconnect via `/connect`

### "Plaid connection expired"

**Solution:** Bank connections may expire. Reconnect via Plaid Link on `/connect` page

### Webhook Not Receiving Events

**Solution:**
- Verify webhook URL is publicly accessible
- Check Stripe Dashboard for webhook delivery logs
- Ensure `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint

## Security Checklist

Before deploying to production:

- [ ] `SECRET_ENCRYPTION_KEY` is 32+ characters and stored securely
- [ ] `PUBLIC_MODE=production` is set
- [ ] All provider OAuth redirect URIs point to production domain (HTTPS)
- [ ] Webhook URLs point to production domain (HTTPS)
- [ ] Database credentials use strong passwords
- [ ] `.env` file is never committed to git (in `.gitignore`)
- [ ] SSL/TLS certificates are valid and up to date
- [ ] All provider API keys are for **production** (not test mode)
- [ ] Token refresh logic is tested and working

## Monitoring

Key metrics to monitor:

1. **Connection health:** Check `/api/status/stripe`, `/api/status/plaid`, `/api/status/qbo`
2. **Sync frequency:** Monitor `/api/sync/all` execution time and frequency
3. **Match rate:** Track `matched` vs `exceptionsCreated` ratio
4. **Token refresh:** Monitor QBO token refresh (every ~60 days)
5. **Webhook delivery:** Check Stripe Dashboard for failed webhook deliveries

## Support Contacts

- **Stripe Support:** https://support.stripe.com
- **Plaid Support:** https://dashboard.plaid.com/support
- **Intuit Developer:** https://help.developer.intuit.com

## Rollback Procedure

If issues arise:

1. **Switch to internal mode:**
   ```bash
   PUBLIC_MODE=internal
   ```

2. **Use environment keys as fallback:**
   - Stripe: Direct secret key instead of OAuth
   - Plaid: Existing access tokens in database
   - QuickBooks: Existing tokens (will auto-refresh)

3. **Restore from backup:**
   - Database backup (includes encrypted tokens)
   - Environment variables backup

---

**Last Updated:** 2025-10-09  
**Version:** 1.0.0

