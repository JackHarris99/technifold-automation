/**
 * Solution Page - New Architecture
 * /solutions/[brand]/[model] - Shows all compatible Technifold solutions
 *
 * Handles two paths:
 * 1. Real machine: /solutions/MBO/K%2066 - looks up machine, gets shaft_specs
 * 2. Shaft size: /solutions/MBO/35mm - parses shaft size directly from URL
 *
 * This page:
 * 1. Determines shaft_specs (from machine or URL)
 * 2. Queries tool_brand_compatibility for matching products
 * 3. Groups by solution type
 * 4. Renders persuasive narrative based on available solution types
 */

import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import SolutionPageClient from '@/components/solutions/SolutionPageClient';

// Import solution content
import testimonials from '../../../../../content/testimonials/testimonials-database.json';
import productHierarchy from '../../../../../content/data/product-hierarchy.json';

interface SolutionPageProps {
  params: Promise<{
    brand: string;
    model: string;
  }>;
}

// Parse shaft size from URL like "35mm" or "20mm (36mm OD)"
function parseShaftFromUrl(modelStr: string): { shaft_size_mm: number; outer_diameter_mm: number } | null {
  // Pattern: "35mm" or "20mm (36mm OD)"
  const withOdMatch = modelStr.match(/^(\d+(?:\.\d+)?)mm\s*\((\d+(?:\.\d+)?)mm\s*OD\)$/i);
  if (withOdMatch) {
    return {
      shaft_size_mm: parseFloat(withOdMatch[1]),
      outer_diameter_mm: parseFloat(withOdMatch[2]),
    };
  }

  const simpleMatch = modelStr.match(/^(\d+(?:\.\d+)?)mm$/i);
  if (simpleMatch) {
    // Just shaft size - we'll need to look up the OD from compatibility data
    return {
      shaft_size_mm: parseFloat(simpleMatch[1]),
      outer_diameter_mm: 0, // Will be resolved later
    };
  }

  return null;
}

