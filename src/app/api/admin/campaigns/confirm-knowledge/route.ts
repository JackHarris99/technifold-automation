/**
 * Confirm/Reject Machine Knowledge API
 * Sales team confirms or rejects machine knowledge learned from campaigns
 * POST /api/admin/campaigns/confirm-knowledge
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { queue_id, action, company_id, machine_taxonomy_id, notes } = body;

    // Validation
    if (!queue_id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!['confirm', 'reject', 'needs_info'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    if (action === 'confirm') {
      // Confirm the knowledge
      // 1. Update the queue item
      await supabase
        .from('knowledge_confirmation_queue')
        .update({
          status: 'confirmed',
          reviewed_by: 'admin', // TODO: Add actual user auth
          reviewed_at: new Date().toISOString(),
          review_notes: notes,
        })
        .eq('id', queue_id);

      // 2. Upgrade confidence level in company_machine_knowledge
      await supabase
        .from('company_machine_knowledge')
        .update({
          confidence_level: 3, // Sales confirmed
          confirmed: true,
          confirmed_by: 'admin',
          confirmed_at: new Date().toISOString(),
          notes,
        })
        .eq('company_id', company_id)
        .eq('machine_taxonomy_id', machine_taxonomy_id);

      return NextResponse.json({ success: true, action: 'confirmed' });
    } else if (action === 'reject') {
      // Reject the knowledge
      // 1. Update the queue item
      await supabase
        .from('knowledge_confirmation_queue')
        .update({
          status: 'rejected',
          reviewed_by: 'admin',
          reviewed_at: new Date().toISOString(),
          review_notes: notes,
        })
        .eq('id', queue_id);

      // 2. Delete the incorrect knowledge
      await supabase
        .from('company_machine_knowledge')
        .delete()
        .eq('company_id', company_id)
        .eq('machine_taxonomy_id', machine_taxonomy_id)
        .eq('confirmed', false); // Only delete unconfirmed knowledge

      return NextResponse.json({ success: true, action: 'rejected' });
    } else {
      // Needs more info
      await supabase
        .from('knowledge_confirmation_queue')
        .update({
          status: 'needs_info',
          review_notes: notes,
        })
        .eq('id', queue_id);

      return NextResponse.json({ success: true, action: 'needs_info' });
    }
  } catch (error) {
    console.error('Error in confirm-knowledge API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
