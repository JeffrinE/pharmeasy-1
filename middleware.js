import { NextResponse } from 'next/server';

export function middleware(req) {
  const response = NextResponse.next(); // Creates a default Next.js response

  // Set security-related headers
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-DNS-Prefetch-Control', 'on');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');

  return response; // Return the response with the headers
}

// Set up route matching for where this middleware should be applied
export const config = {
  matcher: ['/api/*', '/dashboard/*'] // Customize for routes that should use this middleware
};
