/**
 * POST /api/admin/companies/assign-rep
 * Assign a sales rep to a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, account_owner } = body;

    if (!company_id || !account_owner) {
      return NextResponse.json(
        { error: 'company_id and account_owner are required' },
        { status: 400 }
      );
    }

    // Validate account_owner value
    const validReps = ['rep_a', 'rep_b', 'rep_c'];
    if (!validReps.includes(account_owner)) {
      return NextResponse.json(
        { error: 'Invalid account_owner. Must be rep_a, rep_b, or rep_c' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Update the company record
    const { error } = await supabase
      .from('companies')
      .update({
        account_owner,
        updated_at: new Date().toISOString()
      })
      .eq('company_id', company_id);

    if (error) {
      console.error('[admin/companies/assign-rep] Error:', error);
      return NextResponse.json(
        { error: 'Failed to assign rep' },
        { status: 500 }
      );
    }

    // Log engagement event
    await supabase
      .from('engagement_events')
      .insert({
        company_id,
        source: 'vercel',
        event_type: 'rep_assigned',
        event_name: 'rep_assigned',
        url: '/api/admin/companies/assign-rep',
        meta: {
          account_owner
        }
      })
      .catch(err => console.error('[admin/companies/assign-rep] Event error:', err));

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/companies/assign-rep] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
