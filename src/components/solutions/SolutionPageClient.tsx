'use client';

import { useState, useMemo } from 'react';

interface Machine {
  machine_id: string;
  brand: string;
  model: string;
  display_name?: string;
  type?: string;
  shaft_specs?: {
    shaft_size_mm: number;
    outer_diameter_mm: number;
  };
}

interface Product {
  product_code: string;
  description: string;
  image_url?: string;
  category?: string;
}

interface CompatibilityRecord {
  product_code: string;
  brand: string;
  shaft_specs: any;
}

interface ConsumableLink {
  tool_code: string;
  consumable_code: string;
}

interface Testimonial {
  id: string;
  customer: string;
  company: string;
  location?: string;
  quote: string;
  products?: string[];
  tags?: string[];
}

interface ProductHierarchy {
  hierarchies: {
    [key: string]: {
      displayName: string;
      variants: Array<{
        name: string;
        rank: number;
        usp?: string;
        keyFeature?: string;
      }>;
    };
  };
}

// Solution copy templates
const SOLUTION_COPY: Record<string, {
  headline: string;
  intro: string;
  benefits: string[];
  stats?: string[];
}> = {
  'Tri-Creaser': {
    headline: 'Eliminate Fibre Cracking Forever',
    intro: 'The Tri-Creaser is the world\'s first and only rotary creasing solution that matches letterpress quality. With over 40,000 installations worldwide, it\'s the proven choice for {brand} operators who demand crack-free folds on every job.',
    benefits: [
      'U-shaped crease profile penetrates 3x deeper without damage',
      'Colour-coded ribs for instant stock matching (Orange: 85-200gsm, Blue: 200-270gsm, Yellow: 250-350gsm)',
      'Change creasing ribs in seconds without removing from machine',
      '100% elimination of fibre cracking on digital and litho stocks',
    ],
    stats: ['40,000+ installations', 'ROI in 1-3 jobs', '£10,000-£30,000 annual savings'],
  },
  'Quad-Creaser': {
    headline: 'Perfect Cover Creasing for Your Binder',
    intro: 'Stop outsourcing cover creasing. The Quad-Creaser delivers four precision creases inline on your {brand} {model}, eliminating spine cracking on perfect bound covers.',
    benefits: [
      'Four simultaneous creases: two spine, two hinge',
      'Adjustable spine and hinge widths for any cover format',
      'Inline operation eliminates offline creasing bottleneck',
      'Colour-coded consumables for quick stock matching',
    ],
    stats: ['Eliminate offline creasing', 'Instant changeover', 'Premium cover quality'],
  },
  'Spine-Creaser': {
    headline: 'End Spine Cracking on Saddle-Stitched Work',
    intro: 'Your {brand} {model} deserves covers that don\'t crack. The Spine-Creaser pre-creases covers before stitching, ensuring they lay flat and look professional.',
    benefits: [
      'Single precision crease along spine',
      'Retrofit to existing cover feeder',
      'Handles heavy cover stocks without cracking',
      'Consistent results across entire run',
    ],
  },
  'Micro-Perforator': {
    headline: 'Add Inline Perforation Capability',
    intro: 'Transform your {brand} {model} with inline micro-perforation. Add tear-off sections, reply cards, and vouchers without additional handling.',
    benefits: [
      'Precise perforation at folder speeds',
      'Multiple perf patterns available',
      'Eliminates offline perforating',
      'Consistent tear quality across run',
    ],
  },
  'Multi-Tool': {
    headline: 'Modular Finishing in One Station',
    intro: 'The Multi-Tool brings cutting, perforating, and scoring to your {brand} {model} in a single modular system. Change functions in minutes, not hours.',
    benefits: [
      'Cut quality equal to guillotine',
      'Swap between cut, perf, and score',
      'Reduce guillotine dependency by up to 40%',
      'Perfect for short-run variable finishing',
    ],
  },
  'CP Applicator': {
    headline: 'Close Proximity Perf + Crease',
    intro: 'PATENTED technology that delivers perforations and creases as close as 5mm apart. The only solution for complex finishing patterns on your {brand} {model}.',
    benefits: [
      'Perf and crease within 5mm of each other',
      'Patented technology - no alternatives exist',
      'Inline operation at full folder speed',
      'Perfect for pharmaceutical and complex jobs',
    ],
  },
  'Gripper Boss': {
    headline: 'Replace Worn Gripper Wheels Fast',
    intro: 'Re-grip your {brand} {model} in seconds, not days. Gripper Boss replacement wheels restore gripping performance without machine downtime.',
    benefits: [
      'Install in seconds',
      'No machine disassembly required',
      'Restores original gripping force',
      'Fraction of OEM replacement cost',
    ],
  },
  'Spine & Hinge Creaser': {
    headline: 'Four-Crease Book Cover Preparation',
    intro: 'The Spine & Hinge Creaser delivers the same four-crease pattern as the Quad-Creaser, but designed for offline workflows and folder-based cover preparation.',
    benefits: [
      'Four precision creases for book covers',
      'Offline flexibility for any workflow',
      'Compatible with folder tooling shafts',
      'Same quality as inline binder solutions',
    ],
  },
};

