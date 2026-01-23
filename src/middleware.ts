/**
 * Next.js Middleware
 * Intercepts all requests to track prospect engagement via tokens
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const response = NextResponse.next();

  // Check for tracking tokens in query params
  const urlProspectToken = searchParams.get('pt'); // Permanent prospect token from URL
  const campaignToken = searchParams.get('ct'); // Campaign-specific token

  // Check for existing prospect cookie
  const cookieProspectToken = request.cookies.get('prospect_token')?.value;

  // Determine which prospect token to use (URL takes precedence)
  const prospectToken = urlProspectToken || cookieProspectToken;

  // If we have a prospect token in URL, set/update the cookie (1 year expiry)
  if (urlProspectToken) {
    response.cookies.set('prospect_token', urlProspectToken, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  // If we have any tracking data (URL tokens OR cookie), log the engagement
  if (prospectToken || campaignToken) {
    // Don't await - let tracking happen in background
    trackEngagement(request, prospectToken, campaignToken);
  }

  return response;
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
