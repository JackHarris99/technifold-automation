/**
 * GET /api/compatibility
 * Returns all compatible Technifold products for a machine based on brand + shaft_specs
 *
 * Query params:
 *   - brand: Machine brand (e.g., "MBO", "Heidelberg/Stahl")
 *   - shaft_size_mm: Shaft size in mm (e.g., 30, 35)
 *   - outer_diameter_mm: Outer diameter in mm (e.g., 50, 58)
 *
 * Returns products grouped by solution type with hierarchy ranking
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

interface CompatibilityRecord {
  product_code: string;
  brand: string;
  shaft_specs: {
    shaft_size_mm?: number;
    outer_diameter_mm?: number;
    outer_diameter_male_mm?: number;
    outer_diameter_female_mm?: number;
    top?: { shaft_size_mm: number; outer_diameter_mm: number };
    bottom?: { shaft_size_mm: number; outer_diameter_mm: number };
  };
}

interface Product {
  product_code: string;
  description: string;
  image_url?: string;
  category?: string;
  active: boolean;
}

// Product code prefixes to solution mapping
const SOLUTION_MAP: Record<string, { solution: string; variant?: string; rank: number }> = {
  // Tri-Creaser variants (folders)
  'TRI-ADV': { solution: 'Tri-Creaser', variant: 'Advance', rank: 1 },
  'FF-': { solution: 'Tri-Creaser', variant: 'Fast-Fit', rank: 2 },
  'EF-': { solution: 'Tri-Creaser', variant: 'Easy-Fit', rank: 3 },
  'TC-DEL': { solution: 'Tri-Creaser', variant: 'Deluxe', rank: 4 },

  // Quad-Creaser (binders)
  'QC-ADJ': { solution: 'Quad-Creaser', variant: 'Fully Adjustable', rank: 1 },
  'QC-DEL': { solution: 'Quad-Creaser', variant: 'Standard', rank: 2 },
  'QC-': { solution: 'Quad-Creaser', variant: 'Standard', rank: 2 },

  // Spine-Creaser (stitchers)
  'SC-': { solution: 'Spine-Creaser', rank: 1 },

  // Spine & Hinge Creaser (folders - offline)
  'SHC-': { solution: 'Spine & Hinge Creaser', rank: 1 },

  // Micro-Perforator
  'PD-DEL': { solution: 'Micro-Perforator', variant: 'Deluxe', rank: 1 },
  'PD-': { solution: 'Micro-Perforator', rank: 1 },

  // CP Applicator
  'CP-AP': { solution: 'CP Applicator', rank: 1 },

  // Multi-Tool
  'MT-': { solution: 'Multi-Tool', rank: 1 },

  // Gripper Boss
  'GB-': { solution: 'Gripper Boss', rank: 1 },

  // Cover Creaser (older terminology)
  'CC-': { solution: 'Cover Creaser', rank: 1 },
};

function classifyProduct(productCode: string): { solution: string; variant?: string; rank: number } | null {
  // Check prefixes in order of specificity (longer prefixes first)
  const sortedPrefixes = Object.keys(SOLUTION_MAP).sort((a, b) => b.length - a.length);

  for (const prefix of sortedPrefixes) {
    if (productCode.startsWith(prefix)) {
      return SOLUTION_MAP[prefix];
    }
  }

  return null;
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const brand = searchParams.get('brand');
    const shaftSizeMm = searchParams.get('shaft_size_mm');
    const outerDiameterMm = searchParams.get('outer_diameter_mm');

    if (!brand) {
      return NextResponse.json({ error: 'brand parameter required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Fetch all compatibility records for this brand
    const { data: compatRecords, error: compatError } = await supabase
      .from('tool_brand_compatibility')
      .select('product_code, brand, shaft_specs')
      .eq('brand', brand);

    if (compatError) {
      console.error('[compatibility] Error fetching compatibility:', compatError);
      return NextResponse.json({ error: 'Failed to fetch compatibility data' }, { status: 500 });
    }

    if (!compatRecords || compatRecords.length === 0) {
      return NextResponse.json({
        brand,
        products: [],
        solutions: {},
        message: 'No compatible products found for this brand'
      });
    }

    // Filter by shaft specs if provided
    let filteredRecords = compatRecords as CompatibilityRecord[];

    if (shaftSizeMm && outerDiameterMm) {
      const targetShaft = parseFloat(shaftSizeMm);
      const targetOD = parseFloat(outerDiameterMm);

      filteredRecords = compatRecords.filter((record: CompatibilityRecord) => {
        const specs = record.shaft_specs;
        if (!specs) return false;

        // Simple case
        if (specs.shaft_size_mm && specs.outer_diameter_mm) {
          return specs.shaft_size_mm === targetShaft && specs.outer_diameter_mm === targetOD;
        }

        // Male/female OD case - check if either matches
        if (specs.shaft_size_mm && (specs.outer_diameter_male_mm || specs.outer_diameter_female_mm)) {
          const shaftMatch = specs.shaft_size_mm === targetShaft;
          const odMatch = specs.outer_diameter_male_mm === targetOD || specs.outer_diameter_female_mm === targetOD;
          return shaftMatch && odMatch;
        }

        return false;
      });
    }

    // Get product details for matched product codes
    const productCodes = filteredRecords.map(r => r.product_code);

    const { data: products, error: productError } = await supabase
      .from('products')
      .select('product_code, description, image_url, category, active')
      .in('product_code', productCodes)
      .eq('active', true);

    if (productError) {
      console.error('[compatibility] Error fetching products:', productError);
      return NextResponse.json({ error: 'Failed to fetch product data' }, { status: 500 });
    }

    // Create product map
    const productMap = new Map<string, Product>();
    (products || []).forEach(p => productMap.set(p.product_code, p));

    // Group products by solution and apply hierarchy
    const solutionGroups: Record<string, {
      solution: string;
      bestVariant?: string;
      bestRank: number;
      products: Array<{
        product_code: string;
        variant?: string;
        rank: number;
        description: string;
        image_url?: string;
        shaft_specs: any;
      }>;
    }> = {};

    filteredRecords.forEach(record => {
      const product = productMap.get(record.product_code);
      if (!product) return;

      const classification = classifyProduct(record.product_code);
      if (!classification) return;

      const { solution, variant, rank } = classification;

      if (!solutionGroups[solution]) {
        solutionGroups[solution] = {
          solution,
          bestVariant: variant,
          bestRank: rank,
          products: []
        };
      }

      // Track best variant (lowest rank = best)
      if (rank < solutionGroups[solution].bestRank) {
        solutionGroups[solution].bestRank = rank;
        solutionGroups[solution].bestVariant = variant;
      }

      solutionGroups[solution].products.push({
        product_code: record.product_code,
        variant,
        rank,
        description: product.description,
        image_url: product.image_url,
        shaft_specs: record.shaft_specs
      });
    });

    // Sort products within each solution by rank
    Object.values(solutionGroups).forEach(group => {
      group.products.sort((a, b) => a.rank - b.rank);
    });

    // Get best product per solution (for the narrative)
    const bestProducts = Object.values(solutionGroups).map(group => ({
      solution: group.solution,
      variant: group.bestVariant,
      product_code: group.products[0]?.product_code,
      description: group.products[0]?.description,
      all_variants_count: group.products.length
    }));

    return NextResponse.json({
      brand,
      shaft_specs: shaftSizeMm && outerDiameterMm ? {
        shaft_size_mm: parseFloat(shaftSizeMm),
        outer_diameter_mm: parseFloat(outerDiameterMm)
      } : null,
      total_compatible_products: filteredRecords.length,
      solutions: solutionGroups,
      best_products: bestProducts
    });

  } catch (err) {
    console.error('[compatibility] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
