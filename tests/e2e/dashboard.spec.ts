import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Dashboard Page', () => {
  test('should load dashboard with stats cards', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for main dashboard heading
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible();
    
    // Check for stats cards
    await expect(page.getByText('Transactions Matched')).toBeVisible();
    await expect(page.getByText('Exceptions Requiring Action')).toBeVisible();
  });

  test('should have Sync Now button', async ({ page }) => {
    await page.goto('/dashboard');
    
    const syncButton = page.getByRole('button', { name: /Sync Now/i });
    await expect(syncButton).toBeVisible();
    await expect(syncButton).toBeEnabled();
  });

  test('should display exceptions table', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Check for Exceptions Inbox heading
    await expect(page.getByRole('heading', { name: /Exceptions Inbox/i })).toBeVisible();
  });

  test('should display recent matches section', async ({ page }) => {
    await page.goto('/dashboard');
    
    await expect(page.getByRole('heading', { name: /Recent Matches/i })).toBeVisible();
  });

  test('@a11y should have no accessibility violations', async ({ page }) => {
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
    
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});

