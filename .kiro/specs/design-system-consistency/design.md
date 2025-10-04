# Design Document

## Overview

This design document outlines the technical approach to standardizing the design system across the Nexus healthcare CRM platform. The solution focuses on enforcing consistent typography, text selection behaviors, and color usage across both light and dark modes through centralized CSS custom properties, Tailwind configuration, and component-level refactoring.

The design leverages the existing CSS custom property system defined in `globals.css` and extends it to cover all edge cases, including text selection, focus states, and component-specific styling. The approach ensures that all future components automatically inherit the standardized design system.

## Architecture

### Design System Layers

```
┌─────────────────────────────────────────────────────────┐
│                    Application Layer                     │
│  (Pages, Features, Business Logic Components)           │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                   Component Layer                        │
│  (NexusButton, NexusCard, Header, FeaturesList, etc.)  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  Design Token Layer                      │
│  (Tailwind Config + design-tokens.json)                 │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              CSS Custom Properties Layer                 │
│  (globals.css :root and .dark definitions)              │
└─────────────────────────────────────────────────────────┘
```

### Key Principles

1. **Single Source of Truth**: All design values originate from CSS custom properties in `globals.css`
2. **Theme Agnostic Components**: Components reference semantic tokens, not hardcoded values
3. **Automatic Theme Switching**: Dark mode values automatically apply when `.dark` class is present
4. **Accessibility First**: All color combinations meet WCAG 2.1 AA standards
5. **Progressive Enhancement**: Fallback values for browsers without CSS custom property support

## Components and Interfaces

### 1. Enhanced CSS Custom Properties

**Location**: `src/app/globals.css`

**New Properties to Add**:

```css
:root {
  /* === Selection and Highlight Colors === */
  --selection-bg: #3b82f6;           /* Primary blue with opacity */
  --selection-text: #ffffff;          /* White text on selection */
  
  /* === Focus Ring Colors === */
  --focus-ring: #3b82f6;
  --focus-ring-offset: #ffffff;
  
  /* === Nexus Semantic Colors (for Tailwind) === */
  --nexus-bg-surface: var(--surface);
  --nexus-bg-elevated: var(--elevated);
  --nexus-text-primary: var(--foreground);
  --nexus-text-secondary: var(--text-secondary);
  --nexus-text-muted: var(--text-muted);
  --nexus-border: var(--border);
  --nexus-accent-primary: var(--accent-primary);
  --nexus-accent-secondary: var(--accent-secondary);
}

.dark {
  /* === Selection and Highlight Colors === */
  --selection-bg: #60a5fa;           /* Lighter blue for dark mode */
  --selection-text: #0f172a;          /* Dark text on selection */
  
  /* === Focus Ring Colors === */
  --focus-ring: #60a5fa;
  --focus-ring-offset: #0f172a;
}
```

### 2. Global Selection Styling

**Location**: `src/app/globals.css` (new @layer base rules)

```css
@layer base {
  /* Universal text selection styling */
  ::selection {
    background-color: rgba(59, 130, 246, 0.3);
    color: var(--foreground);
  }
  
  ::-moz-selection {
    background-color: rgba(59, 130, 246, 0.3);
    color: var(--foreground);
  }
  
  .dark ::selection {
    background-color: rgba(96, 165, 250, 0.3);
    color: var(--foreground);
  }
  
  .dark ::-moz-selection {
    background-color: rgba(96, 165, 250, 0.3);
    color: var(--foreground);
  }
  
  /* Override selection for gradient text */
  .text-gradient::selection,
  .nexus-gradient-text::selection {
    -webkit-text-fill-color: var(--foreground);
    background-color: rgba(59, 130, 246, 0.3);
  }
  
  /* Focus ring standardization */
  *:focus-visible {
    outline: 2px solid var(--focus-ring);
    outline-offset: 2px;
  }
  
  /* Remove default focus outline but keep for keyboard navigation */
  *:focus:not(:focus-visible) {
    outline: none;
  }
}
```

### 3. Typography Enforcement System

**Location**: `src/app/globals.css` (enhanced @layer base rules)

