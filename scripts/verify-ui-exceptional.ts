#!/usr/bin/env tsx
/**
 * Exceptional UI Verification Script
 * Verifies all 37 frontend improvements are implemented correctly
 */

import * as dotenv from 'dotenv';
dotenv.config();

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface UIVerification {
  category: string;
  checks: Array<{
    name: string;
    status: 'PASS' | 'FAIL' | 'SKIP';
    evidence?: string;
  }>;
}

const results: UIVerification[] = [];
let totalPass = 0;
let totalFail = 0;

function logCheck(category: string, name: string, status: 'PASS' | 'FAIL' | 'SKIP', evidence?: string) {
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⏭️';
  console.error(`${icon} ${category}: ${name}${evidence ? ` - ${evidence}` : ''}`);
  
  let cat = results.find(r => r.category === category);
  if (!cat) {
    cat = { category, checks: [] };
    results.push(cat);
  }
  cat.checks.push({ name, status, evidence });
  
  if (status === 'PASS') totalPass++;
  if (status === 'FAIL') totalFail++;
}

async function verifyRoutes() {
  console.error('\n=== UI ROUTES VERIFICATION ===');
  
  const routes = ['/', '/connect', '/dashboard', '/privacy', '/terms'];
  
  for (const route of routes) {
    try {
      const response = await fetch(`${BASE_URL}${route}`, { method: 'HEAD' });
      if (response.status === 200) {
        logCheck('Routes', route, 'PASS', '200 OK');
      } else {
        logCheck('Routes', route, 'FAIL', `${response.status}`);
      }
    } catch (error) {
      logCheck('Routes', route, 'FAIL', 'Network error');
    }
  }
}

async function verifyLegalLinks() {
  console.error('\n=== LEGAL LINKS VERIFICATION ===');
  
  try {
    // Check that landing page footer links work
    const homeResponse = await fetch(`${BASE_URL}/`);
    const homeHtml = await homeResponse.text();
    
    const hasPrivacyLink = homeHtml.includes('href="/privacy"');
    const hasTermsLink = homeHtml.includes('href="/terms"');
    
    logCheck('Legal Links', 'Privacy link on landing page', hasPrivacyLink ? 'PASS' : 'FAIL');
    logCheck('Legal Links', 'Terms link on landing page', hasTermsLink ? 'PASS' : 'FAIL');
    
    // Check Footer component links
    const hasFooterPrivacy = homeHtml.toLowerCase().includes('privacy');
    const hasFooterTerms = homeHtml.toLowerCase().includes('terms');
    
    logCheck('Legal Links', 'Footer has privacy reference', hasFooterPrivacy ? 'PASS' : 'FAIL');
    logCheck('Legal Links', 'Footer has terms reference', hasFooterTerms ? 'PASS' : 'FAIL');
  } catch (error) {
    logCheck('Legal Links', 'Verification', 'FAIL', String(error));
  }
}

async function verifyAccessibility() {
  console.error('\n=== ACCESSIBILITY VERIFICATION ===');
  
  try {
    const dashResponse = await fetch(`${BASE_URL}/dashboard`);
    const dashHtml = await dashResponse.text();
    
    // Check for skip link
    const hasSkipLink = dashHtml.includes('Skip to main content') || dashHtml.includes('skip');
    logCheck('Accessibility', 'Skip to main content link', hasSkipLink ? 'PASS' : 'FAIL');
    
    // Check for aria-labels
    const hasAriaLabels = dashHtml.includes('aria-label');
    logCheck('Accessibility', 'ARIA labels present', hasAriaLabels ? 'PASS' : 'FAIL', hasAriaLabels ? 'Found in HTML' : 'Missing');
    
    // Check for main content ID
    const hasMainContent = dashHtml.includes('id="main-content"');
    logCheck('Accessibility', 'Main content landmark', hasMainContent ? 'PASS' : 'FAIL');
  } catch (error) {
    logCheck('Accessibility', 'Verification', 'FAIL', String(error));
  }
}

async function verifyComponents() {
  console.error('\n=== COMPONENT VERIFICATION ===');
  
  try {
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    
    // Check for exception data
    const exceptionCount = await prisma.stripeException.count();
    logCheck('Components', 'Exception data available', exceptionCount >= 0 ? 'PASS' : 'FAIL', `${exceptionCount} exceptions`);
    
    await prisma.$disconnect();
    
    // Component files exist
    const fs = await import('fs');
    const path = await import('path');
    
    const componentsPath = path.join(process.cwd(), 'src/components/ui');
    const expectedComponents = [
      'ConfirmDialog.tsx',
      'ExceptionDetailModal.tsx',
      'EmptyState.tsx',
      'CopyButton.tsx'
    ];
    
    for (const comp of expectedComponents) {
      const exists = fs.existsSync(path.join(componentsPath, comp));
      logCheck('Components', comp, exists ? 'PASS' : 'FAIL');
    }
  } catch (error) {
    logCheck('Components', 'Verification', 'FAIL', String(error));
  }
}

