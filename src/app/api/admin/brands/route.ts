/**
 * GET /api/admin/brands
 * Fetch all brands from machines table + brand_media
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

// Helper function to create slug from brand name
function createSlug(brand: string): string {
  return brand
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    // Get all unique brands from machines table with pagination
    let machines: any[] = [];
    let machinesOffset = 0;
    const machinesBatchSize = 2000;
    let hasMachinesMore = true;

    while (hasMachinesMore) {
      const { data: batch, error: machinesError } = await supabase
        .from('machines')
        .select('brand')
        .order('brand')
        .range(machinesOffset, machinesOffset + machinesBatchSize - 1);

      if (machinesError) throw machinesError;

      if (!batch || batch.length === 0) {
        hasMachinesMore = false;
      } else {
        machines = [...machines, ...batch];
        if (batch.length < machinesBatchSize) {
          hasMachinesMore = false;
        }
        machinesOffset += machinesBatchSize;
      }
    }

    // Get unique brands and create slugs
    const brandMap = new Map<string, string>();
    machines.forEach((m) => {
      if (m.brand) {
        const slug = createSlug(m.brand);
        brandMap.set(slug, m.brand);
      }
    });

    // Get existing brand media with pagination
    let brandMedia: any[] = [];
    let mediaOffset = 0;
    const mediaBatchSize = 500;
    let hasMediaMore = true;

    while (hasMediaMore) {
      const { data: batch, error: mediaError } = await supabase
        .from('brand_media')
        .select('*')
        .order('brand_name')
        .range(mediaOffset, mediaOffset + mediaBatchSize - 1);

      if (mediaError) throw mediaError;

      if (!batch || batch.length === 0) {
        hasMediaMore = false;
      } else {
        brandMedia = [...brandMedia, ...batch];
        if (batch.length < mediaBatchSize) {
          hasMediaMore = false;
        }
        mediaOffset += mediaBatchSize;
      }
    }

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
