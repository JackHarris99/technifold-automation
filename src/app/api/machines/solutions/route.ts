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
    // Each row = ONE CARD = one (machine, solution, problem) combination
    const { data: problemCards, error } = await supabase
      .from('v_machine_solution_problem_full')
      .select('*')
      .eq('machine_slug', slug)
      .order('machine_solution_rank', { ascending: true })
      .order('global_solution_problem_rank', { ascending: true });

    if (error) {
      console.error('[machines/solutions] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch solutions' }, { status: 500 });
    }

    if (!problemCards || problemCards.length === 0) {
      return NextResponse.json({ problemCards: [] });
    }

    return NextResponse.json({
      machine: {
        machine_id: problemCards[0].machine_id,
        machine_brand: problemCards[0].machine_brand,
        machine_model: problemCards[0].machine_model,
        machine_display_name: problemCards[0].machine_display_name
      },
      problemCards  // Return as-is, no grouping
    });
  } catch (err) {
    console.error('[machines/solutions] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
