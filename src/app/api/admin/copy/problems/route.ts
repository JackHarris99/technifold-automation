/**
 * GET /api/admin/copy/problems?machine_id=X
 * Get problem/solutions for a specific machine (for copy editor dropdown)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const machineId = request.nextUrl.searchParams.get('machine_id');

    if (!machineId) {
      return NextResponse.json({ error: 'machine_id required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get problem/solutions for this machine from the view
    const { data, error } = await supabase
      .from('v_problem_solution_machine')
      .select('problem_solution_id, resolved_title, solution_name')
      .eq('machine_id', machineId)
      .order('machine_relevance_rank', { ascending: true });

    if (error) {
      console.error('[admin/copy/problems] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch problem/solutions' }, { status: 500 });
    }

    const problemSolutions = (data || []).map((row: any) => ({
      problem_solution_id: row.problem_solution_id,
      title: row.resolved_title,
      solution_name: row.solution_name
    }));

    return NextResponse.json({ problemSolutions });
  } catch (err) {
    console.error('[admin/copy/problems] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
