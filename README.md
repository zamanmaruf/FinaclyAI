# Finacly AI - Financial Reconciliation Platform

A comprehensive financial reconciliation platform that automates the matching of Stripe payouts, bank transactions, and QuickBooks entries using real API integrations.

## Features

- 🔄 **Automated Reconciliation**: End-to-end reconciliation of Stripe → Bank → QuickBooks
- 🔌 **Real API Integrations**: Stripe, Plaid (banking), and QuickBooks Online
- 🎯 **Smart Matching**: AI-powered transaction matching with confidence scoring
- ⚠️ **Exception Handling**: Automated detection and resolution of unmatched transactions
- 📊 **Real-time Analytics**: Dashboard with reconciliation metrics and insights
- 🔒 **Secure**: Encrypted credential storage and SOC 2 compliance
- 🧪 **Comprehensive Testing**: E2E tests with real sandbox APIs (no mock data)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with encrypted credential storage
- **APIs**: Stripe, Plaid, QuickBooks Online
- **Styling**: Tailwind CSS with custom design system
- **Testing**: Jest with real API integration tests

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- API credentials for Stripe, Plaid, and QuickBooks Online

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd finacly-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

4. **Configure API credentials** (see API Setup section below)

5. **Set up the database**
   ```bash
   npm run init-db
   ```

6. **Run the development server**
   ```bash
   npm run dev
   ```

## API Setup

This application requires API credentials from three services. **All integrations use real APIs - no mock data.**

### Stripe Setup

1. **Create Stripe Account**
   - Go to [https://dashboard.stripe.com](https://dashboard.stripe.com)
   - Create an account or sign in

2. **Get API Keys**
   - Navigate to [API Keys](https://dashboard.stripe.com/test/apikeys)
   - Copy your `sk_test_...` secret key and `pk_test_...` publishable key
   - Set up webhooks at [Webhooks](https://dashboard.stripe.com/webhooks)

3. **Environment Variables**
   ```env
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_PUBLISHABLE_KEY=pk_test_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### Plaid Setup (Banking Integration)

1. **Create Plaid Account**
   - Go to [https://dashboard.plaid.com](https://dashboard.plaid.com)
   - Sign up for a free account

2. **Get API Keys**
   - Navigate to [Team Settings > Keys](https://dashboard.plaid.com/team/keys)
   - Copy your `client_id` and `secret`

3. **Environment Variables**
   ```env
   PLAID_CLIENT_ID=...
   PLAID_SECRET=...
   PLAID_ENV=sandbox
   PLAID_PRODUCTS=transactions,auth
   ```

### QuickBooks Online Setup

1. **Create Intuit Developer Account**
   - Go to [https://developer.intuit.com](https://developer.intuit.com)
   - Sign up for a free account

2. **Create App**
   - Create a new app in the [Developer Dashboard](https://developer.intuit.com/app/developer/myapps)
   - Select "QuickBooks Online API" and "OAuth 2.0"
   - Set redirect URI to `http://localhost:3000/api/app/quickbooks/callback`

3. **Get Credentials**
   - Copy your `client_id` and `client_secret`
   - Set environment to "Sandbox"

4. **Environment Variables**
   ```env
   QBO_CLIENT_ID=...
   QBO_CLIENT_SECRET=...
   QBO_REDIRECT_URI=http://localhost:3000/api/app/quickbooks/callback
   INTUIT_ENV=sandbox
   ```

### Complete Environment Configuration

Copy `.env.example` to `.env.local` and fill in all required values:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/finacly_ai
DATABASE_URL_TEST=postgresql://username:password@localhost:5432/finacly_ai_test

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Plaid
PLAID_CLIENT_ID=...
PLAID_SECRET=...
PLAID_ENV=sandbox
PLAID_PRODUCTS=transactions,auth

# QuickBooks
QBO_CLIENT_ID=...
QBO_CLIENT_SECRET=...
QBO_REDIRECT_URI=http://localhost:3000/api/app/quickbooks/callback
INTUIT_ENV=sandbox

# Application
NEXTAUTH_SECRET=your-secret-key-here
ENCRYPTION_KEY=your-32-character-encryption-key
NODE_ENV=development
```

## Testing

This application uses **real API integrations** for testing. No mock data is used.

### Running Tests

```bash
# Run all tests
npm test

# Run specific test suites
npm run test:unit        # Unit tests
npm run test:integration # Integration tests
npm run test:e2e         # End-to-end tests with real APIs

# Run tests with coverage
npm run test:coverage
```

### Test Requirements

For E2E tests to pass, you need:
- Valid Stripe test API keys (`sk_test_...`)
- Valid Plaid sandbox credentials
- Valid QuickBooks sandbox credentials
- Test database configured

### Test Data

- **No mock data**: All tests use real sandbox APIs
- **Real transactions**: Tests work with actual API responses
- **Environment validation**: Tests verify API credentials are valid
- **Error handling**: Tests verify graceful handling of API errors

## Reconciliation Flow

The platform performs end-to-end reconciliation:

1. **Data Ingestion**
   - Sync Stripe payouts via Stripe API
   - Sync bank transactions via Plaid API
   - Sync QuickBooks entries via QBO API

2. **Smart Matching**
   - Match Stripe payouts to bank transactions
   - Match bank transactions to QuickBooks entries
   - Use amount, date, and description matching

3. **Exception Detection**
   - Identify unmatched transactions
   - Detect cash deposits and internal transfers
   - Flag multi-currency transactions

4. **Resolution**
   - Automated QuickBooks entry creation
   - Manual review interface for complex cases
   - Audit trail for all actions

## API Endpoints

### Stripe Integration
- `POST /api/app/stripe/sync` - Sync Stripe payouts
- `POST /api/app/stripe/connect` - Connect Stripe account

### Plaid Integration
- `POST /api/app/plaid/link-token` - Create link token
- `POST /api/app/plaid/exchange` - Exchange public token
- `POST /api/app/plaid/sync` - Sync bank transactions

### QuickBooks Integration
- `POST /api/app/quickbooks/auth` - Generate auth URL
- `POST /api/app/quickbooks/callback` - Handle OAuth callback
- `POST /api/app/quickbooks/sync` - Sync QBO entries

### Reconciliation
- `POST /api/app/reconcile` - Run reconciliation process
- `GET /api/app/exceptions` - Get unmatched transactions
- `POST /api/app/exceptions/fix` - Resolve exceptions

## Security

- **Encrypted Storage**: All API credentials are encrypted at rest
- **Environment Variables**: No hardcoded secrets in code
- **API Validation**: Runtime validation of required credentials
- **Audit Trail**: Complete logging of all reconciliation actions

## Deployment

### Vercel (Recommended)

1. **Connect repository to Vercel**
2. **Set environment variables** in Vercel dashboard
3. **Deploy automatically** on push to main branch

### Manual Deployment

```bash
npm run build
npm start
```

## Troubleshooting

### Environment Validation

The application validates all required environment variables at startup:

```bash
# Check environment validation
npm run dev
# Look for "✅ Environment validation passed" message
```

### Common Issues

1. **Missing API Keys**
   - Ensure all required environment variables are set
   - Check `.env.example` for complete list

2. **Invalid API Keys**
   - Verify keys are from sandbox/test environments
   - Ensure keys haven't expired

3. **Database Connection**
   - Check `DATABASE_URL` is correct
   - Ensure PostgreSQL is running

4. **API Rate Limits**
   - Monitor API usage in respective dashboards
   - Implement rate limiting if needed

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass with real APIs
6. Submit a pull request

## License

[License information]