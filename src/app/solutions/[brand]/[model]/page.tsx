/**
 * Machine Solutions Page - B2B INDUSTRIAL DESIGN
 * Focus: Combined value proposition, transformation, ROI
 * NOT: Product SKU lists
 */

import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

interface SolutionPageProps {
  params: Promise<{
    brand: string;
    model: string;
  }>;
}

// Parse shaft size from URL like "35mm" or "20mm (36mm OD)"
function parseShaftFromUrl(modelStr: string): { shaft_size_mm: number; outer_diameter_mm: number } | null {
  const withOdMatch = modelStr.match(/^(\d+(?:\.\d+)?)mm\s*\((\d+(?:\.\d+)?)mm\s*OD\)$/i);
  if (withOdMatch) {
    return {
      shaft_size_mm: parseFloat(withOdMatch[1]),
      outer_diameter_mm: parseFloat(withOdMatch[2]),
    };
  }

  const simpleMatch = modelStr.match(/^(\d+(?:\.\d+)?)mm$/i);
  if (simpleMatch) {
    return {
      shaft_size_mm: parseFloat(simpleMatch[1]),
      outer_diameter_mm: 0,
    };
  }

  return null;
}

export default async function MachineSolutionPage({ params }: SolutionPageProps) {
  const { brand: brandSlug, model: modelSlug } = await params;
  const brandDecoded = decodeURIComponent(brandSlug);
  const modelDecoded = decodeURIComponent(modelSlug);
  const supabase = getSupabaseClient();

  // Determine if shaft-size URL or real machine
  const parsedShaft = parseShaftFromUrl(modelDecoded);
  const isShaftPath = parsedShaft !== null;

  let machineName = `${brandDecoded} ${modelDecoded}`;
  let machineType = 'folder'; // Default

  if (!isShaftPath) {
    // Look up machine
    const { data: machine } = await supabase
      .from('machines')
      .select('*')
      .ilike('brand', brandDecoded)
      .ilike('model', modelDecoded)
      .single();

    if (!machine) {
      notFound();
    }

    machineName = machine.display_name || `${machine.brand} ${machine.model}`;
    machineType = machine.type?.toLowerCase() || 'folder';
  }

  // Fetch brand media
  const brandMediaSlug = brandDecoded?.toLowerCase().replace(/\s+/g, '-').replace(/\//g, '-');
  const { data: brandMedia } = await supabase
    .from('brand_media')
    .select('logo_url, hero_url')
    .eq('brand_slug', brandMediaSlug)
    .single();

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Compact Hero - Catalog Style */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          {brandMedia?.logo_url && (
            <div className="mb-4">
              <img src={brandMedia.logo_url} alt={brandDecoded} className="h-10 w-auto" />
            </div>
          )}

          <h1 className="text-3xl font-bold mb-3 leading-tight">
            Transform Your {machineName}
          </h1>
          <p className="text-lg text-gray-300 mb-6 max-w-3xl">
            Eliminate cracking. Reduce waste. Handle jobs you couldn't touch before.
          </p>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-xl font-bold">30%</div>
              <div className="text-xs text-gray-400">Less Waste</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-xl font-bold">90%</div>
              <div className="text-xs text-gray-400">Faster Setup</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-xl font-bold">£30k+</div>
              <div className="text-xs text-gray-400">Annual Savings</div>
            </div>
          </div>

          <a
            href="/contact"
            className="inline-block bg-orange-500 text-white px-6 py-2 text-sm font-bold hover:bg-orange-600 transition-colors"
          >
            Request Free Trial →
          </a>
        </div>
      </section>

      {/* The Problem - Compact */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-red-100 text-red-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                The Cost of Traditional Scoring
              </div>
              <h2 className="text-2xl font-bold text-gray-900">You're Leaving Money on the Table</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Every Day Without Technifold</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span><strong>Jobs crack on the fold</strong> — forcing expensive reprints</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span><strong>30+ minutes per setup</strong> — for crease adjustments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span><strong>Turning down premium work</strong> — laminated, UV, heavy stocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span><strong>Sending work to competitors</strong> — with better gear</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">With The Complete Technifold System</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Zero fiber cracking</strong> — even on heavy stocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>15-second changeovers</strong> — not 30 minutes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Win laminated jobs</strong> — at premium pricing</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Be the go-to shop</strong> — for complex work</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* The Transformation - Compact */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                The Transformation
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                What Happens When You Equip Your {machineType === 'folder' ? 'Folder' : 'Machine'}
              </h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Perfect Creases on Every Stock</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    Tri-Creaser, Quad-Creaser, and Spine tools work together to handle anything from 85gsm to 350gsm+. Digital stocks, laminated sheets, UV coatings—nothing cracks.
                  </p>
                  <p className="text-sm text-orange-600 font-semibold">
                    Result: Zero waste from cracking, accept jobs you used to turn down
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-300 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Setup Time Drops 90%</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    Color-coded Fast-Fit system means your operators change creases in 15 seconds—without removing anything from the machine. No more 30-minute adjustments.
                  </p>
                  <p className="text-sm text-green-700 font-semibold">
                    Result: More jobs per shift, higher productivity, lower labor cost
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-300 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Capability You Didn't Have Before</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    Suddenly you can handle complex work that required letterpress or outside finishing. Perforation tools let you add tear-off sections. Multi-tools handle irregular stocks.
                  </p>
                  <p className="text-sm text-orange-700 font-semibold">
                    Result: New revenue streams, premium pricing, competitive advantage
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROI Section - Compact */}
      <section className="py-10 bg-slate-900 text-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b border-white/20">
            <div className="inline-block bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2 text-orange-300">
              Business Impact
            </div>
            <h2 className="text-2xl font-bold">The Business Case Writes Itself</h2>
          </div>

          <div className="bg-white/10 border border-white/20 p-6">
            <h3 className="text-xl font-bold text-center mb-6">Typical First-Year Savings</h3>

            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-green-400 mb-1">£10k</div>
                <div className="text-xs text-gray-300">Eliminated waste from cracking</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-orange-400 mb-1">£12k</div>
                <div className="text-xs text-gray-300">Reduced setup time/labor</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-400 mb-1">£18k</div>
                <div className="text-xs text-gray-300">New jobs you couldn't do before</div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 p-4 text-gray-900 text-center">
              <p className="text-lg font-bold mb-1">
                Total First-Year Impact: £40,000+
              </p>
              <p className="text-sm">
                Most companies see full ROI within 1-3 jobs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Compact */}
      <section className="py-10 bg-orange-500 text-white border-t-4 border-orange-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Request Your Free Trial</h2>
              <p className="text-orange-100">
                See the transformation yourself. Try the complete Technifold system on your {machineName} with zero commitment.
              </p>
            </div>
            <a
              href="/contact"
              className="bg-slate-900 text-white px-8 py-3 font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Get Started →
            </a>
          </div>
          <p className="mt-4 text-sm text-orange-100 text-center md:text-left">3-month money-back guarantee • Most companies keep the full system</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
