import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Global Security Middleware
 * Implements OWASP security headers and basic security controls
 * Required for SOC 2 and ISO 27001 compliance
 */
export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Security Headers - OWASP Recommended
  
  // Prevent clickjacking attacks (OWASP A05:2021)
  response.headers.set('X-Frame-Options', 'DENY');
  
  // Prevent MIME type sniffing (OWASP A05:2021)
  response.headers.set('X-Content-Type-Options', 'nosniff');
  
  // Control referrer information
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // XSS Protection (legacy but still useful)
  response.headers.set('X-XSS-Protection', '1; mode=block');
  
  // Prevent DNS prefetching
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  
  // HSTS for HTTPS (production only) - Required for SOC 2
  if (request.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production') {
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

  // Content Security Policy - Healthcare Compliant
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https: wss:",
    "media-src 'self' https: blob:",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests"
  ].join('; ');
  
  response.headers.set('Content-Security-Policy', csp);

  // Permissions Policy (formerly Feature Policy) - Privacy Protection
  const permissionsPolicy = [
    'camera=self',
    'microphone=self',
    'geolocation=self',
    'payment=self',
    'usb=none',
    'magnetometer=none',
    'gyroscope=none',
    'accelerometer=none',
    'ambient-light-sensor=none',
    'autoplay=none',
    'encrypted-media=self',
    'fullscreen=self',
    'picture-in-picture=none'
  ].join(', ');
  
  response.headers.set('Permissions-Policy', permissionsPolicy);

  // Remove server information (Security through obscurity)
  response.headers.delete('Server');
  response.headers.delete('X-Powered-By');

  // Add custom security headers for healthcare compliance
  response.headers.set('X-Healthcare-Platform', 'Vivale-Secure');
  response.headers.set('X-Compliance-Standards', 'HIPAA,GDPR,SOC2,ISO27001');

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002');
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-CSRF-Token');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400'); // 24 hours
  }

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers: response.headers });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes - handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};