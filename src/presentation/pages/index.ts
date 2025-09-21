/**
 * @fileoverview Pages Index
 * @description Export page components and routing information
 */

// This file will contain references to Next.js pages
// The actual pages remain in src/app/ for Next.js App Router compatibility
// This provides a clean interface for the presentation layer

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  PATIENT_PORTAL: '/patient-portal',
  PROVIDER_PORTAL: '/provider-portal',
  PROVIDERS: '/providers',
  APPOINTMENTS: '/appointments'
} as const;