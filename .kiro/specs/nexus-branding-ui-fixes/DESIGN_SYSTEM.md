# Nexus CRM Design System

## Overview

This document defines the unified design system for Nexus CRM. All components and pages should use these tokens exclusively.

## Design Principles

1. **Consistency**: Use design tokens, never hardcoded values
2. **Accessibility**: Maintain WCAG AA contrast ratios (4.5:1 for text)
3. **Simplicity**: One system, one source of truth
4. **Scalability**: Easy to maintain and extend

## Color System

### Primary Colors
```css
/* Light Mode */
--primary-50: #eff6ff;   /* Lightest blue */
--primary-100: #dbeafe;
--primary-200: #bfdbfe;
--primary-300: #93c5fd;
--primary-400: #60a5fa;
--primary-500: #3b82f6;  /* Main primary */
--primary-600: #2563eb;  /* Primary hover */
--primary-700: #1d4ed8;
--primary-800: #1e40af;
--primary-900: #1e3a8a;  /* Darkest blue */

/* Dark Mode - Lighter shades for better visibility */
--primary-dark-400: #60a5fa;
--primary-dark-500: #3b82f6;
--primary-dark-600: #2563eb;
```

### Neutral Colors
```css
/* Light Mode */
--neutral-50: #f8fafc;   /* Lightest gray */
--neutral-100: #f1f5f9;  /* Surface */
--neutral-200: #e2e8f0;  /* Border */
--neutral-300: #cbd5e1;
--neutral-400: #94a3b8;
--neutral-500: #64748b;
--neutral-600: #475569;  /* Secondary text */
--neutral-700: #334155;
--neutral-800: #1e293b;
--neutral-900: #0f172a;  /* Primary text */

/* Dark Mode */
--neutral-dark-50: #0f172a;   /* Background */
--neutral-dark-100: #1e293b;  /* Surface */
--neutral-dark-200: #334155;  /* Border */
--neutral-dark-300: #475569;
--neutral-dark-400: #64748b;
--neutral-dark-500: #94a3b8;
--neutral-dark-600: #cbd5e1;  /* Secondary text */
--neutral-dark-700: #e2e8f0;
--neutral-dark-800: #f1f5f9;
--neutral-dark-900: #f8fafc;  /* Primary text */
```

### Semantic Colors
```css
/* Success */
--success-light: #10b981;
--success-dark: #34d399;

/* Warning */
--warning-light: #f59e0b;
--warning-dark: #fbbf24;

/* Error */
--error-light: #ef4444;
--error-dark: #f87171;

/* Info */
--info-light: #06b6d4;
--info-dark: #22d3ee;
```

### Accent Colors
```css
/* Accent Primary (Cyan) */
--accent-primary-light: #06b6d4;
--accent-primary-dark: #22d3ee;

/* Accent Secondary (Orange) */
--accent-secondary-light: #f97316;
--accent-secondary-dark: #fb923c;
```

## Typography

### Font Families
```css
--font-sans: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
```

### Font Sizes
```css
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
--text-4xl: 2.25rem;   /* 36px */
--text-5xl: 3rem;      /* 48px */
--text-6xl: 3.75rem;   /* 60px */
```

### Font Weights
```css
--font-normal: 400;
--font-medium: 500;
--font-semibold: 600;
--font-bold: 700;
```

### Line Heights
```css
--leading-tight: 1.25;
--leading-snug: 1.375;
--leading-normal: 1.5;
--leading-relaxed: 1.625;
--leading-loose: 2;
```

## Spacing

### Spacing Scale
```css
--space-0: 0;
--space-1: 0.25rem;   /* 4px */
--space-2: 0.5rem;    /* 8px */
--space-3: 0.75rem;   /* 12px */
--space-4: 1rem;      /* 16px */
--space-5: 1.25rem;   /* 20px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
--space-10: 2.5rem;   /* 40px */
--space-12: 3rem;     /* 48px */
--space-16: 4rem;     /* 64px */
--space-20: 5rem;     /* 80px */
--space-24: 6rem;     /* 96px */
```

## Border Radius

```css
--radius-none: 0;
--radius-sm: 0.375rem;  /* 6px */
--radius-md: 0.5rem;    /* 8px */
--radius-lg: 0.75rem;   /* 12px */
--radius-xl: 1rem;      /* 16px */
--radius-2xl: 1.5rem;   /* 24px */
--radius-full: 9999px;
```

## Shadows

```css
/* Light Mode */
--shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
--shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
--shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
--shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
--shadow-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.25);

/* Dark Mode */
--shadow-dark-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
--shadow-dark-md: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3);
--shadow-dark-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.4);
--shadow-dark-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.6), 0 10px 10px -5px rgba(0, 0, 0, 0.5);
--shadow-dark-2xl: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
```

## Transitions

```css
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;

--easing-default: cubic-bezier(0.4, 0, 0.2, 1);
--easing-in: cubic-bezier(0.4, 0, 1, 1);
--easing-out: cubic-bezier(0, 0, 0.2, 1);
--easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);
```

## Component Specifications

### Buttons

#### Sizes
```css
/* Small */
height: 32px;
padding: 0 12px;
font-size: var(--text-sm);

/* Medium (default) */
height: 40px;
padding: 0 16px;
font-size: var(--text-base);

/* Large */
height: 48px;
padding: 0 24px;
font-size: var(--text-lg);
```

