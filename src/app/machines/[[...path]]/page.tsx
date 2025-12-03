/**
 * Unified Machine Routes Handler
 *
 * All pages use the same marketing template with personalized copy:
 * - /machines                     → Machine finder/index page
 * - /machines/folder              → Fallback: "your folding machine"
 * - /machines/folder/mbo          → Fallback: "your MBO folding machine"
 * - /machines/brand/mbo           → Fallback: "your MBO machine" (brand-only)
 * - /machines/mbo-k-55            → Specific: "your MBO K 55"
 */

import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase-server';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import MachinePageClient from './MachinePageClient';
import MachineFinder from '@/components/machines/MachineFinder';

// Valid machine types
const TYPE_MAP: Record<string, string> = {
  'folder': 'folder',
  'folding-machine': 'folder',
  'perfect-binder': 'perfect_binder',
  'saddle-stitcher': 'saddle_stitcher',
  'booklet-maker': 'booklet_maker',
  'cover-feeder': 'cover_feeder',
};

const TYPE_DISPLAY: Record<string, string> = {
  'folder': 'Folding Machines',
  'perfect_binder': 'Perfect Binders',
  'saddle_stitcher': 'Saddle Stitchers',
  'booklet_maker': 'Booklet Makers',
  'cover_feeder': 'Cover Feeders',
};

const TYPE_DISPLAY_SINGULAR: Record<string, string> = {
  'folder': 'folding machine',
  'perfect_binder': 'perfect binder',
  'saddle_stitcher': 'saddle stitcher',
  'booklet_maker': 'booklet maker',
  'cover_feeder': 'cover feeder',
};

function normalizeBrandSlug(brand: string): string {
  return brand.toLowerCase()
    .replace(/ü/g, 'u').replace(/ö/g, 'o').replace(/ä/g, 'a').replace(/ß/g, 'ss')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

type RouteType = 'index' | 'type' | 'type-brand' | 'brand' | 'model';

function parseRoute(path: string[] | undefined): { type: RouteType; typeSlug?: string; brandSlug?: string; machineSlug?: string } {
  if (!path || path.length === 0) {
    return { type: 'index' };
  }

  const firstSegment = path[0];

  // Check for brand-only route: /machines/brand/[slug]
  if (firstSegment === 'brand' && path.length === 2) {
    return { type: 'brand', brandSlug: path[1] };
  }

  // Check if first segment is a type
  if (TYPE_MAP[firstSegment]) {
    if (path.length === 1) {
      return { type: 'type', typeSlug: firstSegment };
    }
    if (path.length === 2) {
      return { type: 'type-brand', typeSlug: firstSegment, brandSlug: path[1] };
    }
    // More than 2 segments with type prefix - not valid
    return { type: 'model', machineSlug: path.join('-') };
  }

  // Not a type - treat as machine slug
  return { type: 'model', machineSlug: path.join('-') };
}

export async function generateMetadata({ params }: { params: Promise<{ path?: string[] }> }): Promise<Metadata> {
  const { path } = await params;
  const route = parseRoute(path);

  if (route.type === 'index') {
    return {
      title: 'Find Your Machine | Technifold',
      description: 'Find creasing solutions for your print finishing machine. Folders, perfect binders, saddle stitchers, and more.',
    };
  }

  if (route.type === 'type' && route.typeSlug) {
    const dbType = TYPE_MAP[route.typeSlug];
    const displayName = TYPE_DISPLAY[dbType];
    return {
      title: `Creasing Solutions for ${displayName} | Technifold`,
      description: `Eliminate fiber cracking on your ${displayName.toLowerCase()}. From £69/month. 30-day free trial.`,
    };
  }

  if (route.type === 'type-brand' && route.typeSlug && route.brandSlug) {
    const dbType = TYPE_MAP[route.typeSlug];
    const typeName = TYPE_DISPLAY_SINGULAR[dbType];
    const brandName = route.brandSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      title: `Creasing Solutions for ${brandName} ${typeName}s | Technifold`,
      description: `Eliminate fiber cracking on your ${brandName} ${typeName}. From £69/month. 30-day free trial.`,
    };
  }

  // Brand-only - /machines/brand/mbo
  if (route.type === 'brand' && route.brandSlug) {
    const brandName = route.brandSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    return {
      title: `Creasing Solutions for ${brandName} Machines | Technifold`,
      description: `Eliminate fiber cracking on your ${brandName} equipment. From £69/month. 30-day free trial.`,
    };
  }

  // Model - look up in database
  const supabase = createServerClient();
  const { data: machine } = await supabase
    .from('machines')
    .select('brand, model, type')
    .eq('slug', route.machineSlug)
    .single();

  if (!machine) {
    return { title: 'Machine Not Found | Technifold' };
  }

  return {
    title: `Creasing Solutions for ${machine.brand} ${machine.model} | Technifold`,
    description: `Eliminate fiber cracking on your ${machine.brand} ${machine.model}. From £69/month. 30-day free trial.`,
  };
}

