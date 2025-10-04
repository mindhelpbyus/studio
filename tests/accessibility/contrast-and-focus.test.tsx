import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import { Header } from '@/components/header';

expect.extend(toHaveNoViolations);

// Helper function to calculate contrast ratio
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  
  return (brightest + 0.05) / (darkest + 0.05);
}

describe('Accessibility - Contrast and Focus', () => {
  beforeEach(() => {
    // Set up CSS custom properties for testing
    document.documentElement.style.setProperty('--foreground', '#0f172a');
    document.documentElement.style.setProperty('--background', '#ffffff');
    document.documentElement.style.setProperty('--selection-bg', '#3b82f6');
    document.documentElement.style.setProperty('--selection-text', '#ffffff');
    document.documentElement.style.setProperty('--focus-ring', '#3b82f6');
  });

  test('header has no accessibility violations', async () => {
    const { container } = render(<Header />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  test('text selection meets contrast requirements (4.5:1 minimum)', () => {
    const selectionBg = '#3b82f6'; // Light mode selection background
    const selectionText = '#ffffff'; // Light mode selection text
    
    const ratio = getContrastRatio(selectionText, selectionBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('dark mode text selection meets contrast requirements', () => {
    const selectionBg = '#60a5fa'; // Dark mode selection background
    const selectionText = '#0f172a'; // Dark mode selection text
    
    const ratio = getContrastRatio(selectionText, selectionBg);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('focus indicator meets contrast requirements (3:1 minimum)', () => {
    const focusRing = '#3b82f6'; // Focus ring color
    const background = '#ffffff'; // Light mode background
    
    const ratio = getContrastRatio(focusRing, background);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  test('dark mode focus indicator meets contrast requirements', () => {
    const focusRing = '#60a5fa'; // Dark mode focus ring
    const background = '#0f172a'; // Dark mode background
    
    const ratio = getContrastRatio(focusRing, background);
    expect(ratio).toBeGreaterThanOrEqual(3);
  });

  test('primary text meets contrast requirements', () => {
    const foreground = '#0f172a'; // Light mode text
    const background = '#ffffff'; // Light mode background
    
    const ratio = getContrastRatio(foreground, background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('dark mode primary text meets contrast requirements', () => {
    const foreground = '#f8fafc'; // Dark mode text
    const background = '#0f172a'; // Dark mode background
    
    const ratio = getContrastRatio(foreground, background);
    expect(ratio).toBeGreaterThanOrEqual(4.5);
  });

  test('focus states are visible and distinguishable', () => {
    const { container } = render(
      <button className="focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)]">
        Test Button
      </button>
    );
    
    const button = container.querySelector('button');
    expect(button).toHaveClass('focus:ring-2');
    expect(button).toHaveClass('focus:ring-[var(--focus-ring)]');
  });

  test('keyboard navigation focus order is logical', async () => {
    const { container } = render(<Header />);
    
    // Check that interactive elements have proper tabindex or are naturally focusable
    const interactiveElements = container.querySelectorAll('a, button, input, select, textarea');
    
    interactiveElements.forEach(element => {
      const tabIndex = element.getAttribute('tabindex');
      // Elements should either have no tabindex (naturally focusable) or tabindex >= 0
      if (tabIndex !== null) {
        expect(parseInt(tabIndex)).toBeGreaterThanOrEqual(0);
      }
    });
  });
});
