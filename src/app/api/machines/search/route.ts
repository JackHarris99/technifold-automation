/**
 * GET /api/machines/search?q=ti52
 * Searches machines by brand, model, or display name
 * Returns top matches for autocomplete
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const TYPE_DISPLAY: Record<string, string> = {
  'folder': 'Folding Machine',
  'perfect_binder': 'Perfect Binder',
  'saddle_stitcher': 'Saddle Stitcher',
  'booklet_maker': 'Booklet Maker',
  'cover_feeder': 'Cover Feeder',
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q')?.trim();
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  if (!query || query.length < 2) {
    return NextResponse.json({ results: [] });
  }

  const supabase = getSupabaseClient();

  // Search across brand, model, and display_name
  const { data: machines, error } = await supabase
    .from('machines')
    .select('machine_id, brand, model, display_name, type, slug')
    .or(`brand.ilike.%${query}%,model.ilike.%${query}%,display_name.ilike.%${query}%`)
    .limit(limit);

  if (error) {
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }

  // Score and sort results (exact matches first, then partial)
  const scored = machines?.map((m) => {
    const lowerQuery = query.toLowerCase();
    let score = 0;

    // Exact model match
    if (m.model.toLowerCase() === lowerQuery) score += 100;
    // Model starts with query
    else if (m.model.toLowerCase().startsWith(lowerQuery)) score += 50;
    // Model contains query
    else if (m.model.toLowerCase().includes(lowerQuery)) score += 20;

    // Brand starts with query
    if (m.brand.toLowerCase().startsWith(lowerQuery)) score += 30;
    // Brand contains query
    else if (m.brand.toLowerCase().includes(lowerQuery)) score += 10;

    return {
      ...m,
      typeDisplay: TYPE_DISPLAY[m.type] || m.type,
      score,
    };
  }) || [];

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return NextResponse.json({
    results: scored.map(({ score, ...rest }) => rest),
    query,
  });
}