export default async function MachinesPage({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params;
  const route = parseRoute(path);
  const supabase = createServerClient();

  // INDEX PAGE - /machines
  if (route.type === 'index') {
    return <MachinesIndexPage />;
  }

  // TYPE PAGE - /machines/folder (fallback with generic copy)
  if (route.type === 'type' && route.typeSlug) {
    const dbType = TYPE_MAP[route.typeSlug];
    const typeName = TYPE_DISPLAY_SINGULAR[dbType];
    const typeNameCapitalized = typeName.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    // Create a "virtual" machine for the template
    const virtualMachine = {
      machine_id: 'type-fallback',
      brand: '',
      model: typeNameCapitalized,
      display_name: `Your ${typeNameCapitalized}`,
      type: dbType,
      slug: route.typeSlug,
    };

    const normalizedType = normalizeMachineType(dbType);
    const basePricing = getMachinePricing(normalizedType);

    const personalization = {
      brand: '',
      model: typeNameCapitalized,
      machine_type: typeName,
      monthly_price: basePricing.display,
      typical_range: basePricing.typicalRange,
    };

    const pageTemplate = getDefaultTemplate(normalizedType);
    const renderedCopy = replacePlaceholders(pageTemplate.copy_sections, personalization);

    return (
      <MachinePageClient
        machine={virtualMachine}
        renderedCopy={renderedCopy}
        basePricing={basePricing}
        personalization={personalization}
      />
    );
  }

  // TYPE+BRAND PAGE - /machines/folder/mbo (fallback with brand in copy)
  if (route.type === 'type-brand' && route.typeSlug && route.brandSlug) {
    const dbType = TYPE_MAP[route.typeSlug];
    const typeName = TYPE_DISPLAY_SINGULAR[dbType];

    // Look up the actual brand name from a machine
    const { data: sampleMachine } = await supabase
      .from('machines')
      .select('brand')
      .eq('type', dbType)
      .limit(100);

    const matchingBrand = sampleMachine?.find(m => normalizeBrandSlug(m.brand) === route.brandSlug);
    const brandName = matchingBrand?.brand || route.brandSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (!matchingBrand) {
      notFound();
    }

    // Create a "virtual" machine for the template
    const virtualMachine = {
      machine_id: 'type-brand-fallback',
      brand: brandName,
      model: typeName,
      display_name: `${brandName} ${typeName}`,
      type: dbType,
      slug: `${route.typeSlug}/${route.brandSlug}`,
    };

    const normalizedType = normalizeMachineType(dbType);
    const basePricing = getMachinePricing(normalizedType);

    const personalization = {
      brand: `${brandName} `,
      model: typeName,
      machine_type: typeName,
      monthly_price: basePricing.display,
      typical_range: basePricing.typicalRange,
    };

    const pageTemplate = getDefaultTemplate(normalizedType);
    const renderedCopy = replacePlaceholders(pageTemplate.copy_sections, personalization);

    return (
      <MachinePageClient
        machine={virtualMachine}
        renderedCopy={renderedCopy}
        basePricing={basePricing}
        personalization={personalization}
      />
    );
  }

  // BRAND-ONLY PAGE - /machines/brand/mbo (fallback with brand, no type)
  if (route.type === 'brand' && route.brandSlug) {
    // Look up the actual brand name from any machine with this brand
    const { data: sampleMachine } = await supabase
      .from('machines')
      .select('brand, type')
      .limit(500);

    const matchingBrand = sampleMachine?.find(m => normalizeBrandSlug(m.brand) === route.brandSlug);
    const brandName = matchingBrand?.brand || route.brandSlug.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

    if (!matchingBrand) {
      notFound();
    }

    // Create a "virtual" machine for the template
    const virtualMachine = {
      machine_id: 'brand-fallback',
      brand: brandName,
      model: 'Machine',
      display_name: `${brandName} Machine`,
      type: matchingBrand.type || 'folder', // Use first matching type for pricing
      slug: `brand/${route.brandSlug}`,
    };

    // Use the first type found for this brand for pricing
    const normalizedType = normalizeMachineType(matchingBrand.type || 'folder');
    const basePricing = getMachinePricing(normalizedType);

    const personalization = {
      brand: `${brandName} `,
      model: 'Machine',
      machine_type: 'machine',
      monthly_price: basePricing.display,
      typical_range: basePricing.typicalRange,
    };

    const pageTemplate = getDefaultTemplate(normalizedType);
    const renderedCopy = replacePlaceholders(pageTemplate.copy_sections, personalization);

    return (
      <MachinePageClient
        machine={virtualMachine}
        renderedCopy={renderedCopy}
        basePricing={basePricing}
        personalization={personalization}
      />
    );
  }

  // MODEL PAGE - /machines/mbo-k-55 (specific machine)
  if (route.type === 'model' && route.machineSlug) {
    const { data: machine } = await supabase
      .from('machines')
      .select('*')
      .eq('slug', route.machineSlug)
      .single();

    if (!machine) {
      notFound();
    }

    return <ModelPage machine={machine} />;
  }

  notFound();
}

// ============================================
// INDEX PAGE COMPONENT
// ============================================
function MachinesIndexPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <section className="bg-slate-900 text-white py-16 border-b-4 border-orange-500">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Machine</h1>
              <p className="text-xl text-gray-300 mb-6">
                Select your machine to see compatible finishing solutions. Works with 170+ folder, binder, and stitcher models.
              </p>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white/10 border border-white/20 px-3 py-2 rounded">
                  <div className="text-xl font-bold">170+</div>
                  <div className="text-xs text-gray-400">Machines</div>
                </div>
                <div className="bg-white/10 border border-white/20 px-3 py-2 rounded">
                  <div className="text-xl font-bold">15+</div>
                  <div className="text-xs text-gray-400">Brands</div>
                </div>
                <div className="bg-white/10 border border-white/20 px-3 py-2 rounded">
                  <div className="text-xl font-bold">30-day</div>
                  <div className="text-xs text-gray-400">Free Trial</div>
                </div>
              </div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-lg p-6">
              <MachineFinder />
            </div>
          </div>
        </div>
      </section>
      <MarketingFooter />
    </div>
  );
}

