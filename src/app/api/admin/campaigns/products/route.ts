/**
 * POST /api/admin/campaigns/products
 * Get recommended products for selected problem/solutions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problem_solution_ids } = body;

    if (!problem_solution_ids || !Array.isArray(problem_solution_ids)) {
      return NextResponse.json({ error: 'problem_solution_ids array required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get curated SKUs from problem_solution records
    const { data: problemSolutions } = await supabase
      .from('v_problem_solution_machine')
      .select('curated_skus')
      .in('problem_solution_id', problem_solution_ids);

    // Collect all unique SKUs
    const allSkus = new Set<string>();
    problemSolutions?.forEach(ps => {
      if (ps.curated_skus && Array.isArray(ps.curated_skus)) {
        ps.curated_skus.forEach(sku => allSkus.add(sku));
      }
    });

    if (allSkus.size === 0) {
      return NextResponse.json({ products: [] });
    }

    // Get product details
    const { data: products } = await supabase
      .from('products')
      .select('product_code, description, category, image_url, price')
      .in('product_code', Array.from(allSkus))
      .eq('active', true);

    return NextResponse.json({
      products: products || [],
      count: products?.length || 0,
    });

  } catch (err) {
    console.error('[campaigns/products] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
