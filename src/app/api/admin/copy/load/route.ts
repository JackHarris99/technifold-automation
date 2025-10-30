/**
 * GET /api/admin/copy/load?machine_id=X&solution_id=Y&problem_id=Z
 * Load copy data for editing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const machineId = request.nextUrl.searchParams.get('machine_id');
    const solutionId = request.nextUrl.searchParams.get('solution_id');
    const problemId = request.nextUrl.searchParams.get('problem_id');

    if (!machineId || !solutionId || !problemId) {
      return NextResponse.json({ error: 'machine_id, solution_id, and problem_id required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get base copy from solution_problem
    const { data: sp } = await supabase
      .from('solution_problem')
      .select('problem_solution_copy')
      .eq('solution_id', solutionId)
      .eq('problem_id', problemId)
      .single();

    // Get machine_solution_id
    const { data: ms } = await supabase
      .from('machine_solution')
      .select('machine_solution_id')
      .eq('machine_id', machineId)
      .eq('solution_id', solutionId)
      .single();

    if (!ms) {
      return NextResponse.json({ error: 'Machine/solution combination not found' }, { status: 404 });
    }

    // Get override copy and curated SKUs from machine_solution_problem
    const { data: msp } = await supabase
      .from('machine_solution_problem')
      .select('id, problem_solution_copy, curated_skus')
      .eq('machine_solution_id', ms.machine_solution_id)
      .eq('problem_id', problemId)
      .single();

    // Fetch available SKUs (from products)
    const { data: skus } = await supabase
      .from('products')
      .select('product_code, description')
      .order('product_code')
      .limit(500);

    return NextResponse.json({
      baseCopy: sp?.problem_solution_copy || '',
      overrideCopy: msp?.problem_solution_copy || '',
      curatedSkus: msp?.curated_skus || [],
      mspId: msp?.id,
      availableSkus: (skus || []).map(s => ({
        code: s.product_code,
        name: s.description
      }))
    });
  } catch (err) {
    console.error('[admin/copy/load] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
