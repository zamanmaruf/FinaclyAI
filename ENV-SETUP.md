# Environment Setup for FinaclyAI

## Quick Setup

Create a `.env` file in the root directory with the following content:

```bash
# ============================================
# Database (Neon PostgreSQL) - CONFIGURED ✅
# ============================================
DATABASE_URL="postgresql://neondb_owner:npg_vIOShY6bXm4K@ep-summer-pond-ad39b1bg-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
PRISMA_MIGRATE_SHADOW_DATABASE_URL="postgresql://neondb_owner:npg_vIOShY6bXm4K@ep-summer-pond-ad39b1bg-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"

# ============================================
# Application
# ============================================
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ============================================
# Feature Flags & Security - CONFIGURED ✅
# ============================================
PUBLIC_MODE="internal"
SECRET_ENCRYPTION_KEY="XzxvCvLcs/QWEk08FOm7YplCON5CNBXMt1ZiAfzzt5s="

# ============================================
# Stripe - REPLACE WITH YOUR KEYS
# ============================================
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET_HERE"
STRIPE_CONNECT_CLIENT_ID=""

# ============================================
# QuickBooks - REPLACE WITH YOUR CREDENTIALS
# ============================================
QBO_CLIENT_ID="YOUR_CLIENT_ID_HERE"
QBO_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
QBO_REDIRECT_URI="http://localhost:3000/api/qbo/callback"
INTUIT_ENV="development"
QBO_MINOR_VERSION="75"

# ============================================
# Plaid - REPLACE WITH YOUR CREDENTIALS
# ============================================
PLAID_CLIENT_ID="YOUR_CLIENT_ID_HERE"
PLAID_SECRET="YOUR_SECRET_HERE"
PLAID_ENV="sandbox"
PLAID_REDIRECT_URI="http://localhost:3000"
PLAID_PRODUCTS="transactions"
PLAID_COUNTRY_CODES="US"

# ============================================
# Optional
# ============================================
SHARED_PASSWORD=""
SHARED_ADMIN_TOKEN="test"
```

## Terminal Commands to Create .env

Run this in your terminal:

```bash
cd /Users/mdmarufuzzaman/Desktop/FinaclyAI

cat > .env << 'EOF'
DATABASE_URL="postgresql://neondb_owner:npg_vIOShY6bXm4K@ep-summer-pond-ad39b1bg-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
PRISMA_MIGRATE_SHADOW_DATABASE_URL="postgresql://neondb_owner:npg_vIOShY6bXm4K@ep-summer-pond-ad39b1bg-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
PUBLIC_MODE="internal"
SECRET_ENCRYPTION_KEY="XzxvCvLcs/QWEk08FOm7YplCON5CNBXMt1ZiAfzzt5s="
STRIPE_SECRET_KEY="sk_test_YOUR_KEY_HERE"
STRIPE_WEBHOOK_SECRET="whsec_YOUR_SECRET_HERE"
STRIPE_CONNECT_CLIENT_ID=""
QBO_CLIENT_ID="YOUR_CLIENT_ID_HERE"
QBO_CLIENT_SECRET="YOUR_CLIENT_SECRET_HERE"
QBO_REDIRECT_URI="http://localhost:3000/api/qbo/callback"
INTUIT_ENV="development"
QBO_MINOR_VERSION="75"
PLAID_CLIENT_ID="YOUR_CLIENT_ID_HERE"
PLAID_SECRET="YOUR_SECRET_HERE"
PLAID_ENV="sandbox"
PLAID_REDIRECT_URI="http://localhost:3000"
PLAID_PRODUCTS="transactions"
PLAID_COUNTRY_CODES="US"
SHARED_PASSWORD=""
SHARED_ADMIN_TOKEN="test"
EOF
```

## What's Already Configured ✅

- ✅ **Neon Database**: Your connection string is set up
- ✅ **Encryption Key**: Auto-generated secure 32-byte key
- ✅ **Feature Mode**: Set to "internal" for development

## What You Need to Add

### 1. Stripe (Required)

Get your keys from: https://dashboard.stripe.com/test/apikeys

- `STRIPE_SECRET_KEY`: Starts with `sk_test_...`
- `STRIPE_WEBHOOK_SECRET`: Starts with `whsec_...` (from Webhooks section)

### 2. QuickBooks (Required)

Get credentials from: https://developer.intuit.com/app/developer/myapps

- `QBO_CLIENT_ID`: Your app's client ID
- `QBO_CLIENT_SECRET`: Your app's client secret

### 3. Plaid (Required)

Get credentials from: https://dashboard.plaid.com/team/api

- `PLAID_CLIENT_ID`: Your Plaid client ID
- `PLAID_SECRET`: Your Plaid secret (use sandbox secret for testing)

## After Creating .env

1. **Initialize Database:**
```bash
npx prisma db push
npx prisma generate
```

2. **Start Development Server:**
```bash
npm run dev
```

3. **Visit:** http://localhost:3000

## Security Notes

⚠️ **IMPORTANT:**
- The `.env` file contains sensitive credentials
- It's already in `.gitignore` and will NOT be committed to git
- Never share your `.env` file or commit it
- The `SECRET_ENCRYPTION_KEY` is used to encrypt provider tokens
- If you lose this key, all encrypted tokens become unrecoverable

## Production Deployment

When deploying to production:

1. Update `NEXT_PUBLIC_APP_URL` to your production domain
2. Change `PUBLIC_MODE="production"`
3. Use production API keys (starts with `sk_live_` for Stripe)
4. Update redirect URIs in provider dashboards to match production domain
5. Set `PLAID_ENV="production"` and `INTUIT_ENV="production"`

