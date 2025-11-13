/**
 * POST /api/marketing/request-quote
 * Capture quote request from marketing page
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, machine_slug } = body;

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { company_id, contact_id } = payload;
    const supabase = getSupabaseClient();

    // Create quote request
    const { data: quoteRequest, error } = await supabase
      .from('quote_requests')
      .insert({
        company_id,
        contact_id,
        machine_slug: machine_slug || null,
        status: 'requested',
        source: 'marketing_link',
        marketing_token: token,
      })
      .select()
      .single();

    if (error) {
      console.error('[marketing/request-quote] Error creating quote request:', error);
      return NextResponse.json({ error: 'Failed to create quote request' }, { status: 500 });
    }

    // Track the request as an engagement event
    await supabase.from('engagement_events').insert({
      company_id,
      contact_id,
      source: 'vercel',
      event_type: 'quote_requested',
      event_name: 'marketing_quote_request',
      campaign_key: 'marketing_link',
      url: `/m/${token}`,
      meta: {
        quote_request_id: quoteRequest.quote_request_id,
        machine_slug: machine_slug || null,
      },
    });

    return NextResponse.json({
      success: true,
      quote_request_id: quoteRequest.quote_request_id,
    });
  } catch (err) {
    console.error('[marketing/request-quote] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
