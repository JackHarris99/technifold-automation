/**
 * GET /api/machines/types
 * Returns all machine types with counts
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const TYPE_DISPLAY: Record<string, string> = {
  'folder': 'Folding Machine',
  'perfect_binder': 'Perfect Binder',
  'saddle_stitcher': 'Saddle Stitcher',
  'booklet_maker': 'Booklet Maker',
  'cover_feeder': 'Cover Feeder',
};

const TYPE_SLUGS: Record<string, string> = {
  'folder': 'folder',
  'perfect_binder': 'perfect-binder',
  'saddle_stitcher': 'saddle-stitcher',
  'booklet_maker': 'booklet-maker',
  'cover_feeder': 'cover-feeder',
};

export async function GET() {
  const supabase = getSupabaseClient();

  const { data: machines, error } = await supabase
    .from('machines')
    .select('type');

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch types' }, { status: 500 });
  }

  // Count by type
  const typeCounts = new Map<string, number>();
  machines?.forEach((m) => {
    typeCounts.set(m.type, (typeCounts.get(m.type) || 0) + 1);
  });

  const types = Array.from(typeCounts.entries())
    .map(([type, count]) => ({
      type,
      slug: TYPE_SLUGS[type] || type,
      displayName: TYPE_DISPLAY[type] || type,
      count,
    }))
    .sort((a, b) => b.count - a.count); // Sort by count descending

  return NextResponse.json({ types });
}