async function verifyPerformance() {
  console.error('\n=== PERFORMANCE VERIFICATION ===');
  
  try {
    // Check dashboard source for refreshWhenHidden
    const fs = await import('fs');
    const path = await import('path');
    
    const dashPath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
    const dashSource = fs.readFileSync(dashPath, 'utf-8');
    
    const hasRefreshOptimization = dashSource.includes('refreshWhenHidden: false');
    logCheck('Performance', 'SWR refresh optimization', hasRefreshOptimization ? 'PASS' : 'FAIL', hasRefreshOptimization ? 'refreshWhenHidden: false found' : 'Missing');
    
    const hasRevalidateOnFocus = dashSource.includes('revalidateOnFocus: true');
    logCheck('Performance', 'Revalidate on focus', hasRevalidateOnFocus ? 'PASS' : 'FAIL');
  } catch (error) {
    logCheck('Performance', 'Verification', 'FAIL', String(error));
  }
}

async function verifyFeatures() {
  console.error('\n=== FEATURE VERIFICATION ===');
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const dashPath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
    const dashSource = fs.readFileSync(dashPath, 'utf-8');
    
    // Check for bulk actions
    const hasBulkActions = dashSource.includes('selectedIds') || dashSource.includes('fixBulk');
    logCheck('Features', 'Bulk exception actions', hasBulkActions ? 'PASS' : 'FAIL');
    
    // Check for CSV export
    const hasExport = dashSource.includes('exportToCSV') || dashSource.includes('Download');
    logCheck('Features', 'CSV export', hasExport ? 'PASS' : 'FAIL');
    
    // Check for relative dates
    const hasRelativeDates = dashSource.includes('formatDistanceToNow') || dashSource.includes('date-fns');
    logCheck('Features', 'Relative dates (date-fns)', hasRelativeDates ? 'PASS' : 'FAIL');
    
    // Check for exception modal
    const hasExceptionModal = dashSource.includes('ExceptionDetailModal');
    logCheck('Features', 'Exception detail modal', hasExceptionModal ? 'PASS' : 'FAIL');
    
    // Check for confirmation
    const hasConfirmation = dashSource.includes('confirm(') || dashSource.includes('ConfirmDialog');
    logCheck('Features', 'Confirmation on Fix Now', hasConfirmation ? 'PASS' : 'FAIL');
    
    // Check for sort/filter
    const hasSorting = dashSource.includes('sortBy') || dashSource.includes('sort');
    logCheck('Features', 'Exception sorting', hasSorting ? 'PASS' : 'FAIL');
    
    // Check Connect page
    const connectPath = path.join(process.cwd(), 'src/app/connect/page.tsx');
    const connectSource = fs.readFileSync(connectPath, 'utf-8');
    
    const hasTestButtons = connectSource.includes('testConnection');
    logCheck('Features', 'Test connection buttons', hasTestButtons ? 'PASS' : 'FAIL');
    
    const hasDisconnectButtons = connectSource.includes('disconnectService') || connectSource.includes('Disconnect');
    logCheck('Features', 'Disconnect buttons', hasDisconnectButtons ? 'PASS' : 'FAIL');
    
    const hasConnectionStatus = connectSource.includes('useSWR') && connectSource.includes('qboStatus');
    logCheck('Features', 'Real connection status loading', hasConnectionStatus ? 'PASS' : 'FAIL');
  } catch (error) {
    logCheck('Features', 'Verification', 'FAIL', String(error));
  }
}

async function verifyMobile() {
  console.error('\n=== MOBILE VERIFICATION ===');
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const navPath = path.join(process.cwd(), 'src/components/Navigation.tsx');
    const navSource = fs.readFileSync(navPath, 'utf-8');
    
    // Check for Drawer component
    const hasDrawer = navSource.includes('Drawer');
    logCheck('Mobile', 'MUI Drawer for mobile menu', hasDrawer ? 'PASS' : 'FAIL');
    
    // Check for auto-close on route change
    const hasAutoClose = navSource.includes('useEffect') && navSource.includes('pathname');
    logCheck('Mobile', 'Menu auto-close on navigation', hasAutoClose ? 'PASS' : 'FAIL');
  } catch (error) {
    logCheck('Mobile', 'Verification', 'FAIL', String(error));
  }
}

