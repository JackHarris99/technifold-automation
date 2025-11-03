/**
 * GET /api/admin/brands
 * Fetch all brands from machines table + brand_media
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Helper function to create slug from brand name
function createSlug(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    // Get all unique brands from machines table
    const { data: machines, error: machinesError } = await supabase
      .from('machines')
      .select('brand')
      .order('brand')
      .limit(2000);

    if (machinesError) throw machinesError;

    // Get unique brands and create slugs
    const brandMap = new Map<string, string>();
    machines?.forEach((m) => {
      if (m.brand) {
        const slug = createSlug(m.brand);
        brandMap.set(slug, m.brand);
      }
    });

    // Get existing brand media
    const { data: brandMedia, error: mediaError } = await supabase
      .from('brand_media')
      .select('*')
      .order('brand_name')
      .limit(500);

    if (mediaError) throw mediaError;

    // Merge data - create brand_media entries for brands that don't have one
    const existingBrandSlugs = new Set(brandMedia?.map((bm) => bm.brand_slug) || []);

    const allBrands = [
      ...(brandMedia || []),
      ...Array.from(brandMap.entries())
        .filter(([slug]) => !existingBrandSlugs.has(slug))
        .map(([slug, name]) => ({
          brand_slug: slug,
          brand_name: name,
          logo_url: null,
          hero_url: null,
        })),
    ].sort((a, b) => a.brand_name.localeCompare(b.brand_name));

    return NextResponse.json({ brands: allBrands });
  } catch (error: any) {
    console.error('Fetch brands error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch brands' }, { status: 500 });
  }
}
