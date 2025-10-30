/**
 * GET /api/admin/copy/problems?machine_id=X&solution_id=Y
 * Get problems for a machine/solution combination
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

    // Get machine_solution_id first
    const { data: ms } = await supabase
      .from('machine_solution')
      .select('machine_solution_id')
      .eq('machine_id', machineId)
      .eq('solution_id', solutionId)
      .single();

    if (!ms) {
      return NextResponse.json({ problems: [] });
    }

    // Get problems for this machine_solution
    const { data, error } = await supabase
      .from('machine_solution_problem')
      .select(`
        problem_id,
        problems:problem_id(problem_id, title)
      `)
      .eq('machine_solution_id', ms.machine_solution_id)
      .order('relevance_rank', { ascending: true });

    if (error) {
      console.error('[admin/copy/problems] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
    }

    const problems = (data || []).map((row: any) => ({
      problem_id: row.problems?.problem_id,
      title: row.problems?.title
    })).filter(p => p.problem_id);

    return NextResponse.json({ problems });
  } catch (err) {
    console.error('[admin/copy/problems] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