// Map product codes to solution types
function classifyProductCode(code: string): string | null {
  if (code.startsWith('FF-') || code.startsWith('EF-') || code.startsWith('TC-DEL') || code.startsWith('TRI-')) {
    return 'Tri-Creaser';
  }
  if (code.startsWith('QC-')) {
    return 'Quad-Creaser';
  }
  if (code.startsWith('SC-')) {
    return 'Spine-Creaser';
  }
  if (code.startsWith('SHC-')) {
    return 'Spine & Hinge Creaser';
  }
  if (code.startsWith('PD-')) {
    return 'Micro-Perforator';
  }
  if (code.startsWith('MT-')) {
    return 'Multi-Tool';
  }
  if (code.startsWith('CP-AP')) {
    return 'CP Applicator';
  }
  if (code.startsWith('GB-')) {
    return 'Gripper Boss';
  }
  return null;
}

// Get variant rank from product code
function getVariantRank(code: string): number {
  if (code.startsWith('TRI-ADV') || code.includes('ADVANCE')) return 1;
  if (code.startsWith('FF-')) return 2;
  if (code.startsWith('EF-')) return 3;
  if (code.startsWith('TC-DEL')) return 4;
  if (code.startsWith('QC-ADJ')) return 1;
  if (code.startsWith('QC-')) return 2;
  return 5;
}

interface SolutionPageClientProps {
  machine: Machine;
  products: Product[];
  compatibilityRecords: CompatibilityRecord[];
  consumables: Product[];
  consumableLinks: ConsumableLink[];
  testimonials: Testimonial[];
  productHierarchy: ProductHierarchy;
  isFallbackMode?: boolean;
}

