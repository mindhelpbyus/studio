import type {Config} from 'tailwindcss';
import designTokens from './src/lib/design-tokens.json';

const {colors, fontFamily, borderRadius, boxShadow} = designTokens;

export default {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        body: ["var(--font-manrope)", "sans-serif"],
        headline: ["var(--font-manrope)", "sans-serif"],
      },
      colors: {
        ...colors,
        // Nexus-prefixed semantic colors for easier component usage
        'nexus-bg-surface': 'var(--surface)',
        'nexus-bg-elevated': 'var(--elevated)',
        'nexus-text-primary': 'var(--foreground)',
        'nexus-text-secondary': 'var(--text-secondary)',
        'nexus-text-muted': 'var(--text-muted)',
        'nexus-border': 'var(--border)',
        'nexus-accent-primary': 'var(--accent-primary)',
        'nexus-accent-secondary': 'var(--accent-secondary)',
      },
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
      borderRadius: {
        ...borderRadius,
        full: "9999px",
      },
      boxShadow,
      keyframes: {
        'accordion-down': {
          from: {
            height: '0',
          },
          to: {
            height: 'var(--radix-accordion-content-height)',
          },
        },
        'accordion-up': {
          from: {
            height: 'var(--radix-accordion-content-height)',
          },
          to: {
            height: '0',
          },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
} satisfies Config;
