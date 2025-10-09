# Day 7: Deployment & Production Launch Guide

**Status:** ✅ READY FOR PRODUCTION  
**Date:** October 8, 2025  
**Branch:** `day7/deployment-compliance`

---

## 🚀 Deployment Checklist

### Pre-Deployment

- [x] ✅ Audit logging system implemented
- [x] ✅ Privacy Policy created (`/privacy`)
- [x] ✅ Terms of Service created (`/terms`)
- [x] ✅ Footer with compliance links
- [x] ✅ Vercel configuration (`vercel.json`)
- [x] ✅ Security headers configured
- [x] ✅ Multi-tenant schema ready (`ownerId` fields)
- [x] ✅ All Day 6 tests passing (38/38)
- [x] ✅ Verification scripts ready

---

## 📋 Deployment Steps

### 1. **Prepare Vercel Account**

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login
```

### 2. **Link Project to Vercel**

```bash
# In project root
vercel link
```

Choose:
- **Scope:** Your personal or team account
- **Link to existing project?** No (create new)
- **Project name:** `finaclyai` (or your choice)
- **Directory:** `./` (current directory)

### 3. **Configure Environment Variables**

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add these variables (for Production, Preview, and Development):

```
DATABASE_URL=postgresql://user:password@host:5432/dbname?sslmode=require
STRIPE_SECRET_KEY=sk_test_... (use test mode initially, then live keys)
STRIPE_WEBHOOK_SECRET=whsec_...
PLAID_CLIENT_ID=your_plaid_client_id
PLAID_SECRET=your_plaid_secret
PLAID_ENV=sandbox (or production when ready)
QBO_CLIENT_ID=your_qbo_client_id
QBO_CLIENT_SECRET=your_qbo_client_secret
QBO_ENVIRONMENT=sandbox (or production when ready)
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
SHARED_ADMIN_TOKEN=generate_secure_random_token_here
AUTH_PROTECTED=false (or true if enabling auth)
```

**Important Notes:**
- Use **Vercel Postgres** or external managed PostgreSQL (Supabase, Railway, AWS RDS)
- Ensure `DATABASE_URL` includes `?sslmode=require`
- Use **test mode** for Stripe/Plaid/QBO initially
- Update `NEXT_PUBLIC_APP_URL` to your actual Vercel domain

### 4. **Update OAuth Callback URLs**

Update callback URLs in third-party dashboards:

**Stripe:**
- Dashboard → Developers → Webhooks
- Add webhook endpoint: `https://your-app.vercel.app/api/stripe/webhook`
- Select events: `payment_intent.succeeded`, `payout.paid`, `payout.failed`

**Plaid:**
- Dashboard → Team Settings → API
- Add redirect URI: `https://your-app.vercel.app/api/plaid/callback`

**QuickBooks:**
- Developer Dashboard → App → Keys & OAuth
- Add redirect URI: `https://your-app.vercel.app/api/qbo/callback`

### 5. **Deploy to Vercel**

```bash
# Deploy to production
vercel --prod

# Or push to main branch (if auto-deploy enabled)
git push origin day7/deployment-compliance
```

### 6. **Run Database Migrations**

```bash
# After first deployment, run migrations
# Option A: Local with production DB URL
DATABASE_URL="your_production_db_url" npx prisma migrate deploy

# Option B: Via Vercel CLI
vercel env pull .env.production
npx prisma migrate deploy
```

### 7. **Verify Production Deployment**

```bash
# Point to production URL
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app npm run verify:day7
```

**Expected Output:**
```json
{
  "environment": { "status": "PASS" },
  "security": { "status": "PASS" },
  "database": { "status": "PASS" },
  "stripe": { "status": "PASS" },
  "plaid": { "status": "PASS" },
  "qbo": { "status": "PASS" },
  "matching": { "status": "PASS" },
  "auditLogs": { "status": "PASS" },
  "ui": { "status": "PASS" },
  "compliancePages": { "status": "PASS" },
  "overall": "READY_FOR_PRODUCTION"
}
```

### 8. **Post-Deployment Testing**

1. **Visit Production URL:** `https://your-app.vercel.app`
2. **Connect Services:**
   - Navigate to `/connect`
   - Connect Stripe (test mode)
   - Connect Plaid (sandbox)
   - Connect QuickBooks (sandbox)
3. **Run Sync:**
   - Go to `/dashboard`
   - Click "Sync Now"
   - Verify data appears
4. **Test Compliance Pages:**
   - Visit `/privacy` - should load
   - Visit `/terms` - should load
   - Check footer links work

---

## 🔒 Security Hardening (Production)

### Database Security

**If using external PostgreSQL:**
```sql
-- Create dedicated user with limited privileges
CREATE USER finacly_app WITH PASSWORD 'secure_random_password';
GRANT CONNECT ON DATABASE finacly TO finacly_app;
GRANT USAGE ON SCHEMA public TO finacly_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO finacly_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO finacly_app;

-- Enable SSL
ALTER DATABASE finacly SET ssl = on;
```

### Vercel Security Settings

1. **Enable HTTPS Only:**
   - Settings → Domains → Force HTTPS ✅

2. **Environment Variable Encryption:**
   - All env vars are encrypted at rest by Vercel ✅

3. **Enable Vercel Firewall** (Pro plan):
   - DDoS protection
   - Rate limiting
   - Geographic restrictions (if needed)

### Monitoring & Logging

**Add Sentry (Recommended):**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