```css
@layer base {
  /* Enforce font family on all elements */
  * {
    font-family: var(--font-sans);
  }
  
  /* Typography scale enforcement */
  h1, .text-h1 {
    font-size: var(--text-4xl);
    font-weight: var(--font-bold);
    line-height: var(--leading-tight);
    color: var(--foreground);
  }
  
  h2, .text-h2 {
    font-size: var(--text-3xl);
    font-weight: var(--font-bold);
    line-height: var(--leading-tight);
    color: var(--foreground);
  }
  
  h3, .text-h3 {
    font-size: var(--text-2xl);
    font-weight: var(--font-semibold);
    line-height: var(--leading-snug);
    color: var(--foreground);
  }
  
  h4, .text-h4 {
    font-size: var(--text-xl);
    font-weight: var(--font-semibold);
    line-height: var(--leading-snug);
    color: var(--foreground);
  }
  
  h5, .text-h5 {
    font-size: var(--text-lg);
    font-weight: var(--font-medium);
    line-height: var(--leading-normal);
    color: var(--foreground);
  }
  
  h6, .text-h6 {
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    line-height: var(--leading-normal);
    color: var(--foreground);
  }
  
  p, .text-body {
    font-size: var(--text-base);
    font-weight: var(--font-normal);
    line-height: var(--leading-relaxed);
    color: var(--foreground);
  }
  
  /* Form elements */
  input, textarea, select {
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: var(--font-normal);
    line-height: var(--leading-normal);
    color: var(--foreground);
  }
  
  /* Buttons */
  button {
    font-family: var(--font-sans);
    font-size: var(--text-base);
    font-weight: var(--font-medium);
    line-height: var(--leading-normal);
  }
  
  /* Labels */
  label {
    font-family: var(--font-sans);
    font-size: var(--text-sm);
    font-weight: var(--font-medium);
    line-height: var(--leading-normal);
    color: var(--foreground);
  }
}
```

### 4. Tailwind Configuration Enhancement

**Location**: `tailwind.config.ts`

**Additions**:

```typescript
export default {
  theme: {
    extend: {
      colors: {
        // Add nexus-prefixed semantic colors for easier component usage
        'nexus-bg-surface': 'var(--surface)',
        'nexus-bg-elevated': 'var(--elevated)',
        'nexus-text-primary': 'var(--foreground)',
        'nexus-text-secondary': 'var(--text-secondary)',
        'nexus-text-muted': 'var(--text-muted)',
        'nexus-border': 'var(--border)',
        'nexus-accent-primary': 'var(--accent-primary)',
        'nexus-accent-secondary': 'var(--accent-secondary)',
      },
      // Ensure typography uses CSS custom properties
      fontSize: {
        'xs': 'var(--text-xs)',
        'sm': 'var(--text-sm)',
        'base': 'var(--text-base)',
        'lg': 'var(--text-lg)',
        'xl': 'var(--text-xl)',
        '2xl': 'var(--text-2xl)',
        '3xl': 'var(--text-3xl)',
        '4xl': 'var(--text-4xl)',
        '5xl': 'var(--text-5xl)',
        '6xl': 'var(--text-6xl)',
      },
      fontWeight: {
        'normal': 'var(--font-normal)',
        'medium': 'var(--font-medium)',
        'semibold': 'var(--font-semibold)',
        'bold': 'var(--font-bold)',
      },
    },
  },
} satisfies Config;
```

### 5. Component Refactoring Pattern

**Pattern for All Components**:

```typescript
// BEFORE (hardcoded colors)
<div className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">

// AFTER (using design tokens)
<div className="bg-nexus-bg-surface text-nexus-text-primary">

// BEFORE (hardcoded typography)
<h2 className="text-3xl font-bold">

// AFTER (using design tokens)
<h2 className="text-h2">
```

### 6. Header Component Refactoring

**Location**: `src/components/header.tsx`

**Key Changes**:

1. Remove hardcoded color classes like `text-slate-700 dark:text-slate-200`
2. Replace with semantic tokens: `text-nexus-text-primary`
3. Standardize hover states: `hover:text-nexus-accent-primary`
4. Ensure focus states use global focus ring styling
5. Add `user-select: none` to non-selectable elements

**Example Refactoring**:

```typescript
// Navigation Link - BEFORE
<Link 
  href="#" 
  className="font-semibold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400"
>

// Navigation Link - AFTER
<Link 
  href="#" 
  className="font-semibold text-nexus-text-primary hover:text-nexus-accent-primary nexus-transition"
>
```

### 7. NexusButton Component Enhancement

**Location**: `src/components/nexus-ui/NexusButton.tsx`