export default async function SolutionPage({ params }: SolutionPageProps) {
  const { brand: brandSlug, model: modelSlug } = await params;

  // Decode URL params
  const brandDecoded = decodeURIComponent(brandSlug);
  const modelDecoded = decodeURIComponent(modelSlug);

  const supabase = getSupabaseClient();

  // Determine if this is a shaft-size URL or a real machine model
  const parsedShaft = parseShaftFromUrl(modelDecoded);
  const isShaftPath = parsedShaft !== null;

  let machineName = `${brandDecoded} ${modelDecoded}`;
  let shaftSizeMm: number | null = null;
  let outerDiameterMm: number | null = null;
  let isFallbackMode = false;

  if (isShaftPath) {
    // Shaft size path - query compatibility directly
    shaftSizeMm = parsedShaft.shaft_size_mm;

    if (parsedShaft.outer_diameter_mm > 0) {
      // OD was in URL (disambiguation case)
      outerDiameterMm = parsedShaft.outer_diameter_mm;
    } else {
      // Need to look up OD from compatibility data
      const { data: sampleRecord } = await supabase
        .from('tool_brand_compatibility')
        .select('shaft_specs')
        .eq('brand', brandDecoded)
        .not('shaft_specs', 'is', null)
        .limit(100);

      // Find matching shaft size and get its OD
      const matchingSpec = (sampleRecord || []).find(r =>
        r.shaft_specs?.shaft_size_mm === shaftSizeMm
      );

      if (matchingSpec) {
        outerDiameterMm = matchingSpec.shaft_specs.outer_diameter_mm;
      }
    }

    machineName = `${brandDecoded} ${shaftSizeMm}mm`;

  } else {
    // Real machine path - look up from machines table
    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('*')
      .ilike('brand', brandDecoded)
      .ilike('model', modelDecoded)
      .single();

    if (machineError || !machine) {
      console.error('[solutions] Machine not found:', brandDecoded, modelDecoded, machineError);
      notFound();
    }

    machineName = machine.display_name || `${machine.brand} ${machine.model}`;

    if (machine.shaft_specs) {
      shaftSizeMm = machine.shaft_specs.shaft_size_mm;
      outerDiameterMm = machine.shaft_specs.outer_diameter_mm;
    } else {
      // Machine exists but no shaft specs - fallback mode
      isFallbackMode = true;
    }
  }

  // Query compatible products from tool_brand_compatibility
  const { data: compatRecords, error: compatError } = await supabase
    .from('tool_brand_compatibility')
    .select('product_code, brand, shaft_specs')
    .eq('brand', brandDecoded);

  if (compatError) {
    console.error('[solutions] Compatibility error:', compatError);
  }

  // Filter by matching shaft specs (or return all for fallback mode)
  const matchingRecords = isFallbackMode
    ? (compatRecords || []) // Fallback: show all products for this brand
    : (compatRecords || []).filter(record => {
        const specs = record.shaft_specs;
        if (!specs) return false;

        // Match shaft size and OD
        if (specs.shaft_size_mm === shaftSizeMm && specs.outer_diameter_mm === outerDiameterMm) {
          return true;
        }

        // Also check male/female OD variants
        if (specs.shaft_size_mm === shaftSizeMm) {
          if (specs.outer_diameter_male_mm === outerDiameterMm || specs.outer_diameter_female_mm === outerDiameterMm) {
            return true;
          }
        }

        return false;
      });

  // Get product details
  const productCodes = matchingRecords.map(r => r.product_code);

  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, image_url, category')
    .in('product_code', productCodes.length > 0 ? productCodes : ['__none__'])
    .eq('active', true);

  // Get consumables for these products via tool_consumable_map
  const { data: consumableLinks } = await supabase
    .from('tool_consumable_map')
    .select('tool_code, consumable_code')
    .in('tool_code', productCodes.length > 0 ? productCodes : ['__none__']);

  const consumableCodes = [...new Set((consumableLinks || []).map(l => l.consumable_code))];

  const { data: consumables } = await supabase
    .from('products')
    .select('product_code, description, image_url, category')
    .in('product_code', consumableCodes.length > 0 ? consumableCodes : ['__none__'])
    .eq('active', true);

  // Fetch brand media
  const brandMediaSlug = brandDecoded?.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');
  const { data: brandMedia } = await supabase
    .from('brand_media')
    .select('logo_url, hero_url')
    .eq('brand_slug', brandMediaSlug)
    .single();

  // Filter testimonials for folders (most common)
  const relevantTestimonials = testimonials.testimonials.filter(t =>
    t.tags?.includes('folders')
  );

  // Build a virtual machine object for the client component
  const machineData = {
    machine_id: isShaftPath ? `shaft-${brandDecoded}-${shaftSizeMm}` : 'real-machine',
    brand: brandDecoded,
    model: modelDecoded,
    display_name: machineName,
    type: 'folding_machine',
    shaft_specs: shaftSizeMm && outerDiameterMm ? {
      shaft_size_mm: shaftSizeMm,
      outer_diameter_mm: outerDiameterMm,
    } : null,
  };

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero Section */}
      <div
        className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-20"
        style={brandMedia?.hero_url ? {
          backgroundImage: `linear-gradient(to bottom right, rgba(37, 99, 235, 0.9), rgba(79, 70, 229, 0.9)), url(${brandMedia.hero_url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <a href="/" className="text-blue-200 hover:text-white transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <span className="text-blue-200 text-sm">Back to machine finder</span>
          </div>

          <div className="flex items-center gap-8 mb-6">
            {brandMedia?.logo_url && (
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <img
                  src={brandMedia.logo_url}
                  alt={brandDecoded}
                  className="h-16 w-auto object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                {isFallbackMode
                  ? `Technifold Solutions for ${machineName}`
                  : `Complete Technifold Solutions for Your ${machineName}`
                }
              </h1>
              <p className="text-xl text-blue-100">
                {isFallbackMode
                  ? `${matchingRecords.length} likely compatible products - request a quote to confirm exact fit`
                  : `${matchingRecords.length} compatible products to transform your finishing capability`
                }
              </p>
            </div>
          </div>

          {/* Shaft specs badge - only show when we have exact specs */}
          {!isFallbackMode && shaftSizeMm && (
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <span>Shaft: {shaftSizeMm}mm</span>
            </div>
          )}

          {/* Fallback mode banner */}
          {isFallbackMode && (
            <div className="inline-flex items-center gap-2 bg-yellow-500/30 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Compatibility will be confirmed when you request a quote</span>
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <SolutionPageClient
          machine={machineData}
          products={products || []}
          compatibilityRecords={matchingRecords}
          consumables={consumables || []}
          consumableLinks={consumableLinks || []}
          testimonials={relevantTestimonials}
          productHierarchy={productHierarchy}
          isFallbackMode={isFallbackMode}
        />
      </main>

      <MarketingFooter />
    </div>
  );
}
