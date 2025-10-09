import { test, expect } from '@playwright/test';

test.describe('Connect Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to connect (middleware will handle auth)
    await page.goto('/connect');
  });

  test('should display connect page with all integration cards', async ({ page }) => {
    // Check page title
    await expect(page.locator('h4').first()).toContainText('Connect Services');
    
    // Check for Stripe card
    const stripeCard = page.locator('text=Stripe');
    await expect(stripeCard).toBeVisible();
    
    // Check for QuickBooks card
    const qboCard = page.locator('text=QuickBooks Online');
    await expect(qboCard).toBeVisible();
    
    // Check for Plaid card
    const plaidCard = page.locator('text=Bank Connection');
    await expect(plaidCard).toBeVisible();
  });

  test('should show Stripe secret key input', async ({ page }) => {
    // Check for secret key input
    const stripeInput = page.locator('input[type="password"][placeholder*="sk_test"]');
    await expect(stripeInput).toBeVisible();
    
    // Check connect button
    const connectButton = page.locator('button', { hasText: 'Connect Stripe' });
    await expect(connectButton).toBeVisible();
  });

  test('should validate Stripe secret key format', async ({ page }) => {
    const stripeInput = page.locator('input[type="password"][placeholder*="sk_test"]');
    const connectButton = page.locator('button', { hasText: 'Connect Stripe' });
    
    // Try with invalid format
    await stripeInput.fill('invalid_key');
    await connectButton.click();
    
    // Should show validation error
    await expect(page.locator('text=/must start with sk_/i')).toBeVisible();
  });

  test('should have QuickBooks OAuth button', async ({ page }) => {
    const qboButton = page.locator('button', { hasText: 'Connect QuickBooks' });
    await expect(qboButton).toBeVisible();
    await expect(qboButton).toBeEnabled();
  });

  test('should have Plaid Link button', async ({ page }) => {
    const plaidButton = page.locator('button', { hasText: 'Connect Bank Account' });
    await expect(plaidButton).toBeVisible();
    await expect(plaidButton).toBeEnabled();
  });

  test('should be responsive at mobile width', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // All cards should still be visible
    await expect(page.locator('text=Stripe')).toBeVisible();
    await expect(page.locator('text=QuickBooks Online')).toBeVisible();
    await expect(page.locator('text=Bank Connection')).toBeVisible();
  });
});
