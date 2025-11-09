/**
 * GET /api/admin/copy/problems?machine_id=X&solution_id=Y
 * Get problems for a specific machine + solution combination
 * Uses the v_problem_solution_machine view
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

    // Get problems from the view for this machine + solution
    // Note: solutionId is actually the solution_name (from solutions endpoint)
    const { data, error } = await supabase
      .from('v_problem_solution_machine')
      .select('problem_solution_id, title, problem_description, machine_relevance_rank')
      .eq('machine_id', machineId)
      .eq('solution_name', solutionId)
      .order('machine_relevance_rank', { ascending: true });

    if (error) {
      console.error('[admin/copy/problems] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch problems' }, { status: 500 });
    }

    const problems = (data || []).map(row => ({
      problem_id: row.problem_solution_id,
      title: row.title,
      description: row.problem_description
    }));

    console.log(`[admin/copy/problems] Found ${problems.length} problems for machine ${machineId} + solution ${solutionId}`);

    return NextResponse.json({ problems });
  } catch (err) {
    console.error('[admin/copy/problems] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
