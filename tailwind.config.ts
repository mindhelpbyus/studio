import type { Config } from 'tailwindcss';
import designTokens from './src/lib/design-tokens.json';
import ventureColors from './src/lib/venture-colors.json';

const { colors, fontFamily, borderRadius, boxShadow } = designTokens;

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
        venture: ["Inter", "sans-serif"],
        inter: ["Inter", "sans-serif"],
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

        // Venture Global Colors - Neutral
        'neutral': {
          0: 'var(--global-neutral-0)',
          10: 'var(--global-neutral-10)',
          20: 'var(--global-neutral-20)',
          30: 'var(--global-neutral-30)',
          40: 'var(--global-neutral-40)',
          50: 'var(--global-neutral-50)',
          60: 'var(--global-neutral-60)',
          70: 'var(--global-neutral-70)',
          80: 'var(--global-neutral-80)',
          90: 'var(--global-neutral-90)',
          100: 'var(--global-neutral-100)',
        },

        // Venture Global Colors - Blue
        'blue': {
          10: 'var(--global-blue-10)',
          20: 'var(--global-blue-20)',
          30: 'var(--global-blue-30)',
          40: 'var(--global-blue-40)',
          50: 'var(--global-blue-50)',
          60: 'var(--global-blue-60)',
          70: 'var(--global-blue-70)',
          80: 'var(--global-blue-80)',
          90: 'var(--global-blue-90)',
          100: 'var(--global-blue-100)',
        },

        // Venture Global Colors - Green
        'green': {
          10: 'var(--global-green-10)',
          20: 'var(--global-green-20)',
          30: 'var(--global-green-30)',
          40: 'var(--global-green-40)',
          50: 'var(--global-green-50)',
          60: 'var(--global-green-60)',
          70: 'var(--global-green-70)',
          80: 'var(--global-green-80)',
          90: 'var(--global-green-90)',
          100: 'var(--global-green-100)',
        },

        // Venture Global Colors - Red
        'red': {
          10: 'var(--global-red-10)',
          20: 'var(--global-red-20)',
          30: 'var(--global-red-30)',
          40: 'var(--global-red-40)',
          50: 'var(--global-red-50)',
          60: 'var(--global-red-60)',
          70: 'var(--global-red-70)',
          80: 'var(--global-red-80)',
          90: 'var(--global-red-90)',
          100: 'var(--global-red-100)',
        },

        // Venture Global Colors - Orange
        'orange': {
          10: 'var(--global-orange-10)',
          20: 'var(--global-orange-20)',
          30: 'var(--global-orange-30)',
          40: 'var(--global-orange-40)',
          50: 'var(--global-orange-50)',
          60: 'var(--global-orange-60)',
          70: 'var(--global-orange-70)',
          80: 'var(--global-orange-80)',
          90: 'var(--global-orange-90)',
          100: 'var(--global-orange-100)',
        },

        // Venture Global Colors - Purple
        'purple': {
          10: 'var(--global-purple-10)',
          20: 'var(--global-purple-20)',
          30: 'var(--global-purple-30)',
          40: 'var(--global-purple-40)',
          50: 'var(--global-purple-50)',
          60: 'var(--global-purple-60)',
          70: 'var(--global-purple-70)',
          80: 'var(--global-purple-80)',
          90: 'var(--global-purple-90)',
          100: 'var(--global-purple-100)',
        },

        // Venture Global Colors - Yellow
        'yellow': {
          10: 'var(--global-yellow-10)',
          20: 'var(--global-yellow-20)',
          30: 'var(--global-yellow-30)',
          40: 'var(--global-yellow-40)',
          50: 'var(--global-yellow-50)',
          60: 'var(--global-yellow-60)',
          70: 'var(--global-yellow-70)',
          80: 'var(--global-yellow-80)',
          90: 'var(--global-yellow-90)',
          100: 'var(--global-yellow-100)',
        },

        // Venture Semantic Colors - Content
        'content': {
          'dark-primary': 'var(--content-dark-primary)',
          'dark-secondary': 'var(--content-dark-secondary)',
          'dark-tertiary': 'var(--content-dark-tertiary)',
          'dark-disable': 'var(--content-dark-disable)',
          'dark-informative': 'var(--content-dark-informative)',
          'dark-positive': 'var(--content-dark-positive)',
          'dark-error': 'var(--content-dark-error)',
          'light-primary': 'var(--content-light-primary)',
          'light-secondary': 'var(--content-light-secondary)',
          'light-tertiary': 'var(--content-light-tertiary)',
          'light-disable': 'var(--content-light-disable)',
          'light-informative': 'var(--content-light-informative)',
          'light-positive': 'var(--content-light-positive)',
          'light-error': 'var(--content-light-error)',
        },

        // Venture Semantic Colors - Border
        'venture-border': {
          'primary': 'var(--border-primary)',
          'secondary': 'var(--border-secondary)',
          'tertiary': 'var(--border-tertiary)',
          'informative': 'var(--border-informative)',
          'positive': 'var(--border-positive)',
          'error': 'var(--border-error)',
          'warning': 'var(--border-warning)',
        },

        // Venture Semantic Colors - Background
        'venture-bg': {
          'primary': 'var(--bg-primary)',
          'secondary': 'var(--bg-secondary)',
          'tertiary': 'var(--bg-tertiary)',
          'blue': 'var(--bg-blue)',
          'green': 'var(--bg-green)',
          'red': 'var(--bg-red)',
          'orange': 'var(--bg-orange)',
          'purple': 'var(--bg-purple)',
          'yellow': 'var(--bg-yellow)',
        },

        // Venture Semantic Colors - Action
        'action': {
          'primary-base': 'var(--action-primary-base)',
          'primary-hover': 'var(--action-primary-hover)',
          'primary-active': 'var(--action-primary-active)',
          'primary-selected': 'var(--action-primary-selected)',
          'primary-disabled': 'var(--action-primary-disabled)',
          'secondary-base': 'var(--action-secondary-base)',
          'secondary-base2': 'var(--action-secondary-base2)',
          'secondary-hover': 'var(--action-secondary-hover)',
          'secondary-active': 'var(--action-secondary-active)',
          'secondary-selected': 'var(--action-secondary-selected)',
          'secondary-disabled': 'var(--action-secondary-disabled)',
          'outline-base': 'var(--action-outline-base)',
          'outline-hover': 'var(--action-outline-hover)',
          'outline-active': 'var(--action-outline-active)',
          'outline-selected': 'var(--action-outline-selected)',
          'outline-disabled': 'var(--action-outline-disabled)',
          'destructive-base': 'var(--action-destructive-base)',
          'destructive-hover': 'var(--action-destructive-hover)',
          'destructive-active': 'var(--action-destructive-active)',
          'destructive-selected': 'var(--action-destructive-selected)',
          'destructive-disabled': 'var(--action-destructive-disabled)',
        },

        // Venture Semantic Colors - Interaction
        'interaction': {
          'primary-base': 'var(--interaction-primary-base)',
          'primary-hover': 'var(--interaction-primary-hover)',
          'primary-active': 'var(--interaction-primary-active)',
          'primary-selected': 'var(--interaction-primary-selected)',
          'primary-disabled': 'var(--interaction-primary-disabled)',
          'secondary-base': 'var(--interaction-secondary-base)',
          'secondary-hover': 'var(--interaction-secondary-hover)',
          'secondary-active': 'var(--interaction-secondary-active)',
          'secondary-selected': 'var(--interaction-secondary-selected)',
          'secondary-disabled': 'var(--interaction-secondary-disabled)',
          'outline-base': 'var(--interaction-outline-base)',
          'outline-hover': 'var(--interaction-outline-hover)',
          'outline-active': 'var(--interaction-outline-active)',
          'outline-selected': 'var(--interaction-outline-selected)',
          'outline-disabled': 'var(--interaction-outline-disabled)',
          'red-base': 'var(--interaction-red-base)',
          'red-hover': 'var(--interaction-red-hover)',
          'red-active': 'var(--interaction-red-active)',
          'red-selected': 'var(--interaction-red-selected)',
          'red-disabled': 'var(--interaction-red-disabled)',
          'green-base': 'var(--interaction-green-base)',
          'green-hover': 'var(--interaction-green-hover)',
          'green-active': 'var(--interaction-green-active)',
          'green-selected': 'var(--interaction-green-selected)',
          'green-disabled': 'var(--interaction-green-disabled)',
          'blue-base': 'var(--interaction-blue-base)',
          'blue-hover': 'var(--interaction-blue-hover)',
          'blue-active': 'var(--interaction-blue-active)',
          'blue-selected': 'var(--interaction-blue-selected)',
          'blue-disabled': 'var(--interaction-blue-disabled)',
          'yellow-base': 'var(--interaction-yellow-base)',
          'yellow-hover': 'var(--interaction-yellow-hover)',
          'yellow-active': 'var(--interaction-yellow-active)',
          'yellow-selected': 'var(--interaction-yellow-selected)',
          'yellow-disabled': 'var(--interaction-yellow-disabled)',
          'purple-base': 'var(--interaction-purple-base)',
          'purple-hover': 'var(--interaction-purple-hover)',
          'purple-active': 'var(--interaction-purple-active)',
          'purple-selected': 'var(--interaction-purple-selected)',
          'purple-disabled': 'var(--interaction-purple-disabled)',
          'orange-base': 'var(--interaction-orange-base)',
          'orange-hover': 'var(--interaction-orange-hover)',
          'orange-active': 'var(--interaction-orange-active)',
          'orange-selected': 'var(--interaction-orange-selected)',
          'orange-disabled': 'var(--interaction-orange-disabled)',
        },
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
        // Venture Typography Sizes
        'venture-xs': ['12px', { lineHeight: '16px' }],
        'venture-sm': ['14px', { lineHeight: '20px' }],
        'venture-md': ['16px', { lineHeight: '24px' }],
        'venture-lg': ['18px', { lineHeight: '26px' }],
        'venture-xl': ['20px', { lineHeight: '28px' }],
        'venture-h5': ['20px', { lineHeight: '28px' }],
        'venture-h4': ['24px', { lineHeight: '28px' }],
        'venture-h3': ['28px', { lineHeight: '36px' }],
        'venture-h2': ['32px', { lineHeight: '40px' }],
        'venture-h1': ['48px', { lineHeight: '57.6px' }],
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