// ============================================
// MODEL PAGE COMPONENT
// ============================================
async function ModelPage({ machine }: { machine: any }) {
  const normalizedType = normalizeMachineType(machine.type);
  const basePricing = getMachinePricing(normalizedType);

  const personalization = {
    brand: machine.brand ? `${machine.brand} ` : '',
    model: machine.model || 'machine',
    machine_type: getMachineTypeName(normalizedType),
    monthly_price: basePricing.display,
    typical_range: basePricing.typicalRange,
  };

  const pageTemplate = getDefaultTemplate(normalizedType);
  const renderedCopy = replacePlaceholders(pageTemplate.copy_sections, personalization);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: `Technifold Finishing System - ${machine.brand} ${machine.model}`,
            description: renderedCopy.hero_subheading,
            brand: { '@type': 'Brand', name: 'Technifold' },
            offers: {
              '@type': 'Offer',
              price: basePricing.amount,
              priceCurrency: 'GBP',
              availability: 'https://schema.org/InStock',
            },
          }),
        }}
      />
      <MachinePageClient
        machine={machine}
        renderedCopy={renderedCopy}
        basePricing={basePricing}
        personalization={personalization}
      />
    </>
  );
}

// ============================================
// HELPER FUNCTIONS
// ============================================
function normalizeMachineType(type: string): string {
  const typeMap: Record<string, string> = {
    'folding_machine': 'folding-machines',
    'folder': 'folding-machines',
    'perfect_binder': 'perfect-binders',
    'saddle_stitcher': 'saddle-stitchers',
    'booklet_maker': 'booklet-makers',
    'cover_feeder': 'cover-feeders',
  };
  return typeMap[type] || type;
}

