/**
 * GET /api/admin/copy/load?machine_id=X&problem_solution_id=Y
 * Load copy data for editing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const machineId = request.nextUrl.searchParams.get('machine_id');
    const problemSolutionId = request.nextUrl.searchParams.get('problem_solution_id');

    if (!machineId || !problemSolutionId) {
      return NextResponse.json({ error: 'machine_id and problem_solution_id required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get base copy from problem_solution
    const { data: ps, error: psError } = await supabase
      .from('problem_solution')
      .select('*')
      .eq('id', problemSolutionId)
      .single();

    if (psError || !ps) {
      return NextResponse.json({ error: 'Problem/solution not found' }, { status: 404 });
    }

    // Get machine-specific override from problem_solution_machine
    const { data: psm } = await supabase
      .from('problem_solution_machine')
      .select('*')
      .eq('machine_id', machineId)
      .eq('problem_solution_id', problemSolutionId)
      .single();

    // Fetch available SKUs (from products)
    const { data: skus } = await supabase
      .from('products')
      .select('product_code, description')
      .order('product_code')
      .limit(500);

    return NextResponse.json({
      // Base copy fields
      baseCopy: ps.marketing_copy || '',
      baseTitle: ps.title || '',
      baseSubtitle: ps.subtitle || '',
      baseHeadline: ps.pitch_headline || '',
      baseCta: ps.action_cta || '',
      baseImageUrl: ps.image_url || null,
      baseVideoUrl: ps.video_url || null,

      // Override copy fields
      overrideCopy: psm?.marketing_copy || '',
      overrideTitle: psm?.title || '',
      overrideSubtitle: psm?.subtitle || '',
      overrideHeadline: psm?.pitch_headline || '',
      overrideCta: psm?.action_cta || '',
      overrideImageUrl: psm?.image_url || null,
      overrideVideoUrl: psm?.video_url || null,

      // SKU curation
      curatedSkus: psm?.curated_skus || [],

      // IDs for updates
      psmId: psm?.id,
      problemSolutionId,
      machineId,

      // Available SKUs dropdown
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
