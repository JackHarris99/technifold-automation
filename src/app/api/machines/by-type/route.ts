/**
 * GET /api/machines/by-type?type=folder
 * Returns all brands for a given type, or all brands with their types
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

function normalizeBrandSlug(brand: string): string {
  return brand.toLowerCase()
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ä/g, 'a').replace(/ß/g, 'ss')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const brand = searchParams.get('brand');

  const supabase = getSupabaseClient();

  // If type specified, return brands for that type
  if (type) {
    const { data: machines, error } = await supabase
      .from('machines')
      .select('brand, model, slug')
      .eq('type', type)
      .order('brand');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    // Group by brand
    const brandMap = new Map<string, { models: Array<{ model: string; slug: string }> }>();
    machines?.forEach((m) => {
      const existing = brandMap.get(m.brand) || { models: [] };
      existing.models.push({ model: m.model, slug: m.slug });
      brandMap.set(m.brand, existing);
    });

    const brands = Array.from(brandMap.entries()).map(([brandName, data]) => ({
      brand: brandName,
      slug: normalizeBrandSlug(brandName),
      modelCount: data.models.length,
      models: data.models,
    }));

    return NextResponse.json({ brands, type, typeDisplay: TYPE_DISPLAY[type] || type });
  }

  // If brand specified, return types for that brand
  if (brand) {
    const { data: machines, error } = await supabase
      .from('machines')
      .select('type, model, slug')
      .ilike('brand', brand)
      .order('type');

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
    }

    // Group by type
    const typeMap = new Map<string, { models: Array<{ model: string; slug: string }> }>();
    machines?.forEach((m) => {
      const existing = typeMap.get(m.type) || { models: [] };
      existing.models.push({ model: m.model, slug: m.slug });
      typeMap.set(m.type, existing);
    });

    const types = Array.from(typeMap.entries()).map(([typeName, data]) => ({
      type: typeName,
      typeDisplay: TYPE_DISPLAY[typeName] || typeName,
      modelCount: data.models.length,
      models: data.models,
    }));

    return NextResponse.json({ types, brand });
  }

  // No filter - return all brands grouped by type
  const { data: machines, error } = await supabase
    .from('machines')
    .select('type, brand')
    .order('type')
    .order('brand');

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 });
  }

  // Build nested structure
  const typeMap = new Map<string, Set<string>>();
  machines?.forEach((m) => {
    const existing = typeMap.get(m.type) || new Set();
    existing.add(m.brand);
    typeMap.set(m.type, existing);
  });

  const result = Array.from(typeMap.entries()).map(([type, brands]) => ({
    type,
    typeDisplay: TYPE_DISPLAY[type] || type,
    brands: Array.from(brands).map(b => ({
      brand: b,
      slug: normalizeBrandSlug(b),
    })),
  }));

  return NextResponse.json({ data: result });
}
