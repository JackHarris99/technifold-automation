/**
 * GET /api/solutions/shafts
 * Returns available shaft size options for a brand
 * Queries tool_brand_compatibility for unique shaft configurations
 *
 * Display logic:
 * - Shows just "35mm" when there's only one OD for that shaft size
 * - Shows "20mm (36mm OD)" when multiple ODs exist for same shaft size
 *
 * Query params:
 *   - brand: Machine brand
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

interface ShaftSpec {
  shaft_size_mm: number;
  outer_diameter_mm: number;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get('brand');

    if (!brand) {
      return NextResponse.json({ error: 'brand parameter required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get all compatibility records for this brand
    const { data: records, error } = await supabase
      .from('tool_brand_compatibility')
      .select('shaft_specs')
      .eq('brand', brand)
      .not('shaft_specs', 'is', null);

    if (error) {
      console.error('[solutions/shafts] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch shaft options' }, { status: 500 });
    }

    // Extract unique shaft configurations
    const uniqueSpecs = new Map<string, ShaftSpec>();

    (records || []).forEach(record => {
      const specs = record.shaft_specs as ShaftSpec;
      if (specs?.shaft_size_mm && specs?.outer_diameter_mm) {
        const key = `${specs.shaft_size_mm}-${specs.outer_diameter_mm}`;
        if (!uniqueSpecs.has(key)) {
          uniqueSpecs.set(key, specs);
        }
      }
    });

    // Group by shaft size to detect when OD disambiguation is needed
    const byShaftSize = new Map<number, ShaftSpec[]>();
    uniqueSpecs.forEach(spec => {
      const existing = byShaftSize.get(spec.shaft_size_mm) || [];
      existing.push(spec);
      byShaftSize.set(spec.shaft_size_mm, existing);
    });

    // Build response with smart display labels
    const shafts = Array.from(uniqueSpecs.values())
      .map(spec => {
        const sameShaftSpecs = byShaftSize.get(spec.shaft_size_mm) || [];
        const needsOdDisambiguation = sameShaftSpecs.length > 1;

        // Display label: "35mm" or "20mm (36mm OD)" if ambiguous
        const displayLabel = needsOdDisambiguation
          ? `${spec.shaft_size_mm}mm (${spec.outer_diameter_mm}mm OD)`
          : `${spec.shaft_size_mm}mm`;

        return {
          key: `${spec.shaft_size_mm}-${spec.outer_diameter_mm}`,
          display: displayLabel,
          shaft_size_mm: spec.shaft_size_mm,
          outer_diameter_mm: spec.outer_diameter_mm,
        };
      })
      .sort((a, b) => a.shaft_size_mm - b.shaft_size_mm);

    return NextResponse.json({
      brand,
      shafts
    });

  } catch (err) {
    console.error('[solutions/shafts] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
