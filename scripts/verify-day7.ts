#!/usr/bin/env tsx
/**
 * Day 7 Production Readiness Verification
 * Validates deployment, security, compliance, and all systems
 */

import * as dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface VerificationResult {
  status: 'PASS' | 'FAIL' | 'WARN';
  [key: string]: unknown;
}

interface Day7Report {
  environment: VerificationResult;
  security: VerificationResult;
  database: VerificationResult;
  stripe: VerificationResult;
  plaid: VerificationResult;
  qbo: VerificationResult;
  matching: VerificationResult;
  auditLogs: VerificationResult;
  ui: VerificationResult;
  compliancePages: VerificationResult;
  overall: 'READY_FOR_PRODUCTION' | 'NOT_READY' | 'NEEDS_REVIEW';
}

let hasFailure = false;
let hasWarning = false;

async function fetchAPI(endpoint: string, options: RequestInit = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  const text = await response.text();
  let data;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }
  
  return { status: response.status, data };
}

/**
 * 1. Environment & Production Config
 */
async function verifyEnvironment(): Promise<VerificationResult> {
  console.error('\n=== ENVIRONMENT & PRODUCTION CONFIG ===');
  
  const required = [
    'DATABASE_URL',
    'STRIPE_SECRET_KEY',
    'PLAID_CLIENT_ID',
    'PLAID_SECRET',
    'QBO_CLIENT_ID',
    'QBO_CLIENT_SECRET',
    'NEXT_PUBLIC_APP_URL',
  ];
  
  const missing = required.filter(key => !process.env[key]);
  const issues: string[] = [];
  
  if (missing.length > 0) {
    console.error(`❌ Missing env vars: ${missing.join(', ')}`);
    issues.push(...missing);
    hasFailure = true;
  } else {
    console.error('✅ All required environment variables present');
  }
  
  // Check if using production domain
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  if (appUrl.includes('localhost')) {
    console.error('⚠️  Using localhost - ensure production URL is set for deployment');
    hasWarning = true;
  } else {
    console.error(`✅ Production URL configured: ${appUrl}`);
  }
  
  return { 
    status: missing.length > 0 ? 'FAIL' : (hasWarning ? 'WARN' : 'PASS'),
    baseUrl: appUrl,
    missingVars: missing,
  };
}

/**
 * 2. Security Verification
 */
async function verifySecurity(): Promise<VerificationResult> {
  console.error('\n=== SECURITY VERIFICATION ===');
  
  const checks = {
    httpsOnly: false,
    tokensServerSide: true, // Assumed true if not exposed in frontend
    securityHeaders: false,
    auditLogging: false,
  };
  
  // Check if HTTPS is enforced (in production)
  if (BASE_URL.startsWith('https://')) {
    checks.httpsOnly = true;
    console.error('✅ HTTPS enforced');
  } else {
    console.error('⚠️  Not using HTTPS (OK for local dev)');
    hasWarning = true;
  }
  
  // Check security headers on homepage
  try {
    const response = await fetch(BASE_URL);
    const headers = response.headers;
    
    const securityHeadersPresent = 
      headers.has('x-content-type-options') &&
      headers.has('x-frame-options');
    
    if (securityHeadersPresent) {
      checks.securityHeaders = true;
      console.error('✅ Security headers present');
    } else {
      console.error('⚠️  Some security headers missing');
      hasWarning = true;
    }
  } catch (error) {
    console.error('⚠️  Could not verify security headers');
  }
  
  // Check audit logs table exists
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.auditLog.count();
    checks.auditLogging = true;
    console.error('✅ Audit logging system active');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Audit logging not available');
    hasFailure = true;
  }
  
  const allPassed = Object.values(checks).every(v => v);
  
  return { 
    status: allPassed ? 'PASS' : (hasFailure ? 'FAIL' : 'WARN'),
    checks,
  };
}

/**
 * 3. Database Health
 */
