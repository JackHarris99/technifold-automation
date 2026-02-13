/**
 * GET /customer/access?token={portal_token}
 * Route Handler for permanent portal token authentication
 * Next.js 15 requires cookie setting in Route Handlers, not pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { createCustomerSession } from '@/lib/customerAuth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get('token');

  // No token provided
  if (!token) {
    return NextResponse.redirect(
      new URL('/customer/login?error=missing_token', request.url)
    );
  }

  const supabase = getSupabaseClient();

  // Find user by portal_token
  const { data: user, error } = await supabase
    .from('customer_users')
    .select('*')
    .eq('portal_token', token)
    .eq('is_active', true)
    .single();

  if (error || !user) {
    console.error('[Portal Access] Invalid token:', error);
    return NextResponse.redirect(
      new URL('/customer/login?error=invalid_token', request.url)
    );
  }

  // Check if token has expired
  if (user.portal_token_expires_at && new Date(user.portal_token_expires_at) < new Date()) {
    console.error('[Portal Access] Token expired for user:', user.email);
    return NextResponse.redirect(
      new URL('/customer/login?error=expired_token', request.url)
    );
  }

  // Track portal access event (for analytics)
  const source = searchParams.get('source') || 'direct'; // e.g., 'reorder_email', 'direct'
  const referrer = request.headers.get('referer') || null;

  await supabase.from('engagement_events').insert({
    event_type: 'portal_access',
    event_name: 'customer_portal_login',
    contact_id: user.contact_id,
    company_id: user.company_id,
    occurred_at: new Date().toISOString(),
    source,
    url: request.url,
    meta: {
      user_id: user.user_id,
      email: user.email,
      access_method: 'portal_token',
      referrer,
      user_agent: request.headers.get('user-agent') || null,
    },
  });

  // Create customer session (sets cookies in Route Handler - allowed in Next.js 15)
  await createCustomerSession({
    user_id: user.user_id,
    company_id: user.company_id,
    contact_id: user.contact_id,
    email: user.email,
    first_name: user.first_name,
    last_name: user.last_name,
    role: user.role,
  });

  console.log('[Portal Access] Session created for:', user.email);

  // Redirect to customer portal
  return NextResponse.redirect(new URL('/customer/portal', request.url));
}
