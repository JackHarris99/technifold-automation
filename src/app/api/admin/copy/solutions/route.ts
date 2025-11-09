/**
 * GET /api/admin/copy/solutions?machine_id=X
 * Get solutions for a specific machine (for marketing tab)
 * Uses the v_problem_solution_machine view
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

    // Get unique solutions for this machine from the view
    const { data, error } = await supabase
      .from('v_problem_solution_machine')
      .select('solution_name')
      .eq('machine_id', machineId);

    if (error) {
      console.error('[admin/copy/solutions] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch solutions' }, { status: 500 });
    }

    // Get unique solutions (view returns one row per problem, so we need to dedupe)
    const solutionsMap = new Map();
    (data || []).forEach(row => {
      if (!solutionsMap.has(row.solution_name)) {
        solutionsMap.set(row.solution_name, {
          solution_id: row.solution_name, // Use solution_name as ID
          name: row.solution_name
        });
      }
    });

    const solutions = Array.from(solutionsMap.values());

    console.log(`[admin/copy/solutions] Found ${solutions.length} solutions for machine ${machineId}`);

    return NextResponse.json({ solutions });
  } catch (err) {
    console.error('[admin/copy/solutions] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
