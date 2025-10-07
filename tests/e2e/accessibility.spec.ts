import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/**
 * Accessibility tests using axe-core
 * Runs automated accessibility checks on key pages
 * @tag @a11y
 */

test.describe('Accessibility Tests @a11y', () => {
  test('landing page should have no serious accessibility violations', async ({ page }) => {
    await page.goto('/');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    // No critical or serious violations allowed
    const seriousViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(seriousViolations).toEqual([]);
  });

  test('login page should have no serious accessibility violations', async ({ page }) => {
    await page.goto('/login');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const seriousViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(seriousViolations).toEqual([]);
  });

  test('connect page should have no serious accessibility violations', async ({ page }) => {
    await page.goto('/connect');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const seriousViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(seriousViolations).toEqual([]);
  });

  test('dashboard page should have no serious accessibility violations', async ({ page }) => {
    await page.goto('/dashboard');
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const seriousViolations = accessibilityScanResults.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    );
    
    expect(seriousViolations).toEqual([]);
  });

  test('keyboard navigation should work on landing page', async ({ page }) => {
    await page.goto('/');
    
    // Press Tab to navigate
    await page.keyboard.press('Tab');
    
    // Check that focus is visible
    const focusedElement = await page.evaluate(() => {
      const element = document.activeElement;
      return element?.tagName;
    });
    
    // Should focus on an interactive element
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  });

  test('keyboard navigation should work on connect page', async ({ page }) => {
    await page.goto('/connect');
    
    // Press Tab multiple times
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check that focus moves between elements
    const focusedElement = await page.evaluate(() => {
      const element = document.activeElement;
      return element?.tagName;
    });
    
    expect(['A', 'BUTTON', 'INPUT']).toContain(focusedElement);
  });
});