#### Variants

**Primary**
```css
/* Light Mode */
background: var(--primary-600);
color: white;
hover: var(--primary-700);
active: var(--primary-800);

/* Dark Mode */
background: var(--primary-dark-500);
color: var(--neutral-dark-50);
hover: var(--primary-dark-600);
active: var(--primary-dark-700);
```

**Secondary**
```css
/* Light Mode */
background: var(--neutral-100);
color: var(--neutral-900);
border: 1px solid var(--neutral-200);
hover: var(--neutral-200);

/* Dark Mode */
background: var(--neutral-dark-100);
color: var(--neutral-dark-900);
border: 1px solid var(--neutral-dark-200);
hover: var(--neutral-dark-200);
```

**Outline**
```css
/* Light Mode */
background: transparent;
color: var(--primary-600);
border: 1px solid var(--primary-600);
hover: background var(--primary-50);

/* Dark Mode */
background: transparent;
color: var(--primary-dark-400);
border: 1px solid var(--primary-dark-400);
hover: background var(--neutral-dark-100);
```

**Ghost**
```css
/* Light Mode */
background: transparent;
color: var(--neutral-700);
hover: background var(--neutral-100);

/* Dark Mode */
background: transparent;
color: var(--neutral-dark-600);
hover: background var(--neutral-dark-100);
```

**Destructive**
```css
/* Light Mode */
background: var(--error-light);
color: white;
hover: darken 10%;

/* Dark Mode */
background: var(--error-dark);
color: var(--neutral-dark-50);
hover: lighten 10%;
```

#### States
```css
/* Focus */
outline: none;
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);

/* Disabled */
opacity: 0.5;
cursor: not-allowed;
pointer-events: none;
```

### Cards

```css
/* Light Mode */
background: white;
border: 1px solid var(--neutral-200);
border-radius: var(--radius-lg);
padding: var(--space-6);
box-shadow: var(--shadow-sm);

/* Dark Mode */
background: var(--neutral-dark-100);
border: 1px solid var(--neutral-dark-200);
border-radius: var(--radius-lg);
padding: var(--space-6);
box-shadow: var(--shadow-dark-sm);

/* Hover */
transform: translateY(-2px);
box-shadow: var(--shadow-md) / var(--shadow-dark-md);
```

### Form Inputs

```css
/* Light Mode */
height: 40px;
padding: 0 var(--space-3);
background: white;
border: 1px solid var(--neutral-300);
border-radius: var(--radius-md);
color: var(--neutral-900);
font-size: var(--text-base);

/* Dark Mode */
background: var(--neutral-dark-100);
border: 1px solid var(--neutral-dark-300);
color: var(--neutral-dark-900);

/* Focus */
border-color: var(--primary-600) / var(--primary-dark-400);
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);

/* Error */
border-color: var(--error-light) / var(--error-dark);
box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
```

### Labels

```css
font-size: var(--text-sm);
font-weight: var(--font-medium);
color: var(--neutral-700) / var(--neutral-dark-600);
margin-bottom: var(--space-2);
```

## Usage Guidelines

### DO ✅
- Use CSS variables for all colors
- Use design tokens for spacing, typography, and border-radius
- Maintain consistent component styling
- Test in both light and dark modes
- Ensure WCAG AA contrast ratios

### DON'T ❌
- Use hardcoded colors (e.g., `#3b82f6`, `bg-blue-500`)
- Mix Tailwind utility classes with custom values
- Create one-off component styles
- Skip dark mode testing
- Use inconsistent spacing or typography

## Migration Guide

### From Hardcoded Colors
```css
/* Before */
className="bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200"

/* After */
className="bg-background text-foreground"
```

### From Tailwind Utilities
```css
/* Before */
className="p-4 rounded-lg text-sm"

/* After */
className="p-[var(--space-4)] rounded-[var(--radius-lg)] text-[var(--text-sm)]"
/* Or use Tailwind config with design tokens */
```

### From Multiple Systems
```css
/* Before */
className="nexus-bg-surface bg-slate-100 dark:bg-slate-800"

/* After */
className="bg-surface"
/* With proper CSS variable definition */
```

## Accessibility

### Contrast Ratios (WCAG AA)
- Normal text: 4.5:1 minimum
- Large text (18px+): 3:1 minimum
- UI components: 3:1 minimum

### Focus Indicators
- Always visible
- 2-3px width
- High contrast color
- Consistent across all interactive elements

### Color Blindness
- Don't rely on color alone
- Use icons, labels, and patterns
- Test with color blindness simulators

## Testing Checklist

- [ ] All colors use CSS variables
- [ ] Light mode contrast ratios meet WCAG AA
- [ ] Dark mode contrast ratios meet WCAG AA
- [ ] Typography is consistent across pages
- [ ] Spacing is consistent across components
- [ ] Border radius is consistent
- [ ] Shadows are appropriate for theme
- [ ] Buttons have all states (hover, active, focus, disabled)
- [ ] Forms are accessible
- [ ] Theme switching works smoothly
- [ ] No hardcoded colors remain
- [ ] Mobile responsive
- [ ] Cross-browser compatible
