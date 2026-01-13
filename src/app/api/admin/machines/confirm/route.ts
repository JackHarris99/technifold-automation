/**
 * POST /api/admin/machines/confirm
 * Mark a company_machine as confirmed by sales
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { company_machine_id } = body;

    if (!company_machine_id) {
      return NextResponse.json(
        { error: 'company_machine_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Update the company_machine record
    const { data, error } = await supabase
      .from('company_machine')
      .update({
        confirmed: true,
        source: 'sales_confirmed',
        confidence_score: 5,
        updated_at: new Date().toISOString()
      })
      .eq('company_machine_id', company_machine_id)
      .select('company_id, machine_id')
      .single();

    if (error) {
      console.error('[admin/machines/confirm] Error:', error);
      return NextResponse.json(
        { error: 'Failed to confirm machine' },
        { status: 500 }
      );
    }

    // Log engagement event
    if (data) {
      await supabase
        .from('engagement_events')
        .insert({
          company_id: data.company_id,
          source: 'vercel',
          event_type: 'machine_confirmed',
          event_name: 'machine_confirmed',
          url: '/api/admin/machines/confirm',
          meta: {
            company_machine_id,
            machine_id: data.machine_id
          }
        })
        .catch(err => console.error('[admin/machines/confirm] Event error:', err));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/machines/confirm] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
