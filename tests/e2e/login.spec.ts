import { test, expect } from '@playwright/test';

test.describe('Login Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto('/login');
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText('Finacly AI');
    
    // Check for lock icon presence
    const lockIcon = page.locator('svg[data-testid="LockIcon"]').first();
    await expect(lockIcon).toBeVisible();
  });

  test('should show dev mode banner when SHARED_PASSWORD not set', async ({ page }) => {
    // Skip if SHARED_PASSWORD is set
    if (process.env.SHARED_PASSWORD) {
      test.skip();
    }

    await page.goto('/login');
    
    // Should show dev mode alert
    const devAlert = page.locator('.MuiAlert-root').filter({ hasText: 'Developer Mode' });
    await expect(devAlert).toBeVisible();
    
    // Should show dev mode button
    const devButton = page.locator('button', { hasText: 'Enter Dashboard (Dev Mode)' });
    await expect(devButton).toBeVisible();
    
    // Click and verify navigation
    await devButton.click();
    await expect(page).toHaveURL('/dashboard');
  });

  test('should authenticate with valid password', async ({ page }) => {
    // Skip if SHARED_PASSWORD not set (dev mode)
    if (!process.env.SHARED_PASSWORD) {
      test.skip();
    }

    await page.goto('/login');
    
    // Fill password
    await page.fill('input[type="password"]', process.env.SHARED_PASSWORD!);
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should show error on invalid password', async ({ page }) => {
    // Skip if SHARED_PASSWORD not set (dev mode)
    if (!process.env.SHARED_PASSWORD) {
      test.skip();
    }

    await page.goto('/login');
    
    // Fill wrong password
    await page.fill('input[type="password"]', 'wrongpassword123');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Should show error
    const errorAlert = page.locator('.MuiAlert-root').filter({ hasText: /invalid/i });
    await expect(errorAlert).toBeVisible();
    
    // Should stay on login page
    await expect(page).toHaveURL(/\/login/);
  });
});

