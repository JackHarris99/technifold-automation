/**
 * PATCH /api/admin/quotes/[quote_id]/update-status
 * Mark quote as won or lost
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser, canActOnCompany } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ quote_id: string }> }
) {
  try {
    const { quote_id } = await params;

    // Authenticate user
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Fetch quote to get company_id
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select('quote_id, company_id, status, won_at, lost_at')
      .eq('quote_id', quote_id)
      .single();

    if (quoteError || !quote) {
      return NextResponse.json(
        { error: 'Quote not found' },
        { status: 404 }
      );
    }

    // Check permissions - user must be able to act on this company
    const permission = await canActOnCompany(quote.company_id);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error || 'Permission denied' },
        { status: 403 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status, lost_reason } = body;

    if (!status || (status !== 'won' && status !== 'lost')) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "won" or "lost"' },
        { status: 400 }
      );
    }

    // Prepare update data
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status === 'won') {
      // Mark as won
      updateData.won_at = new Date().toISOString();
      updateData.lost_at = null; // Clear lost status if previously set
      updateData.lost_reason = null;
    } else if (status === 'lost') {
      // Mark as lost
      updateData.lost_at = new Date().toISOString();
      updateData.won_at = null; // Clear won status if previously set
      updateData.lost_reason = lost_reason || null;
    }

    // Update quote in database
    const { data: updatedQuote, error: updateError } = await supabase
      .from('quotes')
      .update(updateData)
      .eq('quote_id', quote_id)
      .select('quote_id, status, won_at, lost_at, lost_reason')
      .single();

    if (updateError) {
      console.error('[update-status] Update failed:', updateError);
      return NextResponse.json(
        { error: 'Failed to update quote status' },
        { status: 500 }
      );
    }

    // Log activity
    await supabase.from('activity_log').insert({
      user_id: user.user_id,
      user_email: user.email,
      user_name: user.full_name,
      action_type: status === 'won' ? 'quote_marked_won' : 'quote_marked_lost',
      entity_type: 'quote',
      entity_id: quote_id,
      description: status === 'won'
        ? 'Marked quote as won (deal closed)'
        : `Marked quote as lost${lost_reason ? ': ' + lost_reason : ''}`,
      metadata: {
        quote_id,
        company_id: quote.company_id,
        status,
        lost_reason: lost_reason || null,
      },
    });

    console.log(`[update-status] Quote ${quote_id} marked as ${status}`, lost_reason ? `Reason: ${lost_reason}` : '');

    return NextResponse.json({
      success: true,
      quote: updatedQuote,
    });

  } catch (error) {
    console.error('[update-status] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
