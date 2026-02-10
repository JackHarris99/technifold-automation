/**
 * GET /api/marketing/problems
 * Get available problems filtered by machine type(s)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const types = searchParams.get('types')?.split(',') || [];

    const supabase = getSupabaseClient();

    // TODO: Once machine_type_problems table is populated, query it
    // For now, return placeholder problems based on machine type

    const problemsByType: Record<string, any[]> = {
      folder: [
        { problem_slug: 'cracking', problem_name: 'Cracking & Scoring Issues', machine_types: ['folder'] },
        { problem_slug: 'misregistration', problem_name: 'Misregistration Problems', machine_types: ['folder'] },
        { problem_slug: 'jamming', problem_name: 'Paper Jamming', machine_types: ['folder'] },
      ],
      perfect_binder: [
        { problem_slug: 'spine_cracking', problem_name: 'Spine Cracking', machine_types: ['perfect_binder'] },
        { problem_slug: 'page_pullout', problem_name: 'Page Pull-out', machine_types: ['perfect_binder'] },
        { problem_slug: 'adhesive_failure', problem_name: 'Adhesive Failure', machine_types: ['perfect_binder'] },
      ],
      saddle_stitcher: [
        { problem_slug: 'wire_jam', problem_name: 'Wire Jamming', machine_types: ['saddle_stitcher'] },
        { problem_slug: 'misalignment', problem_name: 'Signature Misalignment', machine_types: ['saddle_stitcher'] },
        { problem_slug: 'head_wear', problem_name: 'Stitching Head Wear', machine_types: ['saddle_stitcher'] },
      ],
      booklet_maker: [
        { problem_slug: 'spine_crease', problem_name: 'Spine Creasing Issues', machine_types: ['booklet_maker'] },
        { problem_slug: 'trim_quality', problem_name: 'Trim Quality Problems', machine_types: ['booklet_maker'] },
      ],
      cover_feeder: [
        { problem_slug: 'feed_accuracy', problem_name: 'Cover Feed Accuracy', machine_types: ['cover_feeder'] },
        { problem_slug: 'registration', problem_name: 'Registration Issues', machine_types: ['cover_feeder'] },
      ],
    };

    // Get problems for requested types
    const problems: any[] = [];
    for (const type of types) {
      if (problemsByType[type]) {
        problems.push(...problemsByType[type]);
      }
    }

    // Remove duplicates
    const uniqueProblems = Array.from(
      new Map(problems.map(p => [p.problem_slug, p])).values()
    );

    return NextResponse.json({
      success: true,
      problems: uniqueProblems,
    });
  } catch (error) {
    console.error('[Marketing Problems API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
