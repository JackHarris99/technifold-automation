/**
 * Problem Solution Blocks API
 * Manage links between content blocks and problem/solutions
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// GET - Fetch blocks for a problem/solution
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemSolutionId = searchParams.get('problem_solution_id');

    if (!problemSolutionId) {
      return NextResponse.json({ error: 'problem_solution_id is required' }, { status: 400 });
    }

    const { data: blocks, error } = await supabase
      .from('v_problem_solution_content_blocks')
      .select('*')
      .eq('problem_solution_id', problemSolutionId)
      .order('display_order', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ blocks: blocks || [] });
  } catch (error: any) {
    console.error('[problem-solution-blocks] GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Link a block to a problem/solution
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { problem_solution_id, block_id, display_order } = body;

    if (!problem_solution_id || !block_id) {
      return NextResponse.json({ error: 'problem_solution_id and block_id are required' }, { status: 400 });
    }

    // Get max display_order if not provided
    let finalDisplayOrder = display_order;
    if (finalDisplayOrder === undefined) {
      const { data: existing } = await supabase
        .from('problem_solution_blocks')
        .select('display_order')
        .eq('problem_solution_id', problem_solution_id)
        .order('display_order', { ascending: false })
        .limit(1)
        .single();

      finalDisplayOrder = existing ? existing.display_order + 1 : 0;
    }

    const { data: link, error } = await supabase
      .from('problem_solution_blocks')
      .insert({
        problem_solution_id,
        block_id,
        display_order: finalDisplayOrder,
        active: true
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ link });
  } catch (error: any) {
    console.error('[problem-solution-blocks] POST error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update block link (mainly for reordering)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, display_order, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const updateData: any = {};
    if (display_order !== undefined) updateData.display_order = display_order;
    if (active !== undefined) updateData.active = active;

    const { data: link, error } = await supabase
      .from('problem_solution_blocks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ link });
  } catch (error: any) {
    console.error('[problem-solution-blocks] PUT error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Remove block from problem/solution
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('problem_solution_blocks')
      .update({ active: false })
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('[problem-solution-blocks] DELETE error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
