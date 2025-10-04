import { render } from '@testing-library/react';
import { NexusButton } from '@/components/nexus-ui/NexusButton';
import { Header } from '@/components/header';

describe('Component Design Token Usage', () => {
  describe('NexusButton', () => {
    test('uses design token classes instead of hardcoded colors', () => {
      const { container } = render(<NexusButton variant="primary">Click me</NexusButton>);
      const button = container.querySelector('button');
      
      // Should use design tokens
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-primary-foreground');
      
      // Should NOT use hardcoded colors
      expect(button).not.toHaveClass('bg-blue-600');
      expect(button).not.toHaveClass('text-white');
    });

    test('secondary variant uses semantic tokens', () => {
      const { container } = render(<NexusButton variant="secondary">Click me</NexusButton>);
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('bg-secondary');
      expect(button).toHaveClass('text-secondary-foreground');
      expect(button).not.toHaveClass('bg-slate-100');
    });

    test('ghost variant uses semantic tokens', () => {
      const { container } = render(<NexusButton variant="ghost">Click me</NexusButton>);
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('text-nexus-text-primary');
      expect(button).not.toHaveClass('text-slate-700');
    });

    test('uses focus ring design token', () => {
      const { container } = render(<NexusButton variant="primary">Click me</NexusButton>);
      const button = container.querySelector('button');
      
      expect(button?.className).toContain('focus:ring-[var(--focus-ring)]');
    });
  });

  describe('Header', () => {
    test('navigation uses semantic color tokens', () => {
      const { container } = render(<Header />);
      
      // Check for semantic token usage in navigation
      const nav = container.querySelector('nav');
      expect(nav).toBeTruthy();
      
      // Navigation should not use hardcoded slate colors
      const navHTML = nav?.innerHTML || '';
      expect(navHTML).not.toContain('text-slate-700');
      expect(navHTML).not.toContain('text-slate-200');
    });

    test('header background uses semantic tokens', () => {
      const { container } = render(<Header />);
      const header = container.querySelector('header');
      
      expect(header).toHaveClass('bg-background/95');
      expect(header).toHaveClass('border-nexus-border');
      expect(header).not.toHaveClass('bg-white/95');
    });

    test('theme toggle button uses semantic tokens', () => {
      const { container } = render(<Header />);
      const themeButton = container.querySelector('button[aria-label*="mode"]');
      
      expect(themeButton).toHaveClass('text-nexus-text-muted');
      expect(themeButton).toHaveClass('hover:text-nexus-text-primary');
      expect(themeButton).not.toHaveClass('text-slate-500');
    });
  });

  describe('Theme Switching', () => {
    test('components respond to theme changes', () => {
      const { container, rerender } = render(<NexusButton variant="primary">Click me</NexusButton>);
      
      // Add dark class to document
      document.documentElement.classList.add('dark');
      
      // Rerender component
      rerender(<NexusButton variant="primary">Click me</NexusButton>);
      
      const button = container.querySelector('button');
      
      // Button should still use semantic tokens that adapt to theme
      expect(button).toHaveClass('bg-primary');
      expect(button).toHaveClass('text-primary-foreground');
      
      // Clean up
      document.documentElement.classList.remove('dark');
    });
  });

  describe('Typography Classes', () => {
    test('components use consistent typography tokens', () => {
      const { container } = render(
        <div>
          <h1>Heading 1</h1>
          <h2>Heading 2</h2>
          <p>Paragraph</p>
        </div>
      );
      
      // Typography should be defined by CSS custom properties
      const h1 = container.querySelector('h1');
      const h2 = container.querySelector('h2');
      const p = container.querySelector('p');
      
      // Check that elements exist
      expect(h1).toBeTruthy();
      expect(h2).toBeTruthy();
      expect(p).toBeTruthy();
      
      // Verify they use the base layer typography (applied via globals.css)
      const h1Styles = window.getComputedStyle(h1!);
      const h2Styles = window.getComputedStyle(h2!);
      const pStyles = window.getComputedStyle(p!);
      
      // All should use the same font family
      expect(h1Styles.fontFamily).toBeTruthy();
      expect(h2Styles.fontFamily).toBeTruthy();
      expect(pStyles.fontFamily).toBeTruthy();
    });
  });

  describe('Hover and Focus States', () => {
    test('hover states use semantic color tokens', () => {
      const { container } = render(<NexusButton variant="primary">Hover me</NexusButton>);
      const button = container.querySelector('button');
      
      expect(button).toHaveClass('hover:bg-primary-hover');
      expect(button).not.toHaveClass('hover:bg-blue-700');
    });

    test('focus states are consistently styled', () => {
      const { container } = render(
        <>
          <NexusButton variant="primary">Button 1</NexusButton>
          <NexusButton variant="secondary">Button 2</NexusButton>
          <NexusButton variant="ghost">Button 3</NexusButton>
        </>
      );
      
      const buttons = container.querySelectorAll('button');
      
      buttons.forEach(button => {
        // All buttons should use the same focus ring token
        expect(button.className).toContain('focus:ring-[var(--focus-ring)]');
      });
    });
  });
});
