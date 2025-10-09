#!/usr/bin/env tsx

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

interface VerificationResult {
  passed: boolean;
  errors: string[];
  warnings: string[];
}

function verifyNoMockData(): VerificationResult {
  const result: VerificationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  // Patterns to ban (excluding API responses and legitimate technical terms)
  const bannedPatterns = [
    /lorem/i,
    /mock.*data/i,
    /fake.*data/i,
    /placeholder.*data/i,
    /dummy.*data/i
  ];

  // Files to check (exclude API routes for mock data checks)
  const srcDir = join(process.cwd(), 'src');
  const filesToCheck = getAllFiles(srcDir, ['.ts', '.tsx', '.js', '.jsx'])
    .filter(file => !file.includes('/api/'));

  for (const file of filesToCheck) {
    try {
      const content = readFileSync(file, 'utf-8');
      
      for (const pattern of bannedPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          result.passed = false;
          result.errors.push(`File ${file} contains banned pattern: ${matches[0]}`);
        }
      }
    } catch (error) {
      result.warnings.push(`Could not read file ${file}: ${error}`);
    }
  }

  return result;
}

function verifyLandingPage(): VerificationResult {
  const result: VerificationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  const landingFile = join(process.cwd(), 'src/app/page.tsx');
  
  try {
    const content = readFileSync(landingFile, 'utf-8');
    
    // Check for required elements
    if (!content.includes('Reconcile Stripe, Bank & QuickBooks')) {
      result.errors.push('Landing page missing main headline');
      result.passed = false;
    }
    
    if (!content.includes('Join Waitlist')) {
      result.errors.push('Landing page missing primary CTA');
      result.passed = false;
    }
    
    if (!content.includes('See How It Works')) {
      result.errors.push('Landing page missing secondary CTA');
      result.passed = false;
    }
    
  } catch (error) {
    result.passed = false;
    result.errors.push(`Could not verify landing page: ${error}`);
  }

  return result;
}

function verifyConnectPage(): VerificationResult {
  const result: VerificationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  const connectFile = join(process.cwd(), 'src/app/connect/page.tsx');
  
  try {
    const content = readFileSync(connectFile, 'utf-8');
    
    // Check for required integration cards
    const requiredCards = ['Stripe', 'QuickBooks', 'Bank Account'];
    
    for (const card of requiredCards) {
      if (!content.includes(card)) {
        result.errors.push(`Connect page missing ${card} card`);
        result.passed = false;
      }
    }
    
  } catch (error) {
    result.passed = false;
    result.errors.push(`Could not verify connect page: ${error}`);
  }

  return result;
}

function verifyDashboardPage(): VerificationResult {
  const result: VerificationResult = {
    passed: true,
    errors: [],
    warnings: []
  };

  const dashboardFile = join(process.cwd(), 'src/app/dashboard/page.tsx');
  
  try {
    const content = readFileSync(dashboardFile, 'utf-8');
    
    // Check for required elements
    const requiredElements = [
      'Transactions Matched',
      'Exceptions',
      'Sync Now',
      'Exceptions Inbox',
      'Recent Matches'
    ];
    
    for (const element of requiredElements) {
      if (!content.includes(element)) {
        result.errors.push(`Dashboard missing ${element}`);
        result.passed = false;
      }
    }
    
  } catch (error) {
    result.passed = false;
    result.errors.push(`Could not verify dashboard page: ${error}`);
  }

  return result;
}

function getAllFiles(dir: string, extensions: string[]): string[] {
  const files: string[] = [];
  
  try {
    const items = readdirSync(dir);
    
    for (const item of items) {
      const fullPath = join(dir, item);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        files.push(...getAllFiles(fullPath, extensions));
      } else if (stat.isFile()) {
        const ext = item.split('.').pop()?.toLowerCase();
        if (ext && extensions.includes(`.${ext}`)) {
          files.push(fullPath);
        }
      }
    }
  } catch (error) {
    // Directory might not exist or be readable
  }
  
  return files;
}

async function main() {
  console.log('🔍 Verifying UI compliance...\n');
  
  const results = [
    verifyNoMockData(),
    verifyLandingPage(),
    verifyConnectPage(),
    verifyDashboardPage()
  ];
  
  let overallPassed = true;
  
  for (const result of results) {
    if (!result.passed) {
      overallPassed = false;
    }
    
    if (result.errors.length > 0) {
      console.log('❌ Errors:');
      result.errors.forEach(error => console.log(`  - ${error}`));
      console.log();
    }
    
    if (result.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      result.warnings.forEach(warning => console.log(`  - ${warning}`));
      console.log();
    }
  }
  
  if (overallPassed) {
    console.log('✅ All UI verification checks passed!');
    process.exit(0);
  } else {
    console.log('❌ UI verification failed. Please fix the errors above.');
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch(console.error);
}

export { verifyNoMockData, verifyLandingPage, verifyConnectPage, verifyDashboardPage };