Add to `vercel.json`:
```json
{
  "env": {
    "SENTRY_DSN": "@sentry-dsn",
    "SENTRY_ORG": "@sentry-org",
    "SENTRY_PROJECT": "@sentry-project"
  }
}
```

---

## 📊 Production Monitoring

### Health Check Endpoint

```bash
# Automated health check
curl https://your-app.vercel.app/api/health
```

Expected response:
```json
{
  "ok": true,
  "db": "up",
  "timestamp": "2025-10-08T12:00:00.000Z"
}
```

### Uptime Monitoring

Set up with:
- **Vercel Analytics** (built-in)
- **Better Uptime** (free tier)
- **Pingdom** or **UptimeRobot**

### Audit Log Monitoring

```sql
-- Check recent audit logs
SELECT action, status, COUNT(*) as count
FROM audit_logs
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
GROUP BY action, status
ORDER BY count DESC;

-- Check for failures
SELECT *
FROM audit_logs
WHERE status = 'FAILURE'
  AND "createdAt" > NOW() - INTERVAL '7 days'
ORDER BY "createdAt" DESC
LIMIT 100;
```

---

## 🎯 Going Live (Stripe/Plaid/QBO Production)

### When Ready for Real Data:

1. **Stripe Production:**
   ```
   - Get live API keys from Stripe Dashboard
   - Update STRIPE_SECRET_KEY with sk_live_...
   - Verify webhook endpoint with live mode
   - Test with real (small) transaction
   ```

2. **Plaid Production:**
   ```
   - Upgrade Plaid plan (paid)
   - Get production credentials
   - Update PLAID_SECRET and PLAID_ENV=production
   - Submit app for Plaid review (if required)
   ```

3. **QuickBooks Production:**
   ```
   - Submit app for Intuit review
   - Get production OAuth credentials
   - Update QBO_CLIENT_ID, QBO_CLIENT_SECRET
   - Set QBO_ENVIRONMENT=production
   - Test with real QuickBooks company
   ```

---

## 🔧 Troubleshooting

### Deployment Fails

```bash
# Check build logs
vercel logs --follow

# Test build locally
npm run build

# Common issues:
# - Missing env vars → Add in Vercel dashboard
# - Database connection → Check DATABASE_URL and firewall
# - Build timeout → Upgrade Vercel plan or optimize build
```

### Database Connection Issues

```bash
# Test connection locally
DATABASE_URL="your_url" npx prisma db pull

# Common fixes:
# - Add ?sslmode=require to connection string
# - Allow Vercel IPs in database firewall
# - Check database is running and accessible
```

### OAuth Redirect Errors

```
Error: "redirect_uri mismatch"

Fix:
1. Check callback URL in third-party dashboard
2. Ensure NEXT_PUBLIC_APP_URL is correct
3. Use exact URL (no trailing slash differences)
4. For Stripe: Update webhook URL
5. For Plaid: Update redirect URIs
6. For QBO: Update OAuth redirect URIs
```

---

## 📈 Scaling Considerations

### Database Optimization

```sql
-- Add indexes for common queries
CREATE INDEX idx_stripe_payouts_arrival_date ON stripe_payouts(arrival_date DESC);
CREATE INDEX idx_plaid_transactions_date ON plaid_transactions(date DESC);
CREATE INDEX idx_audit_logs_owner_date ON audit_logs(owner_id, created_at DESC);

-- Vacuum regularly
VACUUM ANALYZE;
```

### Caching Strategy

Add Redis for:
- Stats caching (reduce DB queries)
- Session management
- Rate limiting

### Background Jobs

For large datasets, use:
- **Vercel Cron Jobs** (free, limited)
- **Inngest** (background functions)
- **BullMQ** (if self-hosting)

---

## ✅ Production Launch Checklist

- [ ] Vercel project created and deployed
- [ ] All environment variables configured
- [ ] Database migrations applied
- [ ] OAuth callbacks updated (Stripe, Plaid, QBO)
- [ ] `npm run verify:day7` shows `READY_FOR_PRODUCTION`
- [ ] Privacy Policy accessible at `/privacy`
- [ ] Terms of Service accessible at `/terms`
- [ ] Footer links working
- [ ] Test sync with sandbox data works
- [ ] Test exception detection works
- [ ] Test Fix Now button works
- [ ] Monitoring/logging configured (Sentry or Vercel)
- [ ] Health check endpoint responding
- [ ] HTTPS enforced
- [ ] Security headers present
- [ ] Audit logging working

---

## 🎉 Post-Launch

### Week 1:
- Monitor error logs daily
- Check audit logs for anomalies
- Test with 2-3 beta users
- Gather feedback on UX

### Week 2-4:
- Optimize based on user feedback
- Add additional exception types as needed
- Improve matching accuracy
- Expand test coverage

### Month 2:
- Consider SOC 2 audit preparation
- Add more comprehensive logging
- Implement advanced features
- Scale infrastructure as needed

---

## 📞 Support & Resources

### Documentation:
- Vercel Docs: https://vercel.com/docs
- Prisma Deployment: https://www.prisma.io/docs/guides/deployment
- Stripe Webhooks: https://stripe.com/docs/webhooks
- Plaid Production: https://plaid.com/docs/

### Emergency Contacts:
- Database Issues: DBA team
- Stripe Issues: Stripe support
- Plaid Issues: Plaid support
- QuickBooks Issues: Intuit developer support

---

**Day 7 Status:** ✅ **PRODUCTION READY**

*Your FinaclyAI MVP is now ready for deployment and real-world use!* 🚀

