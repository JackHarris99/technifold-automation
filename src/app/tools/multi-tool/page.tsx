import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Multi-Tool - 6 Finishing Operations in One Modular System | Technifold',
  description: 'Stop sending work offline to guillotines and letterpress. Slit, trim, kiss-cut, micro-perforate, and edge-trim inline. Guillotine-quality cutting with self-sharpening blades that last 5x longer.',
};

export default function MultiToolPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Compact Hero */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
          <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold mb-3 text-orange-300 inline-flex">
            World's First Multi-Purpose Finishing System
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Multi-Tool<br />Stop Sending Work Offline. Do It All Inline.
          </h1>
          <p className="text-lg text-gray-300 mb-2 max-w-3xl leading-relaxed">
            <strong>Tired of shuttling jobs between your folder, guillotine, and letterpress?</strong> The Multi-Tool delivers guillotine-quality cutting and letterpress-quality perforation—inline on your folder.
          </p>
          <p className="text-base text-gray-400 mb-6 max-w-3xl">
            This revolutionary modular system gives you 6 finishing applications in one device: Slit, Trim, Kiss-cut, Micro-perforate, Edge-trim, and Double-cut. Mix and match operations to handle jobs you used to send offline.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">6</div>
              <div className="text-xs text-gray-400">Applications in One</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">5x</div>
              <div className="text-xs text-gray-400">Blade Longevity</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">100%</div>
              <div className="text-xs text-gray-400">Guillotine Quality</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">£20k+</div>
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
    

            <div>
              <img
                src="/images/products/multi-tool-action.jpg"
                alt="Multi-Tool installed on machine"
                className="w-full rounded-lg shadow-2xl border border-white/20"
              />
              <p className="text-sm text-gray-400 text-center mt-3">
                Multi-Tool inline cutting and trimming system
              </p>
    
  

      </section>

      {/* The Problem - Compact */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-red-100 text-red-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                The Offline Bottleneck
              </div>
              <h2 className="text-2xl font-bold text-gray-900">You're Bleeding Time and Money Sending Work Offline</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Cost of Offline Finishing</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                Every job that needs cutting, trimming, or micro-perforation <strong>stops your folder and creates a bottleneck.</strong> Work gets pulled off the line, sent to the guillotine or letterpress department, then comes back for final folding.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span><strong>Time wasted moving jobs</strong> between folder, guillotine, and letterpress</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span><strong>Furry cutting edges</strong> from standard folder cutting attachments</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span><strong>Broken perforation blades</strong> that cost you production time</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 font-bold">✕</span>
                  <span><strong>Can't combine operations</strong> like perf + cut in one pass</span>
                </li>
              </ul>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mt-4">
                <p className="text-sm font-bold text-red-900 mb-1">The Real Problem:</p>
                <p className="text-sm text-gray-700">
                  Standard folder attachments deliver inferior quality, so you keep sending work offline—wasting operator time, creating scheduling headaches, and limiting your throughput.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Multi-Tool Solution</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                <strong>Keep work on your folder.</strong> The Multi-Tool uses scissor-action cutting and double-bevelled perforation blades to deliver offline-quality results inline.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Guillotine-quality cutting inline</strong>—no more furry edges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Letterpress-quality micro-perf</strong> up to 72 TPI</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Self-sharpening blades</strong> last 5x longer than competitors</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Modular design</strong>—combine operations like perf + cut, perf + edge trim</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>6 applications in one device</strong> you can configure as needed</span>
                </li>
              </ul>
              <div className="bg-white border-l-4 border-green-500 p-4 mt-4">
                <p className="text-sm font-bold text-green-900 mb-1">The Game Changer:</p>
                <p className="text-sm text-gray-700">
                  "No more furry edges—the quality is as good as a guillotine and has stayed sharp throughout the many jobs we've run." – Tony Morgan, Bindery Manager
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 6 Applications - Compact */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Modular System
              </div>
              <h2 className="text-2xl font-bold text-gray-900">6 Applications. One Device. Infinite Combinations.</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Single Micro-Perforation</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Produce almost invisible, letterpress-quality perforations inline. <strong>17, 25, 52 TPI standard—12 and 72 TPI available.</strong>
              </p>
              <div className="text-xs text-orange-600 font-semibold">
                Simulates flatbed letterpress results
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Close Proximity Perforation</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Produce two parallel perforations <strong>as close as 4mm apart.</strong> Perfect for tear-off sections with tight spacing.
              </p>
              <div className="text-xs text-orange-600 font-semibold">
                Unique capability unavailable elsewhere
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Kiss-Cut (Half Cut)</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Apply shallow blade to penetrate halfway through sheet. <strong>Perfect for stickers, labels, and specialty tear-offs.</strong>
              </p>
              <div className="text-xs text-orange-600 font-semibold">
                Controlled depth cutting
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                4
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">High-Quality Single Cut</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                Run cutting boss against flat side of full cutting blade. <strong>Produces guillotine-quality slitting inline.</strong>
              </p>
              <div className="text-xs text-green-700 font-semibold">
                Scissor action—no furry edges
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                5
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">High-Quality Double Cut</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                <strong>Two parallel cuts in one pass</strong> using special waste guide between cutting bosses. Perfect for trimming multiple edges.
              </p>
              <div className="text-xs text-green-700 font-semibold">
                Deflects trims smoothly and efficiently
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                6
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Clean-Cut Edge Trimming</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-3">
                <strong>Perfectly straight, trouble-free edge trimming.</strong> Avoid uneven trims by applying blue waste gripper band.
              </p>
              <div className="text-xs text-blue-700 font-semibold">
                Guaranteed trouble-free production
              </div>
            </div>
          </div>

          <div className="mt-8 bg-slate-900 text-white border-2 border-slate-800 p-6">
            <h3 className="text-base font-bold mb-3">Optional Combinations Available:</h3>
            <p className="text-sm text-gray-300 mb-4 leading-relaxed">
              The modular design lets you <strong>combine any operations in a single pass</strong>—something impossible with traditional offline equipment.
            </p>
            <div className="grid md:grid-cols-3 gap-4 text-sm text-gray-300">
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>Perforate + Cut</strong> in one pass</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>Perforate + Edge Trim</strong> simultaneously</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>Crease + Cut + Perf</strong> (with Tri-Creaser)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>Double Cut + Perforate</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>Kiss-Cut + Edge Trim</strong></span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-400 font-bold">•</span>
                <span><strong>Custom configurations</strong> for your needs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits - Compact */}
      <section className="py-10 bg-gray-50 border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Business Impact
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Why Print Operations Choose Multi-Tool</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Eliminate Offline Bottlenecks</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Stop shuttling work between machines.</strong> Cut, perforate, and trim inline—without pulling jobs off your folder for offline guillotine or letterpress work.
              </p>
              <p className="text-xs text-green-600 font-semibold">
                Result: Faster turnaround, fewer touchpoints, higher throughput
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <div className="bg-orange-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Blades That Last 5x Longer</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Self-sharpening double-sided hardened cutting bosses</strong> extend lifespan dramatically. Double-bevelled perforation blades outlast competitors many times over.
              </p>
              <p className="text-xs text-orange-600 font-semibold">
                Result: Lower consumable costs, less downtime, consistent quality
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Modular Flexibility</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Buy only what you need today—add capabilities later.</strong> Start with cutting, add perforation when demand grows, configure combinations as your work evolves.
              </p>
              <p className="text-xs text-blue-600 font-semibold">
                Result: Lower upfront investment, scalable system, future-proof flexibility
              </p>
            </div>
          </div>

          <div className="mt-6 bg-slate-100 border-2 border-slate-300 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Additional Technical Benefits:</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Scissor-action cutting</strong> delivers guillotine quality inline</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Self-sharpening technology</strong> maintains edge sharpness over time</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Nylon sleeve holder</strong> keeps blades in top condition</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Waste guide system</strong> prevents material wrap-around on double cuts</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Blue waste gripper band</strong> for trouble-free edge trimming</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Spacer rings</strong> for precise distance adjustment between blades</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Innovation - Compact */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                The Innovation
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Why Multi-Tool Outperforms Standard Attachments</h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-green-50 border-2 border-green-500 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Scissor-Action Cutting Technology</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    Unlike standard folder cutting attachments that crush paper fibers, the Multi-Tool uses a <strong>scissor action design</strong> where the cutting blade runs against hardened cutting bosses at a precise angle—exactly like a paper guillotine.
                  </p>
                  <p className="text-sm text-green-600 font-semibold">
                    Result: "The quality is as good as a guillotine—no more furry edges." – Tony Morgan, Bezier Corporate Print
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-500 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Self-Sharpening Cutting Bosses</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    The uniquely designed <strong>double-sided, hardened cutting bosses enable them to self-sharpen during production</strong>—maintaining guillotine-quality edges throughout thousands of impressions without manual intervention.
                  </p>
                  <p className="text-sm text-orange-600 font-semibold">
                    Result: Extended lifespan, consistent quality, reduced maintenance
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-500 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Double-Bevelled Perforation Blades</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    Standard perforation blades break constantly. Multi-Tool's <strong>double-bevelled design outlasts all others many times over</strong>—while producing almost invisible, letterpress-quality micro-perforations up to 72 TPI.
                  </p>
                  <p className="text-sm text-blue-600 font-semibold">
                    Result: Fewer blade replacements, superior perforation quality, lower operating costs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial - Compact */}
      <section className="py-10 bg-slate-900 text-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b border-white/20">
            <div className="inline-block bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2 text-orange-300">
              Real Results
            </div>
            <h2 className="text-2xl font-bold">Why Binderies Trust Multi-Tool</h2>
          </div>

          <div className="bg-white/10 border border-white/20 p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} className="w-5 h-5 text-orange-400 fill-current" viewBox="0 0 20 20">
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-base text-gray-200 mb-4 leading-relaxed">
              "No more furry edges—in fact <strong className="text-white">the quality of cut is as good as a guillotine and has stayed sharp throughout the many jobs we have run so far.</strong> Our operators have also been impressed by the assortment of options at hand, especially the micro-perforating."
            </p>
            <p className="text-base text-gray-200 mb-4 leading-relaxed">
              "The Multi-tool appears to be <strong className="text-white">another truly revolutionary innovation</strong> and we would have no hesitation in endorsing its quality and durability to any potential buyer."
            </p>
            <div className="text-sm border-t border-white/20 pt-4">
              <div className="font-bold text-white">Tony Morgan</div>
              <div className="text-xs text-gray-400">Bindery Manager, Bezier Corporate Print, Dorset</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Compact */}
      <section className="py-10 bg-orange-500 text-white border-t-4 border-orange-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Stop Sending Work Offline</h2>
              <p className="text-orange-100">
                See how Multi-Tool delivers guillotine-quality cutting and letterpress-quality perforation inline. Try all 6 applications risk-free.
              </p>
            </div>
            <a
              href="/contact"
              className="bg-slate-900 text-white px-8 py-3 font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Request Free Trial →
            </a>
          </div>
          <p className="mt-4 text-sm text-orange-100 text-center md:text-left">3-month money-back guarantee • Modular system—buy what you need, add capabilities later</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
