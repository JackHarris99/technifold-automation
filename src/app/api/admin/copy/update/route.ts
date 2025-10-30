/**
 * POST /api/admin/copy/update
 * Save override copy and curated SKUs
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { msp_id, override_copy, curated_skus } = body;

    if (!msp_id) {
      return NextResponse.json({ error: 'msp_id required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Update machine_solution_problem
    const { error } = await supabase
      .from('machine_solution_problem')
      .update({
        problem_solution_copy: override_copy || null,
        curated_skus: curated_skus || []
      })
      .eq('id', msp_id);

    if (error) {
      console.error('[admin/copy/update] Error:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/copy/update] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
