import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CP-Applicator - Close Proximity Crease & Perf Inline | Technifold',
  description: 'World\'s only inline system for close proximity crease + perforation. Perfs as close as 5mm to fold line. Perfect for vouchers, tickets, coupons. 5x faster than letterpress.',
};

export default function CPApplicatorPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Compact Hero */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
          <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold mb-3 text-orange-300 inline-flex">
            World's Only Close Proximity Crease + Perf System
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            CP-Applicator<br />Perfect Tear-Offs Right Next to the Fold
          </h1>
          <p className="text-lg text-gray-300 mb-2 max-w-3xl leading-relaxed">
            <strong>Need perforations RIGHT NEXT to your crease line for vouchers, tickets, or coupons?</strong> CP-Applicator is the world's only inline system that produces crease + double perforation with spacing as tight as 5mm—replicating letterpress quality at 5x the speed.
          </p>
          <p className="text-base text-gray-400 mb-6 max-w-3xl">
            No other manufacturer offers this capability. Stop sending work to letterpress. Produce "perf-crease-perf" configurations inline on your folder.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">5mm</div>
              <div className="text-xs text-gray-400">Closest Perf to Crease</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">5x</div>
              <div className="text-xs text-gray-400">Faster Than Letterpress</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">World's</div>
              <div className="text-xs text-gray-400">Only Solution</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-xs text-gray-400">Money-Back</div>
            </div>
          </div>

          <a
            href="/contact"
            className="inline-block bg-orange-500 text-white px-6 py-2 text-sm font-bold hover:bg-orange-600 transition-colors"
          >
            Request Free Trial →
          </a>
            </div>

            <div>
              <img
                src="/images/products/cp-applicator-action.jpg"
                alt="CP Applicator installed on machine"
                className="w-full rounded-lg shadow-2xl border border-white/20"
              />
              <p className="text-sm text-gray-400 text-center mt-3">
                CP Applicator for close proximity operations
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Problem - Compact */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-red-100 text-red-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                The Close Proximity Problem
              </div>
              <h2 className="text-2xl font-bold text-gray-900">You Can't Get Perfs Close Enough to the Fold</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Traditional Limitations</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                <strong>Vouchers, tickets, coupons, and rip-out forms need tear-off perforations positioned RIGHT NEXT to the fold line.</strong> But standard folder perforation attachments can't get close enough—the mechanics interfere with the crease position.
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm font-bold text-red-900 mb-2">Your terrible options:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">1.</span>
                    <span><strong>Send work to letterpress/cylinder flatbed</strong> for close proximity perf + crease (expensive, slow, offline)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">2.</span>
                    <span><strong>Accept poor spacing</strong>—perfs too far from fold, weak tear-off, unprofessional result</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">3.</span>
                    <span><strong>Turn down the work</strong> because you can't deliver the quality needed</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                Letterpress can deliver close proximity, but it's <strong>5x slower, ties up expensive equipment, requires offline processing,</strong> and creates scheduling nightmares.
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The CP-Applicator Solution</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                <strong>World's only inline system for close proximity crease + perforation.</strong> Produces "perf-crease-perf" configurations with perforations as close as 5mm to the fold—delivering letterpress quality at folder speed.
              </p>
              <div className="bg-white border-l-4 border-green-500 p-4 mb-4">
                <p className="text-sm font-bold text-green-900 mb-2">What Makes It Unique:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>Perf-Crease-Perf</strong> configuration (5mm-45mm spacing)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>Double perf</strong> option (5mm-50mm spacing)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>Patented creasing technology</strong> (Technifold's proven system)</span>
                  </li>
                </ul>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Perfs as close as 5mm to crease</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>5x faster than letterpress</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Letterpress-quality results inline</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Almost invisible micro-perforations</strong> (17, 25, 52 TPI)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>No other manufacturer offers this</strong></span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works - Compact */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                The Innovation
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Crease + Double Perf in One Pass</h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Perf-Crease-Perf Configuration</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    <strong>Two perforation wheels positioned with a crease channel in between.</strong> Spacing adjustable from 5mm to 45mm apart—allowing precise tear-off positioning right next to the fold line.
                  </p>
                  <p className="text-sm text-orange-600 font-semibold">
                    Perfect for vouchers, tickets, coupons needing tear-off sections adjacent to fold
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Female Crease Channel Between Perfs</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    Uses <strong>Technifold's patented female creasing technology</strong> positioned precisely between the two perforation sleeves. Delivers zero-cracking creases on 80-350gsm stocks—with 3 crease style options included.
                  </p>
                  <p className="text-sm text-orange-600 font-semibold">
                    Combines proven Tri-Creaser technology with close proximity perforation
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Almost Invisible Micro-Perforation</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    <strong>Includes 17, 25, and 52 TPI perforation wheels</strong> to suit any stock weight. Produces almost invisible, letterpress-quality micro-perforations that tear cleanly without visible perforations showing before tearing.
                  </p>
                  <p className="text-sm text-green-600 font-semibold">
                    Result: Premium tear-off appearance matching expensive letterpress quality
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Fully Adjustable for Quick Changeovers</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    <strong>Adjust spacing between perfs and crease for any format.</strong> Change crease styles and perforation wheels quickly between jobs—operator friendly design allows format changes without complex disassembly.
                  </p>
                  <p className="text-sm text-blue-600 font-semibold">
                    Result: Handle multiple voucher/ticket formats efficiently
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Applications - Compact */}
      <section className="py-10 bg-gray-50 border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Perfect Applications
              </div>
              <h2 className="text-2xl font-bold text-gray-900">What CP-Applicator Was Built For</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Vouchers & Coupons</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                <strong>Tear-off sections right next to fold line.</strong> Discount vouchers, promotional coupons, gift certificates—anything needing clean tear-off adjacent to crease.
              </p>
              <div className="text-xs text-orange-600 font-semibold">
                Perfect for retail promotions and mail campaigns
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Tickets & Stubs</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                <strong>Event tickets with perforated stubs.</strong> Raffle tickets, admission tickets, parking passes—professional tear-off right at fold position.
              </p>
              <div className="text-xs text-green-700 font-semibold">
                Professional appearance for events and venues
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Rip-Out Forms & Reply Cards</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                <strong>Order forms, reply cards, response sections.</strong> Magazine inserts, catalog order forms, survey cards—clean removal without damaging remaining material.
              </p>
              <div className="text-xs text-blue-700 font-semibold">
                Ideal for direct response marketing
              </div>
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
                Business Impact
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Why Print Operations Choose CP-Applicator</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Eliminate Letterpress Outsourcing</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Stop sending voucher/ticket work to letterpress.</strong> Produce close proximity crease + perf inline on your folder—at 5x the speed and fraction of the cost.
              </p>
              <p className="text-xs text-green-600 font-semibold">
                Result: Keep work in-house, faster turnaround, higher margins
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-orange-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Unique Global Capability</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>No other manufacturer offers this application.</strong> Fully patented technology gives you a competitive advantage—win work competitors can't handle inline.
              </p>
              <p className="text-xs text-orange-600 font-semibold">
                Result: Premium pricing for unique capability
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Letterpress Quality at Folder Speed</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Replicates perfect letterpress/cylinder flatbed method—inline.</strong> Almost invisible micro-perforations, zero-cracking creases, professional appearance.
              </p>
              <p className="text-xs text-blue-600 font-semibold">
                Result: Premium quality without offline bottlenecks
              </p>
            </div>
          </div>

          <div className="mt-6 bg-slate-100 border-2 border-slate-300 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Additional Benefits:</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Completely unique to global market</strong>—patented technology</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>3 crease styles included</strong> for 80-350gsm stocks</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>17, 25, 52 TPI perf wheels</strong> included to suit any stock</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Fully adjustable spacing</strong> (5mm-50mm between perfs)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Operator-friendly</strong> quick changeovers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>100% money-back guarantee</strong></span>
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
              <h2 className="text-2xl font-bold mb-2">Win Work Competitors Can't Handle</h2>
              <p className="text-orange-100">
                See how CP-Applicator delivers close proximity crease + perf inline. World's only solution for vouchers, tickets, and coupons needing tear-offs right next to the fold.
              </p>
            </div>
            <a
              href="/contact"
              className="bg-slate-900 text-white px-8 py-3 font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Request Free Trial →
            </a>
          </div>
          <p className="mt-4 text-sm text-orange-100 text-center md:text-left">100% money-back guarantee • No other manufacturer offers this capability</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