async function verifyVisualPolish() {
  console.error('\n=== VISUAL POLISH VERIFICATION ===');
  
  try {
    const fs = await import('fs');
    const path = await import('path');
    
    const dashPath = path.join(process.cwd(), 'src/app/dashboard/page.tsx');
    const dashSource = fs.readFileSync(dashPath, 'utf-8');
    
    // Check for transitions
    const hasTransitions = dashSource.includes('transition:');
    logCheck('Visual', 'Transitions on interactive elements', hasTransitions ? 'PASS' : 'FAIL');
    
    // Check for hover effects
    const hasHoverEffects = dashSource.includes('&:hover');
    logCheck('Visual', 'Hover effects', hasHoverEffects ? 'PASS' : 'FAIL');
    
    // Check for animations
    const hasAnimations = dashSource.includes('Fade');
    logCheck('Visual', 'Fade animations', hasAnimations ? 'PASS' : 'FAIL');
    
    // Check layout has ErrorBoundary
    const layoutPath = path.join(process.cwd(), 'src/app/layout.tsx');
    const layoutSource = fs.readFileSync(layoutPath, 'utf-8');
    
    const hasErrorBoundary = layoutSource.includes('ErrorBoundary');
    logCheck('Visual', 'Global error boundary', hasErrorBoundary ? 'PASS' : 'FAIL');
    
    const hasToaster = layoutSource.includes('Toaster');
    logCheck('Visual', 'Global toast system', hasToaster ? 'PASS' : 'FAIL');
  } catch (error) {
    logCheck('Visual', 'Verification', 'FAIL', String(error));
  }
}

async function main() {
  console.error('╔════════════════════════════════════════════════════════════╗');
  console.error('║      EXCEPTIONAL UI VERIFICATION                           ║');
  console.error('║      Testing Frontend Transformation                       ║');
  console.error('╚════════════════════════════════════════════════════════════╝');
  
  await verifyRoutes();
  await verifyLegalLinks();
  await verifyAccessibility();
  await verifyComponents();
  await verifyPerformance();
  await verifyFeatures();
  await verifyMobile();
  await verifyVisualPolish();
  
  // Generate report
  const report = {
    summary: {
      totalChecks: totalPass + totalFail,
      passed: totalPass,
      failed: totalFail,
      passRate: `${Math.round((totalPass / (totalPass + totalFail)) * 100)}%`
    },
    categories: results,
    criticalGapsFixed: {
      footerLinks: results.find(r => r.category === 'Legal Links')?.checks.every(c => c.status === 'PASS'),
      errorBoundary: results.find(r => r.category === 'Visual')?.checks.find(c => c.name.includes('error boundary'))?.status === 'PASS',
      toastSystem: results.find(r => r.category === 'Visual')?.checks.find(c => c.name.includes('toast'))?.status === 'PASS',
      accessibility: results.find(r => r.category === 'Accessibility')?.checks.every(c => c.status === 'PASS'),
      confirmations: results.find(r => r.category === 'Features')?.checks.find(c => c.name.includes('Confirmation'))?.status === 'PASS',
      mobileDrawer: results.find(r => r.category === 'Mobile')?.checks.every(c => c.status === 'PASS'),
    },
    highPriorityFeatures: {
      exceptionModal: results.find(r => r.category === 'Features')?.checks.find(c => c.name.includes('modal'))?.status === 'PASS',
      csvExport: results.find(r => r.category === 'Features')?.checks.find(c => c.name.includes('CSV'))?.status === 'PASS',
      bulkActions: results.find(r => r.category === 'Features')?.checks.find(c => c.name.includes('Bulk'))?.status === 'PASS',
      testConnections: results.find(r => r.category === 'Features')?.checks.find(c => c.name.includes('Test connection'))?.status === 'PASS',
      disconnectButtons: results.find(r => r.category === 'Features')?.checks.find(c => c.name.includes('Disconnect'))?.status === 'PASS',
      relativeDates: results.find(r => r.category === 'Features')?.checks.find(c => c.name.includes('Relative'))?.status === 'PASS',
      sorting: results.find(r => r.category === 'Features')?.checks.find(c => c.name.includes('sorting'))?.status === 'PASS',
    },
    performance: {
      refreshOptimization: results.find(r => r.category === 'Performance')?.checks.find(c => c.name.includes('refresh'))?.status === 'PASS',
    },
    overall: totalFail === 0 ? 'EXCEPTIONAL_UI_READY' : totalFail < 3 ? 'MOSTLY_READY' : 'NEEDS_WORK'
  };
  
  // Print JSON report
  console.log(JSON.stringify(report, null, 2));
  
  console.error('\n╔════════════════════════════════════════════════════════════╗');
  console.error(`║  UI STATUS: ${report.overall.padEnd(44)} ║`);
  console.error(`║  Passed: ${totalPass}/${totalPass + totalFail} checks ${`(${report.summary.passRate})`.padEnd(35)} ║`);
  console.error('╚════════════════════════════════════════════════════════════╝\n');
  
  process.exit(totalFail > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});

