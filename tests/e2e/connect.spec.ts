import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Connect Page', () => {
  test('should load and display connection tiles', async ({ page }) => {
    await page.goto('/connect');
    
    // Check for all three connection options
    await expect(page.getByRole('heading', { name: 'Stripe' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'QuickBooks' })).toBeVisible();
    await expect(page.getByRole('heading', { name: /Bank/i })).toBeVisible();
  });

  test('should show Stripe input field', async ({ page }) => {
    await page.goto('/connect');
    
    // Find Stripe secret key input
    const stripeInput = page.getByPlaceholder(/sk_test/i);
    await expect(stripeInput).toBeVisible();
  });

  test('should have Connect buttons for each service', async ({ page }) => {
    await page.goto('/connect');
    
    await expect(page.getByRole('button', { name: /Connect Stripe/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Connect QuickBooks/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Connect Test Bank/i })).toBeVisible();
  });

  test('@a11y should have no accessibility violations', async ({ page }) => {
    await page.goto('/connect');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

