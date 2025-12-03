/**
 * GET /api/machines/models
 * Returns models filtered by type and/or brand
 * Required: at least one of ?type= or ?brand=
 * Returns models grouped by type when brand-only is specified
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const TYPE_DISPLAY: Record<string, string> = {
  'folder': 'Folding Machines',
  'perfect_binder': 'Perfect Binders',
  'saddle_stitcher': 'Saddle Stitchers',
  'booklet_maker': 'Booklet Makers',
  'cover_feeder': 'Cover Feeders',
};

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');
    const brandFilter = searchParams.get('brand');

    // Require at least one filter
    if (!typeFilter && !brandFilter) {
      return NextResponse.json(
        { error: 'At least one of type or brand is required' },
        { status: 400 }
      );
    }

    // Build query
    let query = supabase
      .from('machines')
      .select('model, slug, type, brand')
      .order('model', { ascending: true })
      .limit(500);

    if (typeFilter) {
      query = query.eq('type', typeFilter);
    }
    if (brandFilter) {
      query = query.eq('brand', brandFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[machines/models] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch models' }, { status: 500 });
    }

    // If brand-only, group by type for better UX
    if (brandFilter && !typeFilter) {
      const grouped: Record<string, Array<{ model: string; slug: string }>> = {};

      data?.forEach(m => {
        const typeKey = m.type || 'other';
        if (!grouped[typeKey]) {
          grouped[typeKey] = [];
        }
        grouped[typeKey].push({ model: m.model, slug: m.slug });
      });

      // Convert to array with display names
      const modelGroups = Object.entries(grouped).map(([type, models]) => ({
        type,
        displayName: TYPE_DISPLAY[type] || type,
        models,
      }));

      return NextResponse.json({ modelGroups, grouped: true });
    }

    // Otherwise return flat list
    const models = data?.map(m => ({
      model: m.model,
      slug: m.slug,
      type: m.type,
      brand: m.brand,
    })) || [];

    return NextResponse.json({ models, grouped: false });
  } catch (err) {
    console.error('[machines/models] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
