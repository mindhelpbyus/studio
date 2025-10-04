import { test, expect } from '@playwright/test';

test.describe('Theme Consistency Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('header maintains consistent styling in light mode', async ({ page }) => {
    // Ensure light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('nexus-theme', 'light');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(100);
    
    const header = page.locator('header');
    await expect(header).toHaveScreenshot('header-light.png');
  });

  test('header maintains consistent styling in dark mode', async ({ page }) => {
    // Ensure dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nexus-theme', 'dark');
    });
    
    // Wait for theme to apply
    await page.waitForTimeout(100);
    
    const header = page.locator('header');
    await expect(header).toHaveScreenshot('header-dark.png');
  });

  test('text selection appearance in light mode', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    
    // Select some text
    const heading = page.locator('h1').first();
    await heading.click();
    await page.keyboard.down('Shift');
    await page.keyboard.press('End');
    await page.keyboard.up('Shift');
    
    await expect(page).toHaveScreenshot('text-selection-light.png');
  });

  test('text selection appearance in dark mode', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Select some text
    const heading = page.locator('h1').first();
    await heading.click();
    await page.keyboard.down('Shift');
    await page.keyboard.press('End');
    await page.keyboard.up('Shift');
    
    await expect(page).toHaveScreenshot('text-selection-dark.png');
  });

  test('focus states on interactive elements in light mode', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    await expect(page).toHaveScreenshot('focus-state-light.png');
  });

  test('focus states on interactive elements in dark mode', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Tab to first interactive element
    await page.keyboard.press('Tab');
    await page.waitForTimeout(100);
    
    await expect(page).toHaveScreenshot('focus-state-dark.png');
  });

  test('feature cards maintain consistent styling in light mode', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    
    // Scroll to features section
    await page.locator('#features').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toHaveScreenshot('features-light.png');
  });

  test('feature cards maintain consistent styling in dark mode', async ({ page }) => {
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Scroll to features section
    await page.locator('#features').scrollIntoViewIfNeeded();
    await page.waitForTimeout(200);
    
    const featuresSection = page.locator('#features');
    await expect(featuresSection).toHaveScreenshot('features-dark.png');
  });
});