**Changes**:

1. Replace all hardcoded color values with CSS custom properties
2. Ensure focus ring uses global `--focus-ring` variable
3. Update variant classes to use semantic tokens

**Example**:

```typescript
const variantClasses: Record<string, string[]> = {
  primary: [
    'bg-primary',
    'text-primary-foreground',
    'hover:bg-primary-hover',
    'focus:ring-[var(--focus-ring)]',
  ],
  // ... other variants
}
```

## Data Models

### Design Token Structure

```typescript
interface DesignTokens {
  colors: {
    // Base colors
    background: string;
    foreground: string;
    surface: string;
    elevated: string;
    
    // Text colors
    'text-primary': string;
    'text-secondary': string;
    'text-muted': string;
    
    // Semantic colors
    primary: string;
    'primary-hover': string;
    'primary-foreground': string;
    
    // Selection colors
    'selection-bg': string;
    'selection-text': string;
    
    // Focus colors
    'focus-ring': string;
    'focus-ring-offset': string;
    
    // Accent colors
    'accent-primary': string;
    'accent-secondary': string;
    
    // Border and input
    border: string;
    input: string;
    ring: string;
  };
  
  typography: {
    fontFamily: {
      sans: string;
      mono: string;
    };
    fontSize: {
      xs: string;
      sm: string;
      base: string;
      lg: string;
      xl: string;
      '2xl': string;
      '3xl': string;
      '4xl': string;
      '5xl': string;
      '6xl': string;
    };
    fontWeight: {
      normal: number;
      medium: number;
      semibold: number;
      bold: number;
    };
    lineHeight: {
      tight: number;
      snug: number;
      normal: number;
      relaxed: number;
      loose: number;
    };
  };
  
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
  transitions: {
    duration: {
      fast: string;
      normal: string;
      slow: string;
    };
    easing: {
      default: string;
      in: string;
      out: string;
      inOut: string;
    };
  };
}
```

### Theme Mode Type

```typescript
type ThemeMode = 'light' | 'dark';

interface ThemeContext {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  isDark: boolean;
  isLight: boolean;
}
```

## Error Handling

### 1. CSS Custom Property Fallbacks

All CSS custom properties should include fallback values for browsers that don't support them:

```css
color: #0f172a; /* Fallback */
color: var(--foreground, #0f172a); /* With fallback */
```

### 2. Theme Loading State

Handle the flash of unstyled content (FOUC) during theme initialization:

```typescript
// In useNexusTheme hook
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  // Initialize theme
  const savedTheme = localStorage.getItem('nexus-theme');
  if (savedTheme) {
    applyTheme(savedTheme);
  }
  setIsLoading(false);
}, []);

// In layout
{isLoading ? <LoadingScreen /> : children}
```

### 3. Invalid Color Value Detection

Add runtime validation for development:

```typescript
if (process.env.NODE_ENV === 'development') {
  const validateDesignTokens = () => {
    const root = getComputedStyle(document.documentElement);
    const requiredTokens = ['--foreground', '--background', '--primary'];
    
    requiredTokens.forEach(token => {
      const value = root.getPropertyValue(token);
      if (!value) {
        console.warn(`Missing design token: ${token}`);
      }
    });
  };
  
  validateDesignTokens();
}
```

### 4. Contrast Ratio Validation

Implement automated contrast checking:

```typescript
function getContrastRatio(color1: string, color2: string): number {
  // Calculate relative luminance and contrast ratio
  // Return ratio (should be >= 4.5 for WCAG AA)
}

function validateColorPairs() {
  const pairs = [
    ['--foreground', '--background'],
    ['--primary-foreground', '--primary'],
    ['--selection-text', '--selection-bg'],
  ];
  
  pairs.forEach(([fg, bg]) => {
    const ratio = getContrastRatio(
      getComputedStyle(document.documentElement).getPropertyValue(fg),
      getComputedStyle(document.documentElement).getPropertyValue(bg)
    );
    
    if (ratio < 4.5) {
      console.error(`Insufficient contrast between ${fg} and ${bg}: ${ratio}`);
    }
  });
}
```

## Testing Strategy

### 1. Visual Regression Testing

**Tool**: Playwright with screenshot comparison

**Test Cases**:
- Header component in light mode
- Header component in dark mode
- Text selection appearance in both modes
- Focus states on all interactive elements
- Typography consistency across pages

