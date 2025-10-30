/**
 * GET /api/admin/products/[code]
 * PATCH /api/admin/products/[code]
 * View and edit SKU details
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const supabase = getSupabaseClient();

    // Fetch SKU details
    const { data: sku, error } = await supabase
      .from('products')
      .select('product_code, product_name, description, price, category, type')
      .eq('product_code', code)
      .single();

    if (error || !sku) {
      return NextResponse.json({ error: 'SKU not found' }, { status: 404 });
    }

    // Find where this SKU is curated
    const { data: curationUsage } = await supabase
      .from('machine_solution_problem')
      .select(`
        machine_solution_problem_id:id,
        machine_solution!inner(
          machine:machine_id(display_name),
          solution:solution_id(name)
        ),
        problem:problem_id(title)
      `)
      .contains('curated_skus', [code]);

    const formattedUsage = (curationUsage || []).map((row: any) => ({
      machine_solution_problem_id: row.machine_solution_problem_id,
      machine_display_name: row.machine_solution?.machine?.display_name || 'Unknown',
      solution_name: row.machine_solution?.solution?.name || 'Unknown',
      problem_title: row.problem?.title || 'Unknown'
    }));

    return NextResponse.json({
      sku,
      curationUsage: formattedUsage
    });
  } catch (err) {
    console.error('[admin/products/code] GET error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const body = await request.json();
    const { description } = body;

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('products')
      .update({ description })
      .eq('product_code', code);

    if (error) {
      console.error('[admin/products/code] PATCH error:', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/products/code] PATCH unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
