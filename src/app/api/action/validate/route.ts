/**
 * POST /api/action/validate
 * Validate an action token and return context for the action page
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateActionToken } from '@/lib/actionTokens';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token is required' },
        { status: 400 }
      );
    }

    // Get client IP
    const ip_address = request.headers.get('x-forwarded-for') ||
                       request.headers.get('x-real-ip') ||
                       'unknown';

    // Validate token
    const payload = await validateActionToken(token, ip_address);

    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Build context based on action type
    const supabase = getSupabaseClient();
    const context: any = {};

    // Get user info
    const { data: user } = await supabase
      .from('users')
      .select('full_name')
      .eq('user_id', payload.user_id)
      .single();

    context.user_name = user?.full_name || payload.user_id;

    // Get company info if company_id present
    if (payload.company_id) {
      const { data: company } = await supabase
        .from('companies')
        .select('company_name')
        .eq('company_id', payload.company_id)
        .single();

      context.company_name = company?.company_name || 'Unknown Company';
      context.company_id = payload.company_id;
    }

    // Get quote info if quote_id present
    if (payload.quote_id) {
      const { data: quote } = await supabase
        .from('quotes')
        .select('company_id, contact_id')
        .eq('quote_id', payload.quote_id)
        .single();

      context.quote_id = payload.quote_id;

      if (quote) {
        // Get company info from quote if not already present
        if (!context.company_id) {
          const { data: company } = await supabase
            .from('companies')
            .select('company_name')
            .eq('company_id', quote.company_id)
            .single();

          context.company_name = company?.company_name || 'Unknown Company';
          context.company_id = quote.company_id;
        }

        // Get contact info
        if (quote.contact_id) {
          const { data: contact } = await supabase
            .from('contacts')
            .select('contact_name')
            .eq('contact_id', quote.contact_id)
            .single();

          context.contact_name = contact?.contact_name || null;
        }
      }
    }

    // Get contact info if contact_id present
    if (payload.contact_id && !context.contact_name) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('contact_name')
        .eq('contact_id', payload.contact_id)
        .single();

      context.contact_name = contact?.contact_name || null;
    }

    return NextResponse.json({
      success: true,
      payload,
      context,
    });
  } catch (error) {
    console.error('[action/validate] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
