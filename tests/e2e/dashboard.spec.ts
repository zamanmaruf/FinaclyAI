import { test, expect } from '@playwright/test';

test.describe('Dashboard Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard
    await page.goto('/dashboard');
  });

  test('should display dashboard with main sections', async ({ page }) => {
    // Check page title
    await expect(page.locator('h4').first()).toContainText('Dashboard');
    
    // Check for sync button
    const syncButton = page.locator('button', { hasText: /sync now/i });
    await expect(syncButton).toBeVisible();
  });

  test('should show stat cards', async ({ page }) => {
    // Wait for stats to load (or skeleton to appear)
    await page.waitForTimeout(1000);
    
    // Check for stat card labels
    const matchedLabel = page.locator('text=/matched transactions/i').first();
    const exceptionsLabel = page.locator('text=/exceptions/i').first();
    const lastSyncLabel = page.locator('text=/last sync/i').first();
    
    // At least one should be visible
    const anyVisible = await matchedLabel.isVisible().catch(() => false) ||
                      await exceptionsLabel.isVisible().catch(() => false) ||
                      await lastSyncLabel.isVisible().catch(() => false);
    
    expect(anyVisible).toBe(true);
  });

  test('should have exceptions section', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Check for exceptions heading
    const exceptionsHeading = page.locator('text=/exceptions inbox/i').first();
    await expect(exceptionsHeading).toBeVisible();
  });

  test('should have recent matches section', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);
    
    // Check for recent matches heading
    const matchesHeading = page.locator('text=/recent matches/i').first();
    await expect(matchesHeading).toBeVisible();
  });

  test('should handle sync button click', async ({ page }) => {
    const syncButton = page.locator('button', { hasText: /sync now/i });
    
    // Click sync
    await syncButton.click();
    
    // Should show loading state
    const loadingIndicator = page.locator('button', { hasText: /syncing/i });
    await expect(loadingIndicator).toBeVisible({ timeout: 2000 });
    
    // Wait for sync to complete (up to 30s)
    await expect(syncButton).toBeVisible({ timeout: 30000 });
  });

  test('should be responsive at mobile width', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Main heading should be visible
    await expect(page.locator('h4').first()).toBeVisible();
    
    // Sync button should be visible
    const syncButton = page.locator('button', { hasText: /sync now/i });
    await expect(syncButton).toBeVisible();
  });

  test('should be responsive at tablet width', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    
    // Main heading should be visible
    await expect(page.locator('h4').first()).toBeVisible();
    
    // Sync button should be visible
    const syncButton = page.locator('button', { hasText: /sync now/i });
    await expect(syncButton).toBeVisible();
  });
});
