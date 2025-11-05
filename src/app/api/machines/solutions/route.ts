/**
 * GET /api/machines/solutions?slug=xxx
 * Returns solutions and problems for a specific machine
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const slug = searchParams.get('slug');

    if (!slug) {
      return NextResponse.json({ error: 'Slug parameter required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Fetch machine problem cards from the view
    // Each row = ONE CARD = one (machine, problem/solution) combination
    console.log('[machines/solutions] Querying for slug:', slug);

    const { data: problemCards, error } = await supabase
      .from('v_problem_solution_machine')
      .select('*')
      .eq('slug', slug)
      .order('machine_relevance_rank', { ascending: true })
      .order('global_relevance_rank', { ascending: true });

    console.log('[machines/solutions] Query result - cards:', problemCards?.length || 0, 'error:', error?.message || 'none');

    if (error) {
      console.error('[machines/solutions] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch solutions', details: error }, { status: 500 });
    }

    if (!problemCards || problemCards.length === 0) {
      console.log('[machines/solutions] No problem cards found for slug:', slug);
      return NextResponse.json({ problemCards: [], message: 'No solutions found for this machine' });
    }

    return NextResponse.json({
      machine: {
        machine_id: problemCards[0].machine_id,
        brand: problemCards[0].brand,
        model: problemCards[0].model,
        display_name: problemCards[0].display_name
      },
      problemCards  // Return as-is, no grouping
    });
  } catch (err) {
    console.error('[machines/solutions] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
