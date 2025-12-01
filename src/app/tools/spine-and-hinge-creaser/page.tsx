import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spine & Hinge Creaser - Up to 4 Deep Creases | Technifold',
  description: 'The close proximity creasing device. Apply up to four deep creases for Perfect Bound book covers, folders, capacity wallets. Eliminates cracking 100%. Pays for itself in 5 jobs.',
};

export default function SpineAndHingeCreaserPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Compact Hero */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold mb-3 text-orange-300 inline-flex">
            The Close Proximity Creasing Device
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">Spine & Hinge Creaser<br />Up to Four Deep Creases in Close Proximity</h1>
          <p className="text-lg text-gray-300 mb-2 max-w-3xl leading-relaxed">
            <strong>Apply up to four deep creases—ideal for Perfect Bound book covers, folders, capacity wallets, or any product that requires multiple creasing.</strong> Deep penetrating crease application delivers flawless results.
          </p>
          <p className="text-base text-gray-400 mb-6 max-w-3xl">
            Eliminating cracking is just the start. Works first time every time, avoiding unnecessary crease depth adjustment.
          </p>

          <a
            href="/contact"
            className="inline-block bg-orange-500 text-white px-6 py-2 text-sm font-bold hover:bg-orange-600 transition-colors"
          >
            Request Free Trial →
          </a>
        </div>
      </section>

      {/* Benefits - Compact */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Key Benefits
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Eliminating Cracking is Just the Start</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-green-600">✓</span> Completely Eliminates Fibre Cracking 100%
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Deep penetrating crease application delivers the perfect result every time. No more customer dissatisfaction from cracked covers.
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-green-600">✓</span> No More Outsourcing of Covers for Off-Line Creasing
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Bring all your creasing in-house. No more expensive, time-consuming outsourcing. Keep control of quality and production.
              </p>
            </div>

            <div className="bg-orange-50 border-2 border-orange-300 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-orange-600">✓</span> Pays for Itself Within the First Five Job Runs
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>On average, five jobs covers your investment.</strong> From there, it's pure savings on every subsequent run.
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-green-600">✓</span> No More Sheet Ripping or Splitting Covers
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>No more splitting covers completely in half during setting.</strong> Works first time every time, avoiding unnecessary crease depth adjustment.
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-green-600">✓</span> Produces a Deeper and More Flexible Hinge
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Superior crease depth and flexibility. Covers fold cleanly and stay folded without memory or spring-back.
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-green-600">✓</span> Simple to Set and Easy to Use
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Colour-coded creasing bands available for different grades of stock. Not limited by speed—works as fast as the machine can run.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-slate-100 border-2 border-slate-300 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Additional Benefits:</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Works perfectly on cross grain materials regardless of solid ink coverage</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Excellent on UV coated, laminated or Digital stocks</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Not limited by speed—works as fast as the machine can run</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Colour-coded creasing bands available for different grades of stock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applications - Compact */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Perfect For
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Multiple Creasing Applications</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-slate-50 border-2 border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-3">Perfect Bound Book Covers</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Spine and hinge creases for professional lay-flat opening. Deep creases prevent cracking.
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-3">Folders</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Multiple close-proximity creases for complex folder construction. Perfect registration.
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-3">Capacity Wallets</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Up to four creases for expandable capacity wallets. Deep penetration for heavy stocks.
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-gray-200 p-6">
              <h3 className="text-base font-bold text-gray-900 mb-3">Multiple Crease Products</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Any product requiring multiple close-proximity creases. Versatile and reliable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compatibility - Compact */}
      <section className="py-10 bg-gray-50 border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Compatibility
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Fits Major Binding & Folding Equipment</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Perfect Binders</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Muller Martini</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Kolbus</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Harris</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Wohlenberg</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Horizon</span>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Folding Machines</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Stahl/Heidelberg</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>MBO</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>GUK</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Agor</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Also fits Tech-ni-Fold CreaseStream range</span>
                </div>
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
              <h2 className="text-2xl font-bold mb-2">Ready for Perfect Multi-Crease Results?</h2>
              <p className="text-orange-100 mb-1">
                See how Spine & Hinge Creaser delivers up to four deep creases with zero fiber cracking.
              </p>
              <p className="text-sm text-orange-200">
                Pays for itself within the first five job runs. On average.
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
