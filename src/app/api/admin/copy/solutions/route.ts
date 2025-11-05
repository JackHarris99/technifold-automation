/**
 * GET /api/admin/copy/solutions
 * Get all problem/solutions (not machine-specific)
 * Used for admin tools to browse/create problem/solution content
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();

    // Get all problem/solutions from base table
    const { data, error } = await supabase
      .from('problem_solution')
      .select('id, slug, title, solution_name, active')
      .eq('active', true)
      .order('relevance_rank', { ascending: true })
      .limit(500);

    if (error) {
      console.error('[admin/copy/solutions] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch problem/solutions' }, { status: 500 });
    }

    const problemSolutions = (data || []).map((row: any) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      solution_name: row.solution_name
    }));

    return NextResponse.json({ problemSolutions });
  } catch (err) {
    console.error('[admin/copy/solutions] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
