/**
 * GET /api/solutions/shafts
 * Returns available shaft size options for a brand
 * Queries NEW schema: brand_shaft_configurations + shaft_configurations
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

interface ShaftConfig {
  id: number;
  config_data: {
    shaft_size_mm?: number;
    outer_diameter_mm?: number;
    top?: { shaft_size_mm: number; outer_diameter_mm: number };
    bottom?: { shaft_size_mm: number; outer_diameter_mm: number };
    outer_diameter_male_mm?: number;
    outer_diameter_female_mm?: number;
  };
  display_name: string;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get('brand');

    if (!brand) {
      return NextResponse.json({ error: 'brand parameter required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get shaft configurations for this brand (NEW SCHEMA)
    const { data: brandConfigs, error } = await supabase
      .from('brand_shaft_configurations')
      .select(`
        shaft_config_id,
        shaft_configurations (
          id,
          config_data,
          display_name
        )
      `)
      .eq('brand', brand);

    if (error) {
      console.error('[solutions/shafts] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch shaft options' }, { status: 500 });
    }

    if (!brandConfigs || brandConfigs.length === 0) {
      return NextResponse.json({
        brand,
        shafts: []
      });
    }

    // Extract shaft configs (handle join structure)
    const shaftConfigs = brandConfigs
      .map(bc => bc.shaft_configurations)
      .filter(Boolean) as unknown as ShaftConfig[];

    // Extract simple shaft specs for grouping
    const simplifiedSpecs = shaftConfigs.map(config => {
      const data = config.config_data;

      // Handle simple case
      if (data.shaft_size_mm && data.outer_diameter_mm) {
        return {
          id: config.id,
          shaft_size_mm: data.shaft_size_mm,
          outer_diameter_mm: data.outer_diameter_mm,
          display_name: config.display_name
        };
      }

      // Handle top/bottom (use top for grouping)
      if (data.top) {
        return {
          id: config.id,
          shaft_size_mm: data.top.shaft_size_mm,
          outer_diameter_mm: data.top.outer_diameter_mm,
          display_name: config.display_name
        };
      }

      // Handle male/female (use average or display as-is)
      if (data.outer_diameter_male_mm || data.outer_diameter_female_mm) {
        return {
          id: config.id,
          shaft_size_mm: data.shaft_size_mm || 0,
          outer_diameter_mm: data.outer_diameter_male_mm || data.outer_diameter_female_mm || 0,
          display_name: config.display_name
        };
      }

      return null;
    }).filter(Boolean);

    // Group by shaft size to detect when OD disambiguation is needed
    const byShaftSize = new Map<number, typeof simplifiedSpecs>();
    simplifiedSpecs.forEach(spec => {
      if (!spec) return;
      const existing = byShaftSize.get(spec.shaft_size_mm) || [];
      existing.push(spec);
      byShaftSize.set(spec.shaft_size_mm, existing);
    });

    // Build response with smart display labels
    const shafts = simplifiedSpecs
      .filter(Boolean)
      .map(spec => {
        if (!spec) return null;

        const sameShaftSpecs = byShaftSize.get(spec.shaft_size_mm) || [];
        const needsOdDisambiguation = sameShaftSpecs.length > 1;

        // Display label: "35mm" or "20mm (36mm OD)" if ambiguous
        // Use provided display_name if complex, otherwise generate
        const displayLabel = needsOdDisambiguation
          ? `${spec.shaft_size_mm}mm (${spec.outer_diameter_mm}mm OD)`
          : `${spec.shaft_size_mm}mm`;

        return {
          key: `${spec.shaft_size_mm}-${spec.outer_diameter_mm}`,
          display: displayLabel,
          shaft_size_mm: spec.shaft_size_mm,
          outer_diameter_mm: spec.outer_diameter_mm,
          shaft_config_id: spec.id
        };
      })
      .filter(Boolean)
      .sort((a, b) => (a?.shaft_size_mm || 0) - (b?.shaft_size_mm || 0));

    return NextResponse.json({
      brand,
      shafts
    });

  } catch (err) {
    console.error('[solutions/shafts] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
