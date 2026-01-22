/**
 * Next.js Middleware
 * Intercepts all requests to track prospect engagement via tokens
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  // Check for tracking tokens in query params
  const prospectToken = searchParams.get('pt'); // Permanent prospect token
  const campaignToken = searchParams.get('ct'); // Campaign-specific token

  // If we have tokens, log the engagement
  if (prospectToken || campaignToken) {
    // Don't await - let tracking happen in background
    trackEngagement(request, prospectToken, campaignToken);
  }

  return NextResponse.next();
}

async function trackEngagement(
  request: NextRequest,
  prospectToken: string | null,
  campaignToken: string | null
) {
  try {
    const { pathname, searchParams } = request.nextUrl;

    // Build tracking payload
    const payload: any = {
      url: pathname,
      query_params: Object.fromEntries(searchParams),
      referrer: request.headers.get('referer'),
      user_agent: request.headers.get('user-agent'),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
    };

    if (prospectToken) payload.prospect_token = prospectToken;
    if (campaignToken) payload.campaign_token = campaignToken;

    // Send to tracking API (non-blocking)
    fetch(new URL('/api/track/engagement', request.url), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch(err => {
      // Silent fail - don't block user experience
      console.error('[Tracking] Error:', err);
    });

  } catch (error) {
    // Silent fail
    console.error('[Tracking] Error:', error);
  }
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    // Track all pages except API routes and static files
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
