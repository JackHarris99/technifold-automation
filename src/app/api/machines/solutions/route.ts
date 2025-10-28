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

    // Fetch machine solutions from the view
    const { data, error } = await supabase
      .from('v_machine_solution_problem_full')
      .select('*')
      .eq('machine_slug', slug)
      .order('machine_solution_rank', { ascending: true })
      .order('machine_solution_problem_rank', { ascending: true });

    if (error) {
      console.error('[machines/solutions] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch solutions' }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ solutions: [] });
    }

    // Group by solution
    const solutionsMap = new Map();

    data.forEach((row: any) => {
      if (!solutionsMap.has(row.solution_id)) {
        solutionsMap.set(row.solution_id, {
          solution_id: row.solution_id,
          solution_name: row.solution_name,
          solution_core_benefit: row.solution_core_benefit,
          solution_long_description: row.solution_long_description,
          problems: []
        });
      }

      const solution = solutionsMap.get(row.solution_id);
      solution.problems.push({
        problem_id: row.problem_id,
        problem_title: row.problem_title,
        pitch_headline: row.pitch_headline,
        pitch_detail: row.pitch_detail,
        action_cta: row.action_cta
      });
    });

    const solutions = Array.from(solutionsMap.values());

    return NextResponse.json({
      machine: {
        machine_id: data[0].machine_id,
        machine_brand: data[0].machine_brand,
        machine_model: data[0].machine_model,
        machine_display_name: data[0].machine_display_name
      },
      solutions
    });
  } catch (err) {
    console.error('[machines/solutions] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
