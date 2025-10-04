# Implementation Plan

- [x] 1. Enhance CSS custom properties for selection and focus states
  - Add selection color variables (--selection-bg, --selection-text) to both :root and .dark in globals.css
  - Add focus ring color variables (--focus-ring, --focus-ring-offset) to both :root and .dark
  - Add nexus-prefixed semantic color variables for easier component usage
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 5.1_

- [x] 2. Implement global text selection styling
  - Add ::selection and ::-moz-selection pseudo-element styles to @layer base in globals.css
  - Implement light mode selection with rgba(59, 130, 246, 0.3) background
  - Implement dark mode selection with rgba(96, 165, 250, 0.3) background
  - Add special handling for gradient text selection to override -webkit-text-fill-color
  - _Requirements: 2.1, 2.2, 2.4, 2.6_

- [x] 3. Implement global focus ring standardization
  - Add *:focus-visible rule with outline using var(--focus-ring) in globals.css
  - Add *:focus:not(:focus-visible) rule to remove outline for mouse clicks
  - Ensure 2px outline with 2px offset for visibility
  - _Requirements: 2.3, 4.2, 6.2, 6.3, 6.4_

- [x] 4. Enhance typography enforcement in base layer
  - Update existing typography rules in @layer base to use CSS custom properties
  - Add font-family: var(--font-sans) to universal selector
  - Update h1-h6 rules to use --text-* and --font-* variables
  - Update p, input, textarea, select, button, label rules to use CSS custom properties
  - Ensure all typography uses --foreground for color
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 5.2_

- [x] 5. Update Tailwind configuration with semantic tokens
  - Add nexus-prefixed color tokens to tailwind.config.ts colors.extend
  - Update fontSize configuration to reference CSS custom properties
  - Update fontWeight configuration to reference CSS custom properties
  - Ensure all tokens use var() references to globals.css
  - _Requirements: 3.1, 3.2, 3.4, 5.1, 5.3_

- [x] 6. Refactor Header component to use design tokens
  - Replace hardcoded color classes (text-slate-700, dark:text-slate-200) with text-nexus-text-primary
  - Replace hardcoded hover colors (hover:text-blue-600) with hover:text-nexus-accent-primary
  - Update NavigationMenuTrigger to use bg-transparent and semantic text colors
  - Update theme toggle button to use semantic colors
  - Add user-select: none to non-selectable header elements
  - Remove any remaining hardcoded color values
  - _Requirements: 1.5, 2.5, 3.3, 3.4, 4.1, 4.2, 4.3, 4.4, 4.5, 4.6_

- [x] 7. Refactor NexusButton component to use design tokens
  - Replace hardcoded color values in variantClasses with CSS custom property references
  - Update primary variant to use bg-primary, text-primary-foreground, hover:bg-primary-hover
  - Update secondary variant to use bg-secondary, text-secondary-foreground
  - Update ghost variant to use semantic text colors
  - Update focus ring to use focus:ring-[var(--focus-ring)]
  - Remove all hardcoded hex/rgb color values
  - _Requirements: 3.3, 3.4, 5.1, 5.2_

- [x] 8. Refactor NexusCard component to use design tokens
  - Replace bg-nexus-bg-surface with proper CSS custom property reference
  - Replace border-nexus-border with proper CSS custom property reference
  - Update hover states to use semantic color tokens
  - Update focus ring to use var(--focus-ring)
  - Ensure all color references use design tokens
  - _Requirements: 3.3, 3.4, 5.1_

- [x] 9. Refactor FeaturesList component to use design tokens
  - Replace hardcoded text colors with text-nexus-text-primary and text-nexus-text-secondary
  - Update tab active state to use gradient with nexus accent colors
  - Update hover states to use semantic color tokens
  - Ensure all background colors use semantic tokens
  - Remove any hardcoded color values
  - _Requirements: 1.5, 2.5, 3.3, 3.4_

- [x] 10. Refactor home page (page.tsx) to use design tokens
  - Replace hardcoded color classes with semantic token classes
  - Update gradient backgrounds to use CSS custom properties
  - Update text colors to use text-nexus-text-primary and text-nexus-text-secondary
  - Update border colors to use border-nexus-border
  - Ensure all color references use design tokens
  - _Requirements: 1.5, 3.3, 3.4, 3.5_

- [x] 11. Create visual regression tests for theme consistency
  - Set up Playwright test file for header component screenshots
  - Write test for header in light mode
  - Write test for header in dark mode
  - Write test for text selection appearance in both modes
  - Write test for focus states on interactive elements
  - _Requirements: 2.1, 2.2, 3.3, 4.1, 4.4, 4.5_

- [x] 12. Create accessibility tests for contrast and focus
  - Set up jest-axe in test configuration
  - Write test for header accessibility violations
  - Write test for text selection contrast ratio (minimum 4.5:1)
  - Write test for focus indicator contrast ratio (minimum 3:1)
  - Write test for keyboard navigation focus visibility
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [x] 13. Create component unit tests for design token usage
  - Write test for NexusButton using design token classes (not hardcoded colors)
  - Write test for Header navigation using semantic color tokens
  - Write test for theme switching updating component appearance
  - Write test for typography classes being applied correctly
  - _Requirements: 1.4, 3.3, 5.1, 5.5_

- [x] 14. Create integration tests for cross-page consistency
  - Write Playwright test for typography consistency across home and providers pages
  - Write test for theme persistence across page navigation
  - Write test for text selection working consistently across all pages
  - Write test for focus states being consistent across all interactive elements
  - _Requirements: 1.5, 2.1, 2.2, 2.3, 3.3_

- [x] 15. Audit and refactor remaining components
  - Scan all components in src/components for hardcoded colors
  - Refactor components to use semantic design tokens
  - Update any remaining hardcoded typography values
  - Ensure all components use CSS custom properties
  - _Requirements: 1.4, 3.4, 5.1, 5.4, 5.5_
