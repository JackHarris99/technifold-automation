/**
 * POST /api/unsubscribe
 * Updates contact's marketing_status to 'unsubscribed'
 * Uses HMAC token verification for security
 */

import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    // Verify HMAC token
    const payload = verifyToken(token);

    if (!payload) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe link' },
        { status: 400 }
      );
    }

    const { contact_id, email } = payload;
    const supabase = getSupabaseClient();

    // Update contact's marketing status
    if (contact_id) {
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          marketing_status: 'unsubscribed',
          updated_at: new Date().toISOString(),
        })
        .eq('contact_id', contact_id);

      if (updateError) {
        console.error('[unsubscribe] Error updating contact:', updateError);
        return NextResponse.json(
          { error: 'Failed to update subscription status' },
          { status: 500 }
        );
      }
    } else if (email) {
      // Fallback: update by email if no contact_id
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          marketing_status: 'unsubscribed',
          updated_at: new Date().toISOString(),
        })
        .eq('email', email);

      if (updateError) {
        console.error('[unsubscribe] Error updating contact by email:', updateError);
        return NextResponse.json(
          { error: 'Failed to update subscription status' },
          { status: 500 }
        );
      }
    }

    // Log engagement event
    await supabase.from('engagement_events').insert({
      contact_id: contact_id || null,
      event_type: 'unsubscribed',
      event_name: 'marketing_unsubscribe',
      source: 'email_link',
      meta: {
        email,
        method: 'one_click',
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[unsubscribe] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
