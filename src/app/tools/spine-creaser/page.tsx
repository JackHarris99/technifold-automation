import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Spine-Creaser - Transform Your Saddle Stitcher | Technifold',
  description: 'Transform your saddle stitcher cover feeder into a powerful cylinder creasing machine. Eliminate fiber cracking, outsourcing, and cylinder press tie-up. Guaranteed.',
};

export default function SpineCreaserPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero with Product Image */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold mb-3 text-orange-300 inline-flex">
                Saddle Stitcher Cover Feeder
              </div>

              <h1 className="text-4xl font-bold mb-4 leading-tight">Spine-Creaser<br />Discover the Secret to Perfect Creasing on Your Saddle Stitcher</h1>
              <p className="text-lg text-gray-300 mb-2 leading-relaxed">
                <strong>Transform your saddle stitcher into a powerful cylinder creasing machine.</strong> In just 30 minutes, you'll be producing perfect letterpress-quality creases inline—no more cylinder press tie-up, no more outsourcing.
              </p>
              <p className="text-base text-gray-400 mb-6">
                Using the same technology as the patented Tri-Creaser, the Spine-Creaser produces results that equal or surpass those of any cylinder. Guaranteed.
              </p>

              <a
                href="/contact"
                className="inline-block bg-orange-500 text-white px-6 py-2 text-sm font-bold hover:bg-orange-600 transition-colors"
              >
                Request Free Trial →
              </a>
            </div>

            <div>
              <img
                src="/images/products/spine-creaser-action.jpg"
                alt="Spine-Creaser installed on saddle stitcher"
                className="w-full rounded-lg shadow-2xl border border-white/20"
              />
              <p className="text-sm text-gray-400 text-center mt-3">
                Spine-Creaser delivering cylinder-quality creases inline
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The 3 Business Risks - Compact */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-red-100 text-red-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Critical to Your Success
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Are You Taking These 3 Large Business Risks?</h2>
            </div>
          </div>

          <p className="text-base text-gray-700 mb-6 leading-relaxed">
            If you are scoring book covers in a separate operation, or are sending the jobs out, then you are taking <strong>3 Large Business Risks:</strong>
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border-2 border-red-200 p-6">
              <div className="bg-red-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3 rounded-full">
                A
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">You're Not Getting Maximum Profit</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Tying up your cylinder press with simple straight-line work you probably can't charge for to begin with. Every hour on the cylinder is lost revenue.
              </p>
            </div>

            <div className="bg-white border-2 border-red-200 p-6">
              <div className="bg-red-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3 rounded-full">
                B
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">You're Losing the Sales Advantage</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Competitors with inline creasing get finished books to customers faster. You're losing the quick-delivery advantage.
              </p>
            </div>

            <div className="bg-white border-2 border-red-200 p-6">
              <div className="bg-red-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3 rounded-full">
                C
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">You're Risking Customer Loss</h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Your quality and turnaround time is marginal or worse yet, simply sub-standard. Crooked, mis-registered, cracked book covers lose customers.
              </p>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-6">
            <h3 className="text-lg font-bold text-red-900 mb-3">The Worry, Anxiety, and Fear:</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>"Will my cover feeder score the covers or will I find that I have to send them out, pull the job from the stitcher and shuffle my entire schedule?"</strong></p>
              <p><strong>"Will we get away with how bad the spine looks on this book or is this going to be another rejection disaster?"</strong></p>
              <p><strong>"Is my night shift going to even look at the book covers, or am I going to arrive in the morning to find crooked, mis-registered, cracked book covers?"</strong></p>
            </div>
          </div>
        </div>
      </section>

      {/* Unbeatable Benefits - Compact */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Unbeatable Benefits
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Nowhere Else Can You Find These Benefits</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-green-600">✓</span> Totally Eliminate Fibre Cracking on Cover Stocks
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Be done with this major source of customer dissatisfaction!</strong> Same technology as the Tri-Creaser—gentle rubber creasing produces flawless results.
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-green-600">✓</span> Totally Eliminate All Offline Scoring Operations
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                Go straight from printing press to guillotine to cover feeder. <strong>No more tedious make-ready time for simple straight line scores.</strong>
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-green-600">✓</span> Totally Eliminate All Outsourcing of Creasing
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>Keep it all in your control.</strong> Put an end to that expensive, time-consuming process and keep control of quality and production in house.
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-green-600">✓</span> Save Your Cylinder Press for Complex Work
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>No need to tie up your cylinder with simple straight-line work.</strong> Free it up for more complex, profitable work.
              </p>
            </div>

            <div className="bg-orange-50 border-2 border-orange-300 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-orange-600">✓</span> Get Finished Books to Your Customer Faster
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                The bottom line in printing today: <strong>produce the job faster, better and cheaper.</strong> The Spine-Creaser makes this possible without sacrificing profits!
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">
                <span className="text-slate-600">✓</span> Cylinder Quality Creases... or Better!
              </h3>
              <p className="text-sm text-gray-700 leading-relaxed">
                <strong>It's like substituting your cover feeder for a Heidelberg cylinder letterpress</strong>—the Spine-Creaser is that special!
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Compact */}
      <section className="py-10 bg-gray-50 border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                How It Works
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Simple Installation, Guaranteed Performance</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Installation is Simple</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                <strong>In less than 30 minutes</strong> the Spine-Creaser female and the matrix are in position and aligned, and you are ready to begin producing <strong>perfect cylinder quality</strong> creases on your saddle-stitcher.
              </p>
              <div className="bg-gray-50 border-l-4 border-orange-500 p-4">
                <p className="text-xs font-bold text-gray-900 mb-2">Simple 3-Step Process:</p>
                <ul className="space-y-1 text-xs text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">1.</span>
                    <span>Remove the existing score wheel from the cover feeder</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">2.</span>
                    <span>Apply the creasing matrix to the drum</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500 font-bold">3.</span>
                    <span>Attach the new double-wheel Spine Creaser with a single bolt</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Unique Double-Wheel System</h3>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                Designed to achieve results un-matched by any other system:
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>First wheel produces a cylinder quality crease</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span><strong>Second wheel reinforces that crease, guaranteeing zero defects</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Two wheels provide equal, constant pressure against the specially formulated matrix</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>Handles all types of coated, laminated and digital cover stocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 font-bold">•</span>
                  <span>No machine modification needed—fits onto existing components</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ROI - Compact */}
      <section className="py-10 bg-slate-900 text-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b border-white/20">
            <div className="inline-block bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2 text-orange-300">
              Return on Investment
            </div>
            <h2 className="text-2xl font-bold">Pays for Itself in Remarkably Few Jobs</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">The True Cost</h3>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                After the initial investment, the Spine-Creaser costs a minimum of <strong className="text-white">only £15 per 600,000 copies</strong> vs. rising cylinder press costs.
              </p>
              <div className="bg-green-50 border border-green-200 p-4 text-gray-900">
                <p className="text-base font-bold text-green-900 mb-1">
                  Break-Even Point: ~200,000 Copies
                </p>
                <p className="text-xs text-gray-700">
                  From there, it's pure savings as cylinder costs continue to rise
                </p>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 p-6">
              <h3 className="text-xl font-bold text-white mb-4">Guaranteed Savings</h3>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                <strong className="text-white">"In just minutes, the Spine-Creaser will be producing the perfect crease and your company will begin saving thousands of pounds. Guaranteed."</strong>
              </p>
              <p className="text-xs text-gray-400 italic">
                A small investment is guaranteed to begin saving you money from your very first job. And what price do you put on customer satisfaction?
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Compatibility - Compact */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Compatibility
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Fits Major Saddle Stitching Machines</h2>
            </div>
          </div>

          <div className="bg-slate-50 border-2 border-slate-300 p-6">
            <p className="text-sm text-gray-700 mb-4 font-bold">The Spine-Creaser fits the following saddle stitching machine cover feeders:</p>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Muller 1528, 1529, 1553 & 1554 Cover Feeders</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Older style Muller Saddle Stitchers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Heidelberg ST90, ST100, ST270, ST300, ST350, ST400 & ST450</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Heidelberg Prosetter</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Harris (Macey or Sheridan)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Osaka</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Hohner</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>Horizon</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span>McCain</span>
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
              <h2 className="text-2xl font-bold mb-2">Transform Your Saddle Stitcher Today</h2>
              <p className="text-orange-100 mb-1">
                See how the Spine-Creaser eliminates cylinder press tie-up and delivers perfect inline creasing.
              </p>
              <p className="text-sm text-orange-200">
                Backed by our 90-Day Money-Back Guarantee. No weasel clauses. No fine print.
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