export default function SolutionPageClient({
  machine,
  products,
  compatibilityRecords,
  consumables,
  consumableLinks,
  testimonials,
  isFallbackMode = false,
}: SolutionPageClientProps) {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

  // Group products by solution type
  const solutionGroups = useMemo(() => {
    const groups: Record<string, {
      solution: string;
      products: Array<Product & { rank: number }>;
      bestProduct: Product | null;
    }> = {};

    const productMap = new Map(products.map(p => [p.product_code, p]));

    compatibilityRecords.forEach(record => {
      const product = productMap.get(record.product_code);
      if (!product) return;

      const solution = classifyProductCode(record.product_code);
      if (!solution) return;

      if (!groups[solution]) {
        groups[solution] = { solution, products: [], bestProduct: null };
      }

      const rank = getVariantRank(record.product_code);
      groups[solution].products.push({ ...product, rank });
    });

    // Sort by rank and set best product
    Object.values(groups).forEach(group => {
      group.products.sort((a, b) => a.rank - b.rank);
      group.bestProduct = group.products[0] || null;
    });

    return groups;
  }, [products, compatibilityRecords]);

  // Build consumable map for each tool
  const toolConsumables = useMemo(() => {
    const map: Record<string, Product[]> = {};
    const consumableMap = new Map(consumables.map(c => [c.product_code, c]));

    consumableLinks.forEach(link => {
      const consumable = consumableMap.get(link.consumable_code);
      if (consumable) {
        if (!map[link.tool_code]) {
          map[link.tool_code] = [];
        }
        map[link.tool_code].push(consumable);
      }
    });

    return map;
  }, [consumables, consumableLinks]);

  // Replace placeholders in copy
  const replacePlaceholders = (text: string) => {
    return text
      .replace(/\{brand\}/g, machine.brand)
      .replace(/\{model\}/g, machine.model)
      .replace(/\{display_name\}/g, machine.display_name || `${machine.brand} ${machine.model}`);
  };

  // Toggle product selection for quote
  const toggleProduct = (productCode: string) => {
    setSelectedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productCode)) {
        next.delete(productCode);
      } else {
        next.add(productCode);
      }
      return next;
    });
  };

  // Select all best products
  const selectAllBest = () => {
    const bestCodes = Object.values(solutionGroups)
      .map(g => g.bestProduct?.product_code)
      .filter((code): code is string => !!code);
    setSelectedProducts(new Set(bestCodes));
  };

  const solutionCount = Object.keys(solutionGroups).length;

  return (
    <div className="space-y-16">
      {/* Opening Narrative */}
      <section className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-8 md:p-12">
        <h2 className="text-3xl font-bold text-gray-900 mb-6">
          Transform Your {machine.brand} {machine.model} with {solutionCount} Technifold Solutions
        </h2>
        <p className="text-xl text-gray-700 leading-relaxed mb-6">
          Your {machine.brand} {machine.model} is capable of so much more. Right now, you're
          likely dealing with fibre cracking, offline finishing steps, and quality issues
          that cost you time, money, and rejected jobs.
        </p>
        <p className="text-xl text-gray-700 leading-relaxed mb-8">
          We've identified <strong>{solutionCount} Technifold solutions</strong> that fit your
          exact machine specifications ({machine.shaft_specs?.shaft_size_mm}mm shaft,{' '}
          {machine.shaft_specs?.outer_diameter_mm}mm OD). Together, they'll unlock
          inline finishing capability that transforms your productivity.
        </p>

        <button
          onClick={selectAllBest}
          className="inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Select All Recommended Solutions
        </button>
      </section>

      {/* Solution Cards */}
      {Object.values(solutionGroups).map(group => {
        const copy = SOLUTION_COPY[group.solution];
        if (!copy || !group.bestProduct) return null;

        const productConsumables = toolConsumables[group.bestProduct.product_code] || [];
        const isSelected = selectedProducts.has(group.bestProduct.product_code);

        // Find relevant testimonial
        const relevantTestimonial = testimonials.find(t =>
          t.products?.some(p => p.toLowerCase().includes(group.solution.toLowerCase().split(' ')[0]))
        );

        return (
          <section
            key={group.solution}
            className={`border-2 rounded-2xl overflow-hidden transition-all ${isSelected
              ? 'border-blue-500 shadow-xl bg-blue-50/30'
              : 'border-gray-200 hover:border-blue-300 bg-white'
              }`}
          >
            {/* Solution Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{group.solution}</h3>
                  <p className="text-blue-100">{replacePlaceholders(copy.headline)}</p>
                </div>
                <button
                  onClick={() => toggleProduct(group.bestProduct!.product_code)}
                  className={`px-6 py-3 rounded-xl font-bold transition-all ${isSelected
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                    }`}
                >
                  {isSelected ? '✓ Selected' : 'Add to Quote'}
                </button>
              </div>
            </div>

            <div className="p-8">
              {/* Intro Copy */}
              <p className="text-lg text-gray-700 leading-relaxed mb-8">
                {replacePlaceholders(copy.intro)}
              </p>

              {/* Benefits Grid */}
              <div className="grid md:grid-cols-2 gap-4 mb-8">
                {copy.benefits.map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3 bg-green-50 rounded-xl p-4">
                    <svg className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>

              {/* Stats Row */}
              {copy.stats && (
                <div className="flex flex-wrap gap-4 mb-8">
                  {copy.stats.map((stat, i) => (
                    <div key={i} className="bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold">
                      {stat}
                    </div>
                  ))}
                </div>
              )}

              {/* Product Info */}
              <div className="bg-gray-50 rounded-xl p-6 mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Recommended Product</p>
                    <p className="text-xl font-bold text-gray-900">{group.bestProduct.product_code}</p>
                    <p className="text-gray-600">{group.bestProduct.description}</p>
                  </div>
                  {group.bestProduct.image_url && (
                    <img
                      src={group.bestProduct.image_url}
                      alt={group.bestProduct.product_code}
                      className="w-24 h-24 object-contain"
                    />
                  )}
                </div>

                {/* Consumables */}
                {productConsumables.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-bold text-gray-700 mb-2">Compatible Consumables:</p>
                    <div className="flex flex-wrap gap-2">
                      {productConsumables.slice(0, 5).map(c => (
                        <span key={c.product_code} className="bg-white border border-gray-200 px-3 py-1 rounded text-sm">
                          {c.product_code}
                        </span>
                      ))}
                      {productConsumables.length > 5 && (
                        <span className="text-gray-500 text-sm">+{productConsumables.length - 5} more</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Testimonial */}
              {relevantTestimonial && (
                <div className="bg-yellow-50 border-l-4 border-yellow-400 rounded-r-xl p-6">
                  <blockquote className="text-lg text-gray-700 italic mb-3">
                    "{relevantTestimonial.quote}"
                  </blockquote>
                  <p className="text-sm text-gray-600">
                    — {relevantTestimonial.customer}, {relevantTestimonial.company}
                    {relevantTestimonial.location && `, ${relevantTestimonial.location}`}
                  </p>
                </div>
              )}
            </div>
          </section>
        );
      })}

      {/* CTA Section */}
      <section className={`rounded-2xl p-8 md:p-12 text-center ${
        isFallbackMode
          ? 'bg-gradient-to-br from-amber-500 to-orange-600 text-white'
          : 'bg-gradient-to-br from-green-600 to-emerald-700 text-white'
      }`}>
        <h2 className="text-3xl font-bold mb-4">
          {isFallbackMode
            ? `Interested in These Solutions for Your ${machine.brand} ${machine.model}?`
            : `Ready to Transform Your ${machine.brand} ${machine.model}?`
          }
        </h2>
        <p className={`text-xl mb-8 max-w-2xl mx-auto ${isFallbackMode ? 'text-amber-100' : 'text-green-100'}`}>
          {isFallbackMode
            ? `We'll confirm exact compatibility and provide a tailored quote for your specific machine configuration.`
            : selectedProducts.size > 0
              ? `You've selected ${selectedProducts.size} solution${selectedProducts.size > 1 ? 's' : ''}. Get your personalised quote now.`
              : `Select the solutions above, or let us recommend the complete capability package for your machine.`}
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={`/quote-builder?machine=${machine.machine_id}&products=${Array.from(selectedProducts).join(',')}&verify=${isFallbackMode ? '1' : '0'}`}
            className={`inline-flex items-center gap-3 px-8 py-4 rounded-xl font-bold text-lg transition-colors ${
              isFallbackMode
                ? 'bg-white text-amber-700 hover:bg-amber-50'
                : 'bg-white text-green-700 hover:bg-green-50'
            }`}
          >
            {isFallbackMode ? 'Request Compatibility Check & Quote' : 'Get Your Personalised Quote'}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          {!isFallbackMode && (
            <button
              onClick={selectAllBest}
              className="inline-flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-400 transition-colors"
            >
              Select Full Capability Package
            </button>
          )}
        </div>

        <p className={`mt-6 text-sm ${isFallbackMode ? 'text-amber-200' : 'text-green-200'}`}>
          {isFallbackMode
            ? 'Our team will verify compatibility with your exact machine specifications'
            : 'Purchase outright or rent from £X/month with all consumables included'}
        </p>
      </section>
    </div>
  );
}
