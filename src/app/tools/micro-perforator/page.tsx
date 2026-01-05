import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Micro-Perforator - Flatbed Quality Perforation Inline | Technifold',
  description: 'Stop outsourcing micro-perforation. Produce up to 72 TPI inline on your folder. Sheets run through laser printers without jamming. Never break a perf blade again.',
};

export default function MicroPerforatorPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Compact Hero */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
          <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold mb-3 text-orange-300 inline-flex">
            Inline Perforation Technology
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">Micro-Perforator<br />Stop Outsourcing. Start Producing Flatbed-Quality Perfs Inline.</h1>
          <p className="text-lg text-gray-300 mb-2 max-w-3xl leading-relaxed">
            <strong>Are you fed up with broken perf blades, outsourcing delays, and sheets that jam laser printers?</strong> The Micro-Perforator produces nearly invisible micro-perfs up to 72 teeth per inch—inline on your folder.
          </p>
          <p className="text-base text-gray-400 mb-6 max-w-3xl">
            Kiss-cut technology. Break-resistant double-bevel blades. Cuts against soft nylon, not destructive steel. Sheets lie perfectly flat and run through any digital device without jamming.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">72 TPI</div>
              <div className="text-xs text-gray-400">Nearly Invisible</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">2 Jobs</div>
              <div className="text-xs text-gray-400">Recover Cost</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">Zero</div>
              <div className="text-xs text-gray-400">Broken Blades</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">£1000s</div>
              <div className="text-xs text-gray-400">Saved on Blankets</div>
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
                src="/images/products/micro-perforator-action.jpg"
                alt="Micro-Perforator installed on machine"
                className="w-full rounded-lg shadow-2xl border border-white/20"
              />
              <p className="text-sm text-gray-400 text-center mt-3">
                Micro-Perforator creating precision perforations
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
                The Problem
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Your Folder's Perf System Is Destroying Your Jobs</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Does This Look Familiar?</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                <strong>Broken perf blades. Burred edges. Constant replacement orders.</strong> Your standard folding machine perf system uses 12 TPI blades that run metal-against-metal—a recipe for disaster.
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm font-bold text-red-900 mb-2">Why Standard Perf Systems Fail:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">1.</span>
                    <span><strong>Metal-on-metal destruction:</strong> Blade runs against steel anvil. Something always breaks when you least want it to.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">2.</span>
                    <span><strong>Sheet distortion in 3 directions:</strong> Downward as blade enters, upward as it exits, horizontal as it pushes paper away from counter knife.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">3.</span>
                    <span><strong>Creates a jagged, unsightly "torn" look</strong> that customers reject. Paper dust and ridges jam laser printers.</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                The ridge formed by conventional perforating builds up to create an <strong>oval-shaped stack</strong> that makes guillotining troublesome and won't lie flat.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Cost of Poor Perforation</h3>
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✕</span>
                  <span><strong>Outsourcing delays:</strong> Gather sheets, send to press perf or die cutter, wait for return</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✕</span>
                  <span><strong>Smashed press blankets:</strong> Thousands of pounds wasted when perf rules damage blankets</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✕</span>
                  <span><strong>Laser printer jams:</strong> Sheets with ridges won't run through digital devices for variable data</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✕</span>
                  <span><strong>Turned-away work:</strong> Jobs you can't take because you don't trust your perf system</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✕</span>
                  <span><strong>Constant blade replacements:</strong> Burred edges and broken teeth add up month after month</span>
                </li>
              </ul>
              <div className="bg-slate-900 text-white p-4">
                <p className="text-lg font-bold mb-1">It doesn't have to be this way.</p>
                <p className="text-xs text-gray-300">What if there was a rotary solution that matched flatbed letterpress quality?</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Solution */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                The Solution
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Kiss-Cut Technology That Changes Everything</h2>
            </div>
          </div>

          <div className="bg-blue-50 border-2 border-blue-300 p-6 mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">The Tech-ni-Fold Micro-Perforator</h3>
            <p className="text-base text-gray-700 mb-4 leading-relaxed">
              Created after extensive market research, the Micro-Perforator is <strong>the only rotary solution that replicates proven flatbed cylinder results</strong>. It was designed using new technology that adds strength and longevity, so it outlasts conventional methods many times over.
            </p>
            <p className="text-base text-gray-700 leading-relaxed">
              Unlike conventional perfs, the Micro-Perforator is designed to <strong>kiss-cut the sheet</strong>. The narrow profile blade cuts through only to the bottom of the sheet—not beyond—minimizing the knife area in actual contact with the sheet.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How It Works</h3>
              <ul className="space-y-3 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">1.</span>
                  <span><strong>Shock-absorbing cushion mount:</strong> The blade is mounted on a special cushion that delivers accurate, precise kiss-cuts the entire length of the sheet.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">2.</span>
                  <span><strong>Cuts against soft nylon, not steel:</strong> This is the game-changer. Blade runs against a softer material, eliminating the metal-on-metal destruction.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">3.</span>
                  <span><strong>Double bevel construction:</strong> Blades are break-resistant by design. Hard-wearing steel specially engineered to penetrate paper without damage.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">4.</span>
                  <span><strong>Rubber grippers keep sheets stable:</strong> Two rubber grippers adjacent to the perf wheel maximize grip, prevent "tailing," and keep sheets perfectly flat.</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Results</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Cleaner, finer cut</strong> that permits sheets to lie perfectly flat</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Nearly invisible perforations</strong> up to 72 teeth per inch</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Perfect, straight-line micro perfs</strong> without the cost or headache</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Sheets run through laser printers and copiers</strong> without jamming</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Flat stacks</strong>—no oval shape from ridge buildup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Blades last for millions of sheets</strong> without wear or broken teeth</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="py-10 bg-gray-50 border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b-2 border-gray-300">
            <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
              Business Impact
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Transform Your Perforation Capability</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Eliminate Outsourcing</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>No more sending jobs to flatbed cylinders or die cutters.</strong> Produce letterpress-quality micro-perfs inline on your folder at full speed.
              </p>
              <p className="text-xs text-orange-600 font-semibold">
                Save hours and days in turnaround time
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-300 p-6">
              <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Instant ROI</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Recover your investment in just 2 jobs.</strong> Eliminate outsourcing costs, stop replacing broken blades, and save thousands on press blankets.
              </p>
              <p className="text-xs text-green-700 font-semibold">
                Phil Fredericks recovered cost on second job
              </p>
            </div>

            <div className="bg-orange-50 border-2 border-orange-300 p-6">
              <div className="bg-orange-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Sell More Work</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Take jobs you used to turn away.</strong> Produce sheets that run through laser printers for variable data applications. Offer perforation as a value-add service.
              </p>
              <p className="text-xs text-orange-700 font-semibold">
                Free up your press and die cutter for profitable work
              </p>
            </div>
          </div>

          <div className="mt-8 bg-slate-100 border-2 border-slate-300 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Additional Benefits:</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>No installation required</strong>—simply slide onto folder's slitter shafts</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>No special operator skill needed</strong>—anyone can use it</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Save thousands on smashed press blankets</strong>—perf on folder, not press</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Never break a perf blade again</strong>—double bevel cuts nylon, not steel</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blade Options */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b-2 border-gray-300">
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
              Complete System
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Standard Package Includes Three Blade Options</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white border-2 border-gray-300 p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">17 TPI</div>
                <div className="text-sm text-gray-600">Heavy Stock</div>
              </div>
              <p className="text-sm text-gray-700 text-center">
                Perfect for heavyweight materials where strength matters
              </p>
            </div>

            <div className="bg-white border-2 border-blue-400 p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">25 TPI</div>
                <div className="text-sm text-gray-600">Medium Weight</div>
              </div>
              <p className="text-sm text-gray-700 text-center">
                The workhorse blade for most standard applications
              </p>
            </div>

            <div className="bg-white border-2 border-gray-300 p-6">
              <div className="text-center mb-4">
                <div className="text-3xl font-bold text-gray-900">52 TPI</div>
                <div className="text-sm text-gray-600">Lightweight</div>
              </div>
              <p className="text-sm text-gray-700 text-center">
                Nearly invisible perforation for fine work
              </p>
            </div>
          </div>

          <div className="mt-6 bg-blue-50 border border-blue-300 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white flex items-center justify-center font-bold">
                +
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Additional Options Available</h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>72 TPI:</strong> Ultra-fine, almost invisible perforation (available for most models on request)
                </p>
                <p className="text-sm text-gray-700">
                  <strong>12 TPI:</strong> Very heavy stock perforation for specialized applications
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Machine Compatibility */}
      <section className="py-10 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b border-white/20">
            <div className="inline-block bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2 text-orange-300">
              Universal Compatibility
            </div>
            <h2 className="text-2xl font-bold">Works With All Major Folding Machines</h2>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white/10 border border-white/20 p-4">
              <div className="font-bold text-white mb-1">MBO</div>
              <div className="text-sm text-gray-300">All major models</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4">
              <div className="font-bold text-white mb-1">Stahl/Heidelberg</div>
              <div className="text-sm text-gray-300">Full range</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4">
              <div className="font-bold text-white mb-1">Horizon</div>
              <div className="text-sm text-gray-300">Compatible models</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4">
              <div className="font-bold text-white mb-1">Baumfolder</div>
              <div className="text-sm text-gray-300">Standard fitment</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4">
              <div className="font-bold text-white mb-1">Rosback</div>
              <div className="text-sm text-gray-300">Direct fit</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4">
              <div className="font-bold text-white mb-1">MB Bäuerle</div>
              <div className="text-sm text-gray-300">Slitter shaft mount</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4">
              <div className="font-bold text-white mb-1">Morgana</div>
              <div className="text-sm text-gray-300">Multiple models</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4">
              <div className="font-bold text-white mb-1">+ More</div>
              <div className="text-sm text-gray-300">H&H, Petratto, GUK</div>
            </div>
          </div>

          <div className="mt-6 bg-white/10 border border-white/20 p-5">
            <p className="text-sm text-gray-300">
              <strong className="text-white">Also compatible with:</strong> CreaseStream and DCM creasing machines. Contact us to confirm fitment for your specific model.
            </p>
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b-2 border-gray-300">
            <div className="inline-block bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2 text-orange-600">
              Customer Success
            </div>
            <h2 className="text-2xl font-bold text-gray-900">ROI in Just Two Jobs</h2>
          </div>

          <div className="bg-green-50 border-2 border-green-500 p-8">
            <div className="flex gap-1 mb-4">
              {[1,2,3,4,5].map(i => (
                <svg key={i} className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              ))}
            </div>
            <blockquote className="text-xl text-gray-900 mb-6 leading-relaxed">
              "We have just completed our <strong>second job with the Micro-Perforator and have already recovered the cost we paid for it.</strong> Now we can complete work quicker with superior results than previously, and with a lot more control."
            </blockquote>
            <div className="text-base">
              <div className="font-bold text-gray-900">Phil Fredericks</div>
              <div className="text-sm text-gray-600">Wood Mitchell Printers, Stoke on Trent, UK</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Compact */}
      <section className="py-10 bg-orange-500 text-white border-t-4 border-orange-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Stop Outsourcing. Start Producing Inline.</h2>
              <p className="text-orange-100">
                See how the Micro-Perforator eliminates broken blades, outsourcing delays, and laser printer jams.
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
