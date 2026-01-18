/**
 * POST /api/admin/quotes/[quote_id]/mark-lost
 * Mark a quote as lost and log to engagement_events timeline
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quote_id: string }> }
) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { quote_id } = await params;
    const { lost_reason } = await request.json();

    if (!lost_reason || typeof lost_reason !== 'string') {
      return NextResponse.json(
        { error: 'lost_reason is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Fetch quote to verify it exists and get company/contact info
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('quote_id, company_id, contact_id, total_amount, lost_at')
      .eq('quote_id', quote_id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check territory permission
    const { canActOnCompany } = await import('@/lib/auth');
    const permission = await canActOnCompany(quote.company_id);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: 403 }
      );
    }

    // Update quote with lost_at timestamp and lost_reason
    const { error: updateError } = await supabase
      .from('quotes')
      .update({
        lost_at: new Date().toISOString(),
        lost_reason: lost_reason,
        status: 'lost',
      })
      .eq('quote_id', quote_id);

    if (updateError) {
      console.error('[mark-lost] Failed to update quote:', updateError);
      return NextResponse.json(
        { error: 'Failed to mark quote as lost' },
        { status: 500 }
      );
    }

    // Log to engagement_events for company timeline
    const { error: eventError } = await supabase
      .from('engagement_events')
      .insert({
        company_id: quote.company_id,
        contact_id: quote.contact_id,
        event_type: 'quote_lost',
        event_name: 'Quote marked as lost',
        source: 'admin',
        meta: {
          quote_id: quote.quote_id,
          lost_reason: lost_reason,
          quote_amount: quote.total_amount,
          marked_by: user.email,
        },
      });

    if (eventError) {
      console.error('[mark-lost] Failed to log engagement event:', eventError);
      // Don't fail the request if engagement logging fails
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.user_id,
      user_email: user.email,
      user_name: user.full_name,
      action_type: 'quote_lost',
      entity_type: 'quote',
      entity_id: quote_id,
      description: `Marked quote ${quote_id} as lost: ${lost_reason}`,
    });

    return NextResponse.json({
      success: true,
      message: 'Quote marked as lost',
    });
  } catch (error) {
    console.error('[mark-lost] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
