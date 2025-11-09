/**
 * GET /api/admin/copy/solutions?machine_id=X
 * Get solutions for a specific machine (for marketing tab)
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

    // Get solutions for this machine from machine_solution + solutions join
    const { data, error } = await supabase
      .from('machine_solution')
      .select(`
        machine_solution_id,
        solution_id,
        solutions:solution_id(
          solution_id,
          name,
          core_benefit,
          active
        )
      `)
      .eq('machine_id', machineId)
      .eq('solutions.active', true)
      .order('relevance_rank', { ascending: true });

    if (error) {
      console.error('[admin/copy/solutions] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch solutions' }, { status: 500 });
    }

    const solutions = (data || [])
      .filter((row: any) => row.solutions) // Filter out nulls
      .map((row: any) => ({
        solution_id: row.solutions.solution_id,
        machine_solution_id: row.machine_solution_id,
        name: row.solutions.name,
        core_benefit: row.solutions.core_benefit
      }));

    return NextResponse.json({ solutions });
  } catch (err) {
    console.error('[admin/copy/solutions] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
