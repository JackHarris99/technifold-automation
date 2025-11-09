/**
 * GET /api/admin/copy/problems?machine_id=X&solution_id=Y
 * Get problems for a specific machine + solution combination
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const machineId = request.nextUrl.searchParams.get('machine_id');
    const solutionId = request.nextUrl.searchParams.get('solution_id');

    if (!machineId || !solutionId) {
      return NextResponse.json({ error: 'machine_id and solution_id required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Step 1: Get machine_solution_id
    const { data: msData, error: msError } = await supabase
      .from('machine_solution')
      .select('machine_solution_id')
      .eq('machine_id', machineId)
      .eq('solution_id', solutionId)
      .single();

    if (msError || !msData) {
      console.error('[admin/copy/problems] machine_solution not found:', msError);
      return NextResponse.json({ error: 'Machine-solution combination not found' }, { status: 404 });
    }

    // Step 2: Get problems from solution_problem table for this solution
    const { data: spData, error: spError } = await supabase
      .from('solution_problem')
      .select(`
        solution_problem_id,
        problem_id,
        pitch_headline,
        relevance_rank,
        problems:problem_id(
          problem_id,
          title,
          description,
          slug
        )
      `)
      .eq('solution_id', solutionId)
      .order('relevance_rank', { ascending: true });

    if (spError) {
      console.error('[admin/copy/problems] Error:', spError);
      return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
    }

    const problems = (spData || [])
      .filter((row: any) => row.problems) // Filter out nulls
      .map((row: any) => ({
        problem_id: row.problems.problem_id,
        solution_problem_id: row.solution_problem_id,
        title: row.problems.title,
        description: row.problems.description,
        pitch_headline: row.pitch_headline,
        slug: row.problems.slug
      }));

    return NextResponse.json({ problems });
  } catch (err) {
    console.error('[admin/copy/problems] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