async function verifyDatabase(): Promise<VerificationResult> {
  console.error('\n=== DATABASE HEALTH ===');
  
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    const counts = {
      StripeCharge: await prisma.stripeCharge.count(),
      StripePayout: await prisma.stripePayout.count(),
      PlaidTransaction: await prisma.plaidTransaction.count(),
      Exceptions: await prisma.stripeException.count(),
      AuditLogs: await prisma.auditLog.count(),
    };
    
    await prisma.$disconnect();
    
    console.error('✅ Database connected. Counts:', counts);
    return { status: 'PASS', counts };
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    hasFailure = true;
    return { status: 'FAIL', error: String(error) };
  }
}

/**
 * 4-6. Integration Tests (Stripe, Plaid, QBO)
 */
async function verifyIntegrations(): Promise<{stripe: VerificationResult, plaid: VerificationResult, qbo: VerificationResult}> {
  console.error('\n=== INTEGRATION VERIFICATION ===');
  
  // Stripe
  console.error('\n--- Stripe ---');
  const stripeResult: VerificationResult = { status: 'PASS' };
  try {
    const { data } = await fetchAPI('/api/stripe/sync?days=7', { method: 'POST' });
    console.error(`✅ Stripe sync: ${data.charges} charges, ${data.payouts} payouts`);
    stripeResult.charges = data.charges;
    stripeResult.payouts = data.payouts;
  } catch (error) {
    console.error('❌ Stripe sync failed');
    stripeResult.status = 'FAIL';
    hasFailure = true;
  }
  
  // Plaid
  console.error('\n--- Plaid ---');
  const plaidResult: VerificationResult = { status: 'PASS' };
  try {
    const { data } = await fetchAPI('/api/plaid/transactions', { method: 'POST' });
    console.error(`✅ Plaid sync: ${data.totals?.inserted || 0} inserted`);
    plaidResult.inserted = data.totals?.inserted || 0;
  } catch (error) {
    console.error('⚠️  Plaid sync (may not be connected)');
    plaidResult.status = 'WARN';
    hasWarning = true;
  }
  
  // QBO
  console.error('\n--- QuickBooks ---');
  const qboResult: VerificationResult = { status: 'PASS' };
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const token = await prisma.qboToken.findFirst();
    await prisma.$disconnect();
    
    if (token) {
      console.error(`✅ QBO connected: ${token.realmId}`);
      qboResult.realmId = token.realmId;
    } else {
      console.error('⚠️  QBO not connected');
      qboResult.status = 'WARN';
      hasWarning = true;
    }
  } catch (error) {
    console.error('⚠️  QBO verification failed');
    qboResult.status = 'WARN';
  }
  
  return { stripe: stripeResult, plaid: plaidResult, qbo: qboResult };
}

/**
 * 7. Matching Engine
 */
async function verifyMatching(): Promise<VerificationResult> {
  console.error('\n=== MATCHING ENGINE ===');
  
  try {
    const { data } = await fetchAPI('/api/match/payouts-bank', { method: 'POST' });
    console.error(`✅ Matching: ${data.matchedCount} matched, ${data.exceptionsCreated} exceptions`);
    
    return {
      status: 'PASS',
      matched: data.matchedCount,
      exceptions: data.exceptionsCreated,
    };
  } catch (error) {
    console.error('❌ Matching failed');
    hasFailure = true;
    return { status: 'FAIL', error: String(error) };
  }
}

/**
 * 8. Audit Logs
 */
async function verifyAuditLogs(): Promise<VerificationResult> {
  console.error('\n=== AUDIT LOGS ===');
  
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Try to create a test audit log
    const testLog = await prisma.auditLog.create({
      data: {
        action: 'SYNC_STARTED',
        status: 'SUCCESS',
        metadata: { test: true, timestamp: new Date().toISOString() },
      },
    });
    
    const count = await prisma.auditLog.count();
    
    await prisma.$disconnect();
    
    console.error(`✅ Audit logging working (${count} total logs)`);
    
    return {
      status: 'PASS',
      totalLogs: count,
      testLogId: testLog.id,
    };
  } catch (error) {
    console.error('❌ Audit logging failed');
    hasFailure = true;
    return { status: 'FAIL', error: String(error) };
  }
}

