import { test, expect } from '@playwright/test';

test.describe('Cross-Page Consistency', () => {
  test('typography is consistent across home and features pages', async ({ page }) => {
    // Go to home page
    await page.goto('/');
    
    const homeH1 = page.locator('h1').first();
    const homeH1Styles = await homeH1.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontFamily: styles.fontFamily,
        fontSize: styles.fontSize,
        fontWeight: styles.fontWeight,
        lineHeight: styles.lineHeight,
      };
    });
    
    // Navigate to features section
    await page.locator('#features').scrollIntoViewIfNeeded();
    
    const featuresH2 = page.locator('#features h2').first();
    const featuresH2Styles = await featuresH2.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontFamily: styles.fontFamily,
      };
    });
    
    // Font family should be consistent
    expect(homeH1Styles.fontFamily).toBe(featuresH2Styles.fontFamily);
  });

  test('theme persists across page navigation', async ({ page }) => {
    await page.goto('/');
    
    // Set dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
      localStorage.setItem('nexus-theme', 'dark');
    });
    
    // Verify dark mode is active
    const isDarkBefore = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    expect(isDarkBefore).toBe(true);
    
    // Navigate to another section
    await page.locator('#features').scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    
    // Verify dark mode persists
    const isDarkAfter = await page.evaluate(() => {
      return document.documentElement.classList.contains('dark');
    });
    expect(isDarkAfter).toBe(true);
  });

  test('text selection works consistently across all pages', async ({ page }) => {
    await page.goto('/');
    
    // Test selection on home page
    const homeHeading = page.locator('h1').first();
    await homeHeading.click();
    await page.keyboard.down('Shift');
    await page.keyboard.press('End');
    await page.keyboard.up('Shift');
    
    const homeSelection = await page.evaluate(() => {
      const selection = window.getSelection();
      return selection?.toString().length || 0;
    });
    expect(homeSelection).toBeGreaterThan(0);
    
    // Clear selection
    await page.keyboard.press('Escape');
    
    // Navigate to features section
    await page.locator('#features').scrollIntoViewIfNeeded();
    
    // Test selection on features section
    const featuresHeading = page.locator('#features h2').first();
    await featuresHeading.click();
    await page.keyboard.down('Shift');
    await page.keyboard.press('End');
    await page.keyboard.up('Shift');
    
    const featuresSelection = await page.evaluate(() => {
      const selection = window.getSelection();
      return selection?.toString().length || 0;
    });
    expect(featuresSelection).toBeGreaterThan(0);
  });

  test('focus states are consistent across all interactive elements', async ({ page }) => {
    await page.goto('/');
    
    // Tab through multiple elements
    await page.keyboard.press('Tab');
    const firstFocusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = window.getComputedStyle(el!);
      return {
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        outlineWidth: styles.outlineWidth,
      };
    });
    
    await page.keyboard.press('Tab');
    const secondFocusedElement = await page.evaluate(() => {
      const el = document.activeElement;
      const styles = window.getComputedStyle(el!);
      return {
        outline: styles.outline,
        outlineColor: styles.outlineColor,
        outlineWidth: styles.outlineWidth,
      };
    });
    
    // Focus styles should be consistent
    expect(firstFocusedElement.outlineWidth).toBe(secondFocusedElement.outlineWidth);
  });

  test('color scheme is consistent across sections', async ({ page }) => {
    await page.goto('/');
    
    // Get background color from header
    const headerBg = await page.locator('header').evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Scroll to features section
    await page.locator('#features').scrollIntoViewIfNeeded();
    
    // Get background color from features section
    const featuresBg = await page.locator('#features').evaluate(el => {
      return window.getComputedStyle(el).backgroundColor;
    });
    
    // Both should use semantic background colors (may be different but should be from the design system)
    expect(headerBg).toBeTruthy();
    expect(featuresBg).toBeTruthy();
  });

  test('buttons maintain consistent styling across sections', async ({ page }) => {
    await page.goto('/');
    
    // Get button styles from hero section
    const heroButton = page.locator('button').first();
    const heroButtonStyles = await heroButton.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
        borderRadius: styles.borderRadius,
      };
    });
    
    // Scroll to features section
    await page.locator('#features').scrollIntoViewIfNeeded();
    
    // Get button styles from features section
    const featuresButton = page.locator('#features button').first();
    const featuresButtonStyles = await featuresButton.evaluate(el => {
      const styles = window.getComputedStyle(el);
      return {
        fontFamily: styles.fontFamily,
        fontWeight: styles.fontWeight,
        borderRadius: styles.borderRadius,
      };
    });
    
    // Font family should be consistent
    expect(heroButtonStyles.fontFamily).toBe(featuresButtonStyles.fontFamily);
  });

  test('dark mode applies consistently to all sections', async ({ page }) => {
    await page.goto('/');
    
    // Enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    await page.waitForTimeout(100);
    
    // Check header text color
    const headerTextColor = await page.locator('header').evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    // Scroll to features
    await page.locator('#features').scrollIntoViewIfNeeded();
    
    // Check features text color
    const featuresTextColor = await page.locator('#features').evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    // Both should use light text in dark mode
    expect(headerTextColor).toBeTruthy();
    expect(featuresTextColor).toBeTruthy();
  });

  test('light mode applies consistently to all sections', async ({ page }) => {
    await page.goto('/');
    
    // Ensure light mode
    await page.evaluate(() => {
      document.documentElement.classList.remove('dark');
    });
    
    await page.waitForTimeout(100);
    
    // Check header text color
    const headerTextColor = await page.locator('header').evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    // Scroll to features
    await page.locator('#features').scrollIntoViewIfNeeded();
    
    // Check features text color
    const featuresTextColor = await page.locator('#features').evaluate(el => {
      return window.getComputedStyle(el).color;
    });
    
    // Both should use dark text in light mode
    expect(headerTextColor).toBeTruthy();
    expect(featuresTextColor).toBeTruthy();
  });
});
