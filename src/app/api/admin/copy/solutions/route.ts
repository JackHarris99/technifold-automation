/**
 * GET /api/admin/copy/solutions?machine_id=X
 * Get solutions for a machine
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

    // Get distinct solutions for this machine
    const { data, error } = await supabase
      .from('machine_solution')
      .select(`
        solution_id,
        solutions:solution_id(solution_id, name)
      `)
      .eq('machine_id', machineId)
      .order('relevance_rank', { ascending: true });

    if (error) {
      console.error('[admin/copy/solutions] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch solutions' }, { status: 500 });
    }

    const solutions = (data || []).map((row: any) => ({
      solution_id: row.solutions?.solution_id,
      name: row.solutions?.name
    })).filter(s => s.solution_id);

    return NextResponse.json({ solutions });
  } catch (err) {
    console.error('[admin/copy/solutions] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
