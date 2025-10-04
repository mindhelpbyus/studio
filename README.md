# Venture Healthcare Platform

A modern healthcare platform built with Next.js, TypeScript, and Tailwind CSS.

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Key Features

- **Design System**: Comprehensive component library with semantic color tokens
- **Patient Dashboard**: Appointment booking and management
- **Provider Search**: Advanced filtering and search capabilities
- **Calendar System**: Full-featured appointment scheduling
- **Modal System**: Reusable modal components for forms and confirmations
- **Data Tables**: Sortable, filterable tables for healthcare data

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- React Hook Form
- Zod validation

## Project Structure

```
src/
├── app/              # Next.js app router pages
├── components/       # Reusable components
│   ├── ui/          # Venture design system components
│   ├── calendar/    # Calendar components
│   └── nexus-ui/    # Nexus UI components
├── lib/             # Utilities and helpers
└── styles/          # Global styles and design tokens
```

## Design System

The Venture design system includes:
- VentureHero - Hero sections with geometric backgrounds
- VentureModal - Modal dialogs and confirmations
- VentureSelect - Form selectors with multiple variants
- VentureTable - Data tables with sorting and filtering
- VentureButton - Button components
- VentureInput - Form inputs
- VentureCard - Content cards

All components use semantic color tokens for consistent theming.

## License

Proprietary