/**
 * 9. UI Routes
 */
async function verifyUI(): Promise<VerificationResult> {
  console.error('\n=== UI ROUTES ===');
  
  const routes = {
    '/': 0,
    '/dashboard': 0,
    '/connect': 0,
    '/privacy': 0,
    '/terms': 0,
  };
  
  for (const route of Object.keys(routes)) {
    try {
      const response = await fetch(`${BASE_URL}${route}`, { method: 'HEAD' });
      routes[route as keyof typeof routes] = response.status;
      
      if (response.status === 200) {
        console.error(`✅ ${route}: OK`);
      } else {
        console.error(`⚠️  ${route}: ${response.status}`);
        hasWarning = true;
      }
    } catch (error) {
      console.error(`❌ ${route}: Failed`);
      routes[route as keyof typeof routes] = 0;
      hasFailure = true;
    }
  }
  
  const allOk = Object.values(routes).every(s => s === 200);
  
  return {
    status: allOk ? 'PASS' : (hasFailure ? 'FAIL' : 'WARN'),
    ...routes,
  };
}

/**
 * 10. Compliance Pages
 */
async function verifyCompliancePages(): Promise<VerificationResult> {
  console.error('\n=== COMPLIANCE PAGES ===');
  
  const pages = {
    privacy: false,
    terms: false,
  };
  
  try {
    const privacyResponse = await fetch(`${BASE_URL}/privacy`);
    pages.privacy = privacyResponse.status === 200;
    console.error(pages.privacy ? '✅ Privacy Policy: Available' : '❌ Privacy Policy: Missing');
    
    const termsResponse = await fetch(`${BASE_URL}/terms`);
    pages.terms = termsResponse.status === 200;
    console.error(pages.terms ? '✅ Terms of Service: Available' : '❌ Terms of Service: Missing');
  } catch (error) {
    console.error('❌ Could not verify compliance pages');
    hasFailure = true;
  }
  
  const allPresent = pages.privacy && pages.terms;
  
  if (!allPresent) hasFailure = true;
  
  return {
    status: allPresent ? 'PASS' : 'FAIL',
    pages,
  };
}

/**
 * Main verification
 */
async function main() {
  console.error('╔════════════════════════════════════════════════════════════╗');
  console.error('║     DAY 7 PRODUCTION READINESS VERIFICATION                ║');
  console.error('╚════════════════════════════════════════════════════════════╝');
  
  const environment = await verifyEnvironment();
  const security = await verifySecurity();
  const database = await verifyDatabase();
  const integrations = await verifyIntegrations();
  const matching = await verifyMatching();
  const auditLogs = await verifyAuditLogs();
  const ui = await verifyUI();
  const compliancePages = await verifyCompliancePages();
  
  const overall = hasFailure ? 'NOT_READY' : (hasWarning ? 'NEEDS_REVIEW' : 'READY_FOR_PRODUCTION');
  
  const report: Day7Report = {
    environment,
    security,
    database,
    stripe: integrations.stripe,
    plaid: integrations.plaid,
    qbo: integrations.qbo,
    matching,
    auditLogs,
    ui,
    compliancePages,
    overall,
  };
  
  // Print final JSON to stdout
  console.log(JSON.stringify(report, null, 2));
  
  console.error('\n╔════════════════════════════════════════════════════════════╗');
  console.error(`║  OVERALL STATUS: ${overall.padEnd(43)} ║`);
  console.error('╚════════════════════════════════════════════════════════════╝\n');
  
  process.exit(hasFailure ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