**Example Test**:

```typescript
test('header maintains consistent styling in light mode', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.documentElement.classList.remove('dark'));
  await expect(page.locator('header')).toHaveScreenshot('header-light.png');
});

test('header maintains consistent styling in dark mode', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.documentElement.classList.add('dark'));
  await expect(page.locator('header')).toHaveScreenshot('header-dark.png');
});
```

### 2. Accessibility Testing

**Tool**: axe-core + jest-axe

**Test Cases**:
- Color contrast ratios meet WCAG 2.1 AA
- Focus indicators are visible
- Text selection is readable
- Keyboard navigation works correctly

**Example Test**:

```typescript
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

test('header has no accessibility violations', async () => {
  const { container } = render(<Header />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

test('text selection meets contrast requirements', () => {
  const selectionBg = getComputedStyle(document.documentElement)
    .getPropertyValue('--selection-bg');
  const selectionText = getComputedStyle(document.documentElement)
    .getPropertyValue('--selection-text');
  
  const ratio = getContrastRatio(selectionText, selectionBg);
  expect(ratio).toBeGreaterThanOrEqual(4.5);
});
```

### 3. Component Unit Testing

**Tool**: Jest + React Testing Library

**Test Cases**:
- Components render with correct CSS classes
- Theme switching updates component appearance
- Typography classes are applied correctly
- Hover and focus states work as expected

**Example Test**:

```typescript
test('NexusButton uses design token classes', () => {
  const { container } = render(<NexusButton variant="primary">Click me</NexusButton>);
  const button = container.querySelector('button');
  
  expect(button).toHaveClass('bg-primary');
  expect(button).toHaveClass('text-primary-foreground');
  expect(button).not.toHaveClass('bg-blue-600'); // No hardcoded colors
});

test('Header navigation uses semantic color tokens', () => {
  const { getByText } = render(<Header />);
  const link = getByText('Features');
  
  expect(link).toHaveClass('text-nexus-text-primary');
  expect(link).not.toHaveClass('text-slate-700'); // No hardcoded colors
});
```

### 4. Integration Testing

**Tool**: Playwright

**Test Cases**:
- Theme persists across page navigation
- All pages use consistent typography
- Text selection works consistently across all pages
- Focus states are consistent across all interactive elements

**Example Test**:

```typescript
test('typography is consistent across pages', async ({ page }) => {
  await page.goto('/');
  const homeH1 = await page.locator('h1').first();
  const homeH1Styles = await homeH1.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
    };
  });
  
  await page.goto('/providers');
  const providersH1 = await page.locator('h1').first();
  const providersH1Styles = await providersH1.evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      fontFamily: styles.fontFamily,
      fontSize: styles.fontSize,
      fontWeight: styles.fontWeight,
    };
  });
  
  expect(homeH1Styles).toEqual(providersH1Styles);
});
```

### 5. Manual Testing Checklist

- [ ] Select text in header navigation (light mode)
- [ ] Select text in header navigation (dark mode)
- [ ] Select text in feature cards (light mode)
- [ ] Select text in feature cards (dark mode)
- [ ] Tab through all interactive elements and verify focus indicators
- [ ] Switch between light and dark modes multiple times
- [ ] Verify typography consistency on all pages
- [ ] Test with browser zoom at 200%
- [ ] Test with Windows High Contrast mode
- [ ] Test with screen reader (NVDA/JAWS)

## Implementation Phases

### Phase 1: Foundation (CSS Custom Properties)
1. Add new selection and focus color variables to `globals.css`
2. Add global selection styling rules
3. Add global focus ring styling rules
4. Update typography enforcement rules

### Phase 2: Tailwind Configuration
1. Update `tailwind.config.ts` with semantic color tokens
2. Add typography scale using CSS custom properties
3. Add font weight mappings

### Phase 3: Component Refactoring
1. Refactor `Header` component
2. Refactor `NexusButton` component
3. Refactor `NexusCard` component
4. Refactor `FeaturesList` component
5. Audit and refactor remaining components

### Phase 4: Testing
1. Set up visual regression tests
2. Set up accessibility tests
3. Set up component unit tests
4. Set up integration tests
5. Perform manual testing

### Phase 5: Documentation
1. Create design system documentation
2. Create component usage guidelines
3. Create contribution guidelines for maintaining consistency
