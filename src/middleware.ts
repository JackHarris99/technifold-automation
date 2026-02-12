/**
 * Next.js Middleware - Universal Activity Tracking
 * Tracks ALL users: prospects, customers, distributors, authenticated users
 * Detects tokens from URLs, paths, and cookies
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const response = NextResponse.next();

  // ========== PROSPECT MARKETING TOKENS (Query Params) ==========
  const urlProspectToken = searchParams.get('pt'); // Permanent prospect token
  const campaignToken = searchParams.get('ct'); // Campaign-specific token
  const cookieProspectToken = request.cookies.get('prospect_token')?.value;
  const prospectToken = urlProspectToken || cookieProspectToken;

  // Set/update prospect cookie if URL has token
  if (urlProspectToken) {
    response.cookies.set('prospect_token', urlProspectToken, {
      maxAge: 60 * 60 * 24 * 365, // 1 year
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  // ========== CUSTOMER TOKENS (Path-based /r/, /q/, /x/) ==========
  let customerCompanyId = request.cookies.get('customer_company_id')?.value || null;
  let customerContactId = request.cookies.get('customer_contact_id')?.value || null;
  let tokenObjectType = request.cookies.get('token_object_type')?.value || null;

  // Detect path-based tokens - store raw token, verify in route handlers
  // (Token verification requires Node.js crypto, not available in Edge Runtime middleware)
  const pathToken = extractPathToken(pathname);
  if (pathToken) {
    // Store token in cookie - actual verification happens in route handlers
    response.cookies.set('path_token', pathToken, {
      maxAge: 60 * 60 * 24 * 90, // 90 days
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
  }

  // ========== TRACK ALL ACTIVITY ==========
  // Track if we have ANY identification
  if (prospectToken || campaignToken || customerCompanyId || customerContactId) {
    trackActivity(request, {
      prospectToken,
      campaignToken,
      customerCompanyId,
      customerContactId,
      tokenObjectType,
      pathname,
    });
  }

  return response;
}

/**
 * Extract token from path-based routes
 * /r/{token} - Reorder portal
 * /q/{token} - Quote view
 * /x/{token} - Offer/trial links
 * /u/{token} - Unsubscribe links
 */
function extractPathToken(pathname: string): string | null {
  const match = pathname.match(/^\/(r|q|x|u)\/([^\/]+)/);
  if (match) {
    return match[2]; // The token part
  }
  return null;
}

/**
 * Track activity to universal tracking API
 */
async function trackActivity(
  request: NextRequest,
  data: {
    prospectToken: string | null;
    campaignToken: string | null;
    customerCompanyId: string | null;
    customerContactId: string | null;
    tokenObjectType: string | null;
    pathname: string;
  }
) {
  try {
    const { searchParams } = request.nextUrl;

    const payload: any = {
      url: data.pathname,
      query_params: Object.fromEntries(searchParams),
      referrer: request.headers.get('referer'),
      user_agent: request.headers.get('user-agent'),
      ip_address: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),

      // Prospect data
      prospect_token: data.prospectToken,
      campaign_token: data.campaignToken,

      // Customer data
      customer_company_id: data.customerCompanyId,
      customer_contact_id: data.customerContactId,
      token_object_type: data.tokenObjectType,
    };

    // Send to universal tracking API (non-blocking)
    fetch(new URL('/api/track/activity', request.url), {
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
