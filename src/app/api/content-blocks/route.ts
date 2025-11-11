/**
 * Public Content Blocks API
 * Fetch content blocks for problem/solutions (with optional machine-specific overrides)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const problemSolutionId = searchParams.get('problem_solution_id');
    const machineId = searchParams.get('machine_id');

    if (!problemSolutionId) {
      return NextResponse.json({ error: 'problem_solution_id is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();
    let blocks: any[] = [];

    if (machineId) {
      // Fetch machine-specific blocks with overrides
      const { data: machineBlocks, error: machineError } = await supabase
        .from('v_problem_solution_machine_content_blocks')
        .select('*')
        .eq('problem_solution_id', problemSolutionId)
        .eq('machine_id', machineId)
        .order('display_order', { ascending: true });

      if (machineError) {
        console.warn('[content-blocks] Machine blocks error:', machineError);
      }

      // If we have machine-specific blocks, use those
      if (machineBlocks && machineBlocks.length > 0) {
        blocks = machineBlocks.map(b => ({
          block_id: b.block_id,
          block_type: b.block_type,
          title: b.title,
          content: b.resolved_content,
          icon: b.icon,
          display_order: b.display_order,
          is_override: b.is_override
        }));
      } else {
        // Fall back to generic blocks
        const { data: genericBlocks, error: genericError } = await supabase
          .from('v_problem_solution_content_blocks')
          .select('*')
          .eq('problem_solution_id', problemSolutionId)
          .order('display_order', { ascending: true });

        if (genericError) throw genericError;

        blocks = (genericBlocks || []).map(b => ({
          block_id: b.block_id,
          block_type: b.block_type,
          title: b.title,
          content: b.content,
          icon: b.icon,
          display_order: b.display_order,
          is_override: false
        }));
      }
    } else {
      // No machine specified, fetch generic blocks
      const { data: genericBlocks, error } = await supabase
        .from('v_problem_solution_content_blocks')
        .select('*')
        .eq('problem_solution_id', problemSolutionId)
        .order('display_order', { ascending: true });

      if (error) throw error;

      blocks = (genericBlocks || []).map(b => ({
        block_id: b.block_id,
        block_type: b.block_type,
        title: b.title,
        content: b.content,
        icon: b.icon,
        display_order: b.display_order,
        is_override: false
      }));
    }

    // Group blocks by type for easier rendering
    const blocksByType = blocks.reduce((acc: any, block: any) => {
      if (!acc[block.block_type]) {
        acc[block.block_type] = [];
      }
      acc[block.block_type].push(block);
      return acc;
    }, {});

    return NextResponse.json({ blocks, blocksByType });
  } catch (error: any) {
    console.error('[content-blocks] GET error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
