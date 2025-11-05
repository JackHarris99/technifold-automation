/**
 * POST /api/admin/copy/update
 * Save override copy and curated SKUs for a machine-specific problem/solution
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      psm_id,
      override_copy,
      override_title,
      override_subtitle,
      override_headline,
      override_cta,
      curated_skus
    } = body;

    if (!psm_id) {
      return NextResponse.json({ error: 'psm_id required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Update problem_solution_machine
    const { error } = await supabase
      .from('problem_solution_machine')
      .update({
        marketing_copy: override_copy || null,
        title: override_title || null,
        subtitle: override_subtitle || null,
        pitch_headline: override_headline || null,
        action_cta: override_cta || null,
        curated_skus: curated_skus || []
      })
      .eq('id', psm_id);

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
