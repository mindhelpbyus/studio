# Pill/Badge Styling Guide

## Overview

All pill-shaped badges and highlights across the application now use consistent, high-contrast colors that work in both light and dark modes.

## Usage

### CSS Classes

Use these pre-defined classes for consistent pill styling:

```tsx
// Primary (Cyan/Teal)
<span className="pill-base pill-primary">Primary Badge</span>

// Secondary (Orange)
<span className="pill-base pill-secondary">Secondary Badge</span>

// Success (Green)
<span className="pill-base pill-success">Success Badge</span>

// Warning (Yellow/Amber)
<span className="pill-base pill-warning">Warning Badge</span>

// Error (Red)
<span className="pill-base pill-error">Error Badge</span>

// Info (Cyan)
<span className="pill-base pill-info">Info Badge</span>
```

### Tailwind Utility Classes

You can also use Tailwind utilities with the new color tokens:

```tsx
// Primary pill
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-accent-primary-bg text-accent-primary-text border border-accent-primary">
  Primary
</span>

// Success pill
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-success-bg text-success-text border border-success">
  Success
</span>

// Warning pill
<span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-warning-bg text-warning-text border border-warning">
  Warning
</span>
```

## Color Tokens

### Light Mode
- **Primary**: Light cyan background (#cffafe) with dark cyan text (#155e75)
- **Secondary**: Light orange background (#ffedd5) with dark orange text (#9a3412)
- **Success**: Light green background (#d1fae5) with dark green text (#065f46)
- **Warning**: Light yellow background (#fef3c7) with dark brown text (#92400e)
- **Error**: Light red background (#fee2e2) with dark red text (#991b1b)
- **Info**: Light cyan background (#cffafe) with dark cyan text (#155e75)

### Dark Mode
- **Primary**: Dark cyan background (#164e63) with light cyan text (#a5f3fc)
- **Secondary**: Dark orange background (#7c2d12) with light orange text (#fed7aa)
- **Success**: Dark green background (#064e3b) with light green text (#6ee7b7)
- **Warning**: Dark brown background (#78350f) with light yellow text (#fde68a)
- **Error**: Dark red background (#7f1d1d) with light red text (#fca5a5)
- **Info**: Dark cyan background (#164e63) with light cyan text (#a5f3fc)

## Accessibility

All pill/badge combinations meet WCAG AA contrast requirements:
- Light mode: 4.5:1+ contrast ratio
- Dark mode: 4.5:1+ contrast ratio

## Examples in the App

### Welcome Page
The key features section uses pill-style badges:
```tsx
<div className="pill-base pill-primary">
  <span className="w-2 h-2 bg-primary rounded-full mr-2"></span>
  HIPAA Compliant
</div>
```

### Status Indicators
```tsx
// Active status
<span className="pill-base pill-success">Active</span>

// Pending status
<span className="pill-base pill-warning">Pending</span>

// Inactive status
<span className="pill-base pill-error">Inactive</span>
```

### Feature Tags
```tsx
<span className="pill-base pill-info">New Feature</span>
<span className="pill-base pill-primary">Beta</span>
<span className="pill-base pill-secondary">Premium</span>
```

## Migration Guide

### Before (Inconsistent)
```tsx
// Different colors and styles across pages
<span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full">
  Badge
</span>
```

### After (Consistent)
```tsx
// Unified styling
<span className="pill-base pill-primary">
  Badge
</span>
```

## Best Practices

1. **Always use pill classes** for badges and status indicators
2. **Choose semantic colors** based on meaning:
   - Success: Completed, active, approved
   - Warning: Pending, attention needed
   - Error: Failed, inactive, rejected
   - Info: Informational, neutral
   - Primary: Featured, highlighted
   - Secondary: Alternative, less important

3. **Test in both modes** to ensure visibility
4. **Keep text concise** in pills (1-3 words ideal)
5. **Use icons sparingly** - only when they add clarity

## Component Integration

### NexusBadge Component
The NexusBadge component automatically uses these styles:

```tsx
import { NexusBadge } from '@/components/nexus-ui';

<NexusBadge variant="success">Active</NexusBadge>
<NexusBadge variant="warning">Pending</NexusBadge>
<NexusBadge variant="error">Failed</NexusBadge>
```

## Testing Checklist

- [ ] Pills are visible in light mode
- [ ] Pills are visible in dark mode
- [ ] Text has sufficient contrast
- [ ] Border is visible but not overwhelming
- [ ] Hover states work (if interactive)
- [ ] Pills are consistent across all pages
- [ ] Responsive sizing works on mobile
