/**
 * GET /api/problem-solutions/all
 * Get all problem/solutions for interests multi-select
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  const supabase = getSupabaseClient();

  const { data, error } = await supabase
    .from('problem_solution')
    .select('id, solution_name, title')
    .eq('active', true)
    .order('solution_name');

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  return NextResponse.json({ solutions: data || [] });
}
