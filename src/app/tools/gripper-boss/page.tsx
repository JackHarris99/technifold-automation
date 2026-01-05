import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gripper Boss - Re-Grip in Seconds, Not Days | Technifold',
  description: 'Stop sending gripper wheels away for re-gripping. Replace worn gripper bands in seconds—no machine stripping, no specialist, no downtime. Superior grip, fraction of the cost.',
};

export default function GripperBossPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Compact Hero */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
          <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold mb-3 text-orange-300 inline-flex">
            Revolutionary Gripper Wheel Replacement
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Gripper Boss<br />Re-Grip Your Wheels in Seconds, Not Days
          </h1>
          <p className="text-lg text-gray-300 mb-2 max-w-3xl leading-relaxed">
            <strong>Fed up with sending gripper wheels away for expensive re-gripping?</strong> Gripper Boss replaces your OEM wheels with a two-part system featuring replaceable gripper bands—just rip out worn bands and push in new ones.
          </p>
          <p className="text-base text-gray-400 mb-6 max-w-3xl">
            No machine stripping. No specialist charges. No days or weeks of waiting. Change bands between jobs and get back to production immediately.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">Seconds</div>
              <div className="text-xs text-gray-400">Not Days to Re-Grip</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">Zero</div>
              <div className="text-xs text-gray-400">Specialist Charges</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">90%</div>
              <div className="text-xs text-gray-400">Cost Savings</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">Better</div>
              <div className="text-xs text-gray-400">Grip Than OEM</div>
            </div>
          </div>

          <a
            href="/contact"
            className="inline-block bg-orange-500 text-white px-6 py-2 text-sm font-bold hover:bg-orange-600 transition-colors"
          >
            Request Free Trial →
          </a>
        </div>
            </div>

            <div>
              <img
                src="/images/products/gripper-boss-action.jpg"
                alt="Gripper Boss installed on machine"
                className="w-full rounded-lg shadow-2xl border border-white/20"
              />
              <p className="text-sm text-gray-400 text-center mt-3">
                Gripper Boss restoring gripper performance
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
                The OEM Gripper Nightmare
              </div>
              <h2 className="text-2xl font-bold text-gray-900">OEM Gripper Wheels Are a Maintenance Disaster</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Fatal Flaw of OEM Grippers</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                OEM gripper wheels bond <strong>metal + rubber together permanently.</strong> When the rubber wears down—and it always does—you're stuck with two terrible options:
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm font-bold text-red-900 mb-2">Option 1: Send wheels for re-gripping</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">1.</span>
                    <span><strong>Strip the entire machine</strong> to remove wheels</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">2.</span>
                    <span><strong>Send wheels to specialist</strong> for rubber bonding</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">3.</span>
                    <span><strong>Wait days or weeks</strong> for return</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">4.</span>
                    <span><strong>Pay rush charges</strong> if you need them urgently</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">5.</span>
                    <span><strong>Reassemble and calibrate</strong> machine</span>
                  </li>
                </ul>
              </div>
              <div className="bg-red-50 border-l-4 border-red-500 p-4">
                <p className="text-sm font-bold text-red-900 mb-2">Option 2: Buy new OEM wheels</p>
                <p className="text-sm text-gray-700">
                  Even more expensive—often <strong>hundreds of pounds per wheel.</strong> Plus OEM rubber quality is often poor, so you'll be replacing them again soon.
                </p>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Gripper Boss Solution</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                <strong>Replace OEM wheels once with Gripper Boss—then change bands in seconds forever.</strong> The two-part system uses a metal wheel with grooves that accept replaceable gripper bands.
              </p>
              <div className="bg-white border-l-4 border-green-500 p-4 mb-4">
                <p className="text-sm font-bold text-green-900 mb-2">The Two-Part System:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>Top: Metal wheel with 2 grooves</strong> for replaceable gripper bands</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>Bottom: Full metal wheel</strong> (long-lasting, no wear parts)</span>
                  </li>
                </ul>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Change bands in seconds</strong>—just rip out old, push in new</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>No machine stripping required</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>No sending wheels away</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Superior grip to OEM rubber</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Bands cost fraction of re-gripping</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Stock bands on-site</strong> for instant changes</span>
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
                How It Works
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Change Gripper Bands in 5 Simple Steps</h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Identify Worn Gripper Bands</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    When you notice grip quality declining or sheets slipping, it's time to change bands. Takes seconds to assess.
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
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Pull/Rip Out Old Bands</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Simply pull the worn bands out of the wheel grooves.</strong> No tools, no disassembly, no machine stripping. They rip out easily when worn.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Warm New Bands Slightly (Optional)</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    For easier insertion, <strong>warm bands slightly in your hands or with warm water.</strong> Makes them more pliable for snapping into grooves.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Push New Bands Into Grooves</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Press new bands into the wheel grooves until fully seated.</strong> The bands snap into place securely—no adhesive, no specialist equipment.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  5
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Resume Production Immediately</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    <strong>Check grip and resume production—total time: seconds.</strong> No recalibration, no specialist sign-off, no waiting.
                  </p>
                  <p className="text-sm text-green-600 font-semibold">
                    Change bands between jobs. Zero production downtime.
                  </p>
                </div>
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
              <h2 className="text-2xl font-bold text-gray-900">Why Operations Choose Gripper Boss</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Eliminate Downtime</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>No more waiting days or weeks for specialist re-gripping.</strong> Change bands in seconds between jobs. Zero production delays, zero rush charges, zero scheduling headaches.
              </p>
              <p className="text-xs text-green-600 font-semibold">
                Result: Continuous production, no unplanned stoppages
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <div className="bg-orange-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Slash Maintenance Costs</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Gripper bands cost a fraction of specialist re-gripping or new OEM wheels.</strong> Stock bands on-site for predictable maintenance costs—no surprise invoices.
              </p>
              <p className="text-xs text-orange-600 font-semibold">
                Result: 90%+ savings vs OEM re-gripping over 5 years
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Superior Sheet Grip</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Premium rubber compound delivers better grip than OEM rubber.</strong> More consistent sheet transport, fewer misfeeds, improved registration—especially critical with Technifold finishing tools.
              </p>
              <p className="text-xs text-blue-600 font-semibold">
                Result: Better quality, fewer jams, consistent performance
              </p>
            </div>
          </div>

          <div className="mt-6 bg-slate-100 border-2 border-slate-300 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Additional Benefits:</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Stock bands on-site</strong> for instant changes when needed</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>No machine stripping</strong> or complex disassembly required</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Predictable maintenance costs</strong>—no surprise specialist charges</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Universal compatibility</strong> across folders, binders, stitchers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Longer lasting rubber</strong> than typical OEM grippers</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Recommended with Technifold tools</strong> for optimal sheet control</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Comparison - Compact */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                ROI Analysis
              </div>
              <h2 className="text-2xl font-bold text-gray-900">The Business Case Writes Itself</h2>
            </div>
          </div>

          <div className="bg-slate-50 border-2 border-slate-300 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">5-Year Total Cost Comparison</h3>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Scenario</th>
                    <th className="px-4 py-3 text-center">OEM Approach</th>
                    <th className="px-4 py-3 text-center">Gripper Boss</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-slate-300">
                    <td className="px-4 py-3 font-semibold">Initial Cost</td>
                    <td className="px-4 py-3 text-center bg-green-50">Lower</td>
                    <td className="px-4 py-3 text-center bg-orange-50">Moderate</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="px-4 py-3 font-semibold">First Re-grip</td>
                    <td className="px-4 py-3 text-center bg-red-50"><strong>£200-500</strong> (send away)</td>
                    <td className="px-4 py-3 text-center bg-green-50"><strong>£30-60</strong> (bands only)</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="px-4 py-3 font-semibold">Downtime</td>
                    <td className="px-4 py-3 text-center bg-red-50"><strong>Days/weeks</strong></td>
                    <td className="px-4 py-3 text-center bg-green-50"><strong>Seconds</strong></td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="px-4 py-3 font-semibold">Rush Charges</td>
                    <td className="px-4 py-3 text-center bg-red-50">Often required</td>
                    <td className="px-4 py-3 text-center bg-green-50">Never needed</td>
                  </tr>
                  <tr className="border-b border-slate-300">
                    <td className="px-4 py-3 font-semibold">Ongoing Cost (Years 2-5)</td>
                    <td className="px-4 py-3 text-center bg-red-50"><strong>Unpredictable</strong></td>
                    <td className="px-4 py-3 text-center bg-green-50"><strong>Low, predictable</strong></td>
                  </tr>
                  <tr className="bg-slate-100 font-bold">
                    <td className="px-4 py-3">Total 5-Year Cost</td>
                    <td className="px-4 py-3 text-center text-red-600"><strong>HIGH</strong></td>
                    <td className="px-4 py-3 text-center text-green-600"><strong>MUCH LOWER</strong></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mt-6">
              <p className="text-sm font-bold text-orange-900 mb-2">Hidden OEM Costs:</p>
              <ul className="space-y-1 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Lost production time while waiting for wheels</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Rush shipping charges for urgent returns</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Operator time stripping/reassembling machine</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-600">•</span>
                  <span>Missed deadlines and customer complaints</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Machine Compatibility - Compact */}
      <section className="py-10 bg-gray-50 border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Universal Compatibility
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Works on Your Equipment</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Folders</h3>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                Compatible with most popular folder brands and models.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">MBO</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">Stahl</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">Heidelberg</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">Horizon</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">GUK</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">Morgana</span>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Perfect Binders</h3>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                Upgrade gripper systems on binding equipment for consistent cover feeding.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">Muller Martini</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">Horizon</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">Kolbus</span>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Saddle Stitchers</h3>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                Maintain consistent grip throughout high-speed stitching operations.
              </p>
              <div className="flex flex-wrap gap-2">
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">Heidelberg</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">Muller</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">Horizon</span>
                <span className="text-xs bg-slate-200 text-slate-700 px-2 py-1 font-semibold">Hohner</span>
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
              <h2 className="text-2xl font-bold mb-2">Stop Sending Wheels Away for Re-Gripping</h2>
              <p className="text-orange-100">
                See how Gripper Boss eliminates downtime and slashes maintenance costs. Change bands in seconds—not days.
              </p>
            </div>
            <a
              href="/contact"
              className="bg-slate-900 text-white px-8 py-3 font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Request Free Trial →
            </a>
          </div>
          <p className="mt-4 text-sm text-orange-100 text-center md:text-left">3-month money-back guarantee • Stock gripper bands on-site for instant changes</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