function getMachinePricing(type: string) {
  const pricing: Record<string, { amount: number; display: string; typicalRange: string }> = {
    'folding-machines': { amount: 99, display: '£99', typicalRange: '£139-£159' },
    'saddle-stitchers': { amount: 69, display: '£69', typicalRange: '£89-£119' },
    'perfect-binders': { amount: 89, display: '£89', typicalRange: '£119-£149' },
    'booklet-makers': { amount: 69, display: '£69', typicalRange: '£89-£119' },
    'cover-feeders': { amount: 79, display: '£79', typicalRange: '£99-£129' },
  };
  return pricing[type] || pricing['folding-machines'];
}

function getMachineTypeName(type: string): string {
  const names: Record<string, string> = {
    'folding-machines': 'folding machine',
    'saddle-stitchers': 'saddle stitcher',
    'perfect-binders': 'perfect binder',
    'booklet-makers': 'booklet maker',
    'cover-feeders': 'cover feeder',
  };
  return names[type] || type.replace(/-/g, ' ');
}

function replacePlaceholders(template: any, data: Record<string, string>): any {
  const jsonString = JSON.stringify(template);
  let replaced = jsonString;
  for (const [key, value] of Object.entries(data)) {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    replaced = replaced.replace(regex, value);
  }
  return JSON.parse(replaced);
}

function getDefaultTemplate(machineType: string) {
  return {
    template_key: 'default',
    machine_type: machineType,
    copy_sections: {
      hero_headline: 'Transform Finishing Quality On Your {brand}{model}',
      hero_subheading: 'Professional inline finishing solutions. From {monthly_price}/month.',
      problem_section_title: 'The Problems You Face',
      problems: [
        { icon: '⚠️', title: 'Quality Issues', description: 'Fiber cracking, poor folds, and inconsistent results.' },
        { icon: '⏱️', title: 'Slow Production', description: 'Manual finishing creates bottlenecks.' },
        { icon: '💸', title: 'High Costs', description: 'Rejects and rework eat into your profits.' },
      ],
      solution_section_title: 'How We Solve This',
      solution_subheading: 'Professional finishing capability for your {machine_type}.',
      solution_features: [
        { title: 'Inline Finishing', description: 'Crease, perforate, and cut in one pass' },
        { title: 'Perfect Quality', description: 'Eliminate fiber cracking and quality issues' },
        { title: 'Faster Production', description: 'Run 30-50% faster with inline capability' },
      ],
      value_props: [
        { icon: '💰', title: 'Save Money', description: 'Reduce rejects and rework' },
        { icon: '⚡', title: 'Increase Speed', description: 'Eliminate bottlenecks' },
      ],
      cta_primary: 'Request Free Trial',
      cta_secondary: 'Learn More',
      pricing_title: 'Simple Pricing',
      pricing_subheading: 'From {monthly_price}/month',
    },
  };
}
