import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quad-Creaser - Perfect Bound Book Finishing | Technifold',
  description: 'Eliminate spine and hinge flaking on perfect bound books. Letterpress quality creasing for binding machines. Three times deeper than OEM scoring tools.',
};

export default function QuadCreaserPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Compact Hero */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold mb-3 text-orange-300 inline-flex">
            Perfect Bound Book Finishing
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">Quad-Creaser<br />Enhances the Look of Your Perfect Bound Books</h1>
          <p className="text-lg text-gray-300 mb-2 max-w-3xl leading-relaxed">
            <strong>Perfect Bound books are often judged by their cover.</strong> The Quad-Creaser replaces your OEM scoring mechanism to produce Letterpress quality creasing to the spine & hinge areas of your book covers.
          </p>
          <p className="text-base text-gray-400 mb-6 max-w-3xl">
            This patented application uses specially formulated rubber & nylon creasing ribs that gently stretch the fibres—producing three times deeper crease applications to prevent print, coating and laminate from flaking away.
          </p>

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
                The Flaking Problem
              </div>
              <h2 className="text-2xl font-bold text-gray-900">OEM Scoring Tools Damage Your Book Covers</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why OEM Scoring Fails</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Your existing supplied <strong>OEM steel scoring modules are abrasive and create shallow indentations</strong> in the two spine & two hinge areas—often resulting in the flaking problem seen on finished books.
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm font-bold text-red-900 mb-2">Two fatal flaws of OEM scoring:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">1.</span>
                    <span>Made of steel—proven to <strong>break rather than gently soften</strong> cover stock fibres and coatings</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">2.</span>
                    <span>Create small V-shape indentations that are <strong>too weak and narrow</strong> for spine/hinge areas to fold cleanly</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                The problem is compounded by opening and closing of the front cover, adding more stress to the hinge. <strong>Weak scores also affect bonding of glue to hinge flaps.</strong>
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Quad-Creaser Solution</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Specially formulated rubber creasing ribs <strong>gently manipulate and stretch the fibres</strong> in the cover material—so surface flaking is avoided.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span><strong>Eliminates spine & hinge fibre cracking & flaking</strong></span></li>
                <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span><strong>Three times deeper creasing</strong> than OEM scoring tools</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>Can crease both sides of the cover</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>Excellent on UV coated, laminated and digitally printed stocks</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span><strong>Improves glue contact</strong> of hinge area to text pages</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>Allows easy cover opening flexibility</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span><strong>Installation is simple</strong> and requires no machine modifications</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Compact */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Key Benefits
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Why Binderies Choose Quad-Creaser</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Eliminate Outsourcing</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>No more gathering your covers to run through a separate Letterpress creasing machine.</strong> Quad-Creaser delivers letterpress-quality results inline.
              </p>
              <p className="text-xs text-orange-600 font-semibold">
                Save time, labor costs, and logistics headaches
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-300 p-6">
              <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Fast ROI</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Pays for itself (on average) within the first 4 months</strong> of purchase. Eliminate waste from flaking, reduce reprints, bring outsourced work in-house.
              </p>
              <p className="text-xs text-green-700 font-semibold">
                Most binding operations see immediate quality improvements
              </p>
            </div>

            <div className="bg-orange-50 border-2 border-orange-300 p-6">
              <div className="bg-orange-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Fast & Simple Setup</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Split creasing ribs easily insert into the locking collars—without removing shafts.</strong> Color-coded male/female system allows quick setup for all cover stock weights.
              </p>
              <p className="text-xs text-orange-700 font-semibold">
                Enables 1 to 4 crease lines simultaneously
              </p>
            </div>
          </div>

          <div className="mt-8 bg-slate-100 border-2 border-slate-300 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Additional Benefits:</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Works perfectly on cross grain materials regardless of solid ink coverage</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>You can vary the spine and/or hinge widths & depths to work on all cover stocks</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>No more ripped sheets or split covers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Over 25 versions available for top brands of binding machines</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials - Compact */}
      <section className="py-10 bg-slate-900 text-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b border-white/20">
            <div className="inline-block bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2 text-orange-300">
              Real Results
            </div>
            <h2 className="text-2xl font-bold">What Binderies Say</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 border border-white/20 p-6">
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                "We had to score thicker covers offline, and now we can do it inline. <strong className="text-white">It has increased productivity, but it is more about the quality of the finished product.</strong> I would definitely put your product forward to other print houses."
              </p>
              <div className="text-sm">
                <div className="font-bold text-white">Jonathan Ellis</div>
                <div className="text-xs text-gray-400">Printed Easy</div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 p-6">
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                "We were utterly amazed when we tried the adjustable version of the Quad Creaser. <strong className="text-white">Not only does the system eliminate fibre-cracking, but it also minimises the reset force of the cover.</strong> The Quad Creaser has allowed Kosel to raise its own quality standards for bound products."
              </p>
              <div className="text-sm">
                <div className="font-bold text-white">Eugen Mayer</div>
                <div className="text-xs text-gray-400">Book-binding Department Manager, Kosel GmbH, Germany</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Compact */}
      <section className="py-10 bg-orange-500 text-white border-t-4 border-orange-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Upgrade Your Binding Quality</h2>
              <p className="text-orange-100">
                See how Quad-Creaser eliminates flaking and delivers letterpress-quality book covers inline.
              </p>
            </div>
            <a
              href="/contact"
              className="bg-slate-900 text-white px-8 py-3 font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Request Free Trial →
            </a>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
