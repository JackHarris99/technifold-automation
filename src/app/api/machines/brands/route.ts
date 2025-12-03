/**
 * GET /api/machines/brands
 * Returns distinct machine brands for public machine finder
 * Optional: ?type=folder to filter by machine type
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

function normalizeBrandSlug(brand: string): string {
  return brand.toLowerCase()
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ä/g, 'a').replace(/ß/g, 'ss')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabaseClient();
    const { searchParams } = new URL(request.url);
    const typeFilter = searchParams.get('type');

    // Build query
    let query = supabase
      .from('machines')
      .select('brand, type')
      .order('brand', { ascending: true })
      .limit(2000);

    // Optional type filter
    if (typeFilter) {
      query = query.eq('type', typeFilter);
    }

    const { data, error } = await query;

    if (error) {
      console.error('[machines/brands] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch brands' }, { status: 500 });
    }

    // Group by brand with counts and types
    const brandMap = new Map<string, { count: number; types: Set<string> }>();
    data?.forEach(m => {
      if (!m.brand) return;
      if (!brandMap.has(m.brand)) {
        brandMap.set(m.brand, { count: 0, types: new Set() });
      }
      const entry = brandMap.get(m.brand)!;
      entry.count++;
      if (m.type) entry.types.add(m.type);
    });

    const brands = Array.from(brandMap.entries()).map(([brand, data]) => ({
      brand,
      slug: normalizeBrandSlug(brand),
      count: data.count,
      types: Array.from(data.types),
    }));

    return NextResponse.json({ brands });
  } catch (err) {
    console.error('[machines/brands] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
