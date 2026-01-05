import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tri-Creaser - World-Class Rotary Creasing | Technifold',
  description: 'The world\'s first rotary creasing solution that matches letterpress quality. Eliminate fiber cracking, reduce waste, increase productivity. 40,000+ installations worldwide.',
};

export default function TriCreaserPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Hero with Product Image */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold mb-3 text-orange-300 inline-flex">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                40,000+ Installations Worldwide
              </div>

              <h1 className="text-4xl font-bold mb-4 leading-tight">Tri-Creaser<br />Totally Eliminates Fiber Cracking</h1>
              <p className="text-lg text-gray-300 mb-2 leading-relaxed">
                <strong>The revolutionary rotary creasing solution that completely eliminates fiber cracking on all popular types of folding machines.</strong>
              </p>
              <p className="text-base text-gray-400 mb-6">
                The resilient rubber compound penetrates the area prone to cracking with gentle rotary action—manipulating and stretching the fibres instead of damaging them like common steel scoring methods. Results equal to letterpress quality.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
                  <div className="text-2xl font-bold">100%</div>
                  <div className="text-xs text-gray-400">Cracking Eliminated</div>
                </div>
                <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
                  <div className="text-2xl font-bold">Seconds</div>
                  <div className="text-xs text-gray-400">Change Settings</div>
                </div>
                <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
                  <div className="text-2xl font-bold">1-3 Jobs</div>
                  <div className="text-xs text-gray-400">Payback Period</div>
                </div>
                <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
                  <div className="text-2xl font-bold">£10k+</div>
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
                src="/images/products/tri-creaser-action.jpg"
                alt="Tri-Creaser Fast-Fit installed on folding machine"
                className="w-full rounded-lg shadow-2xl border border-white/20"
              />
              <p className="text-sm text-gray-400 text-center mt-3">
                Tri-Creaser Fast-Fit creating letterpress-quality creases inline
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
              <h2 className="text-2xl font-bold text-gray-900">You're Leaving Money on the Table Every Single Day</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <p className="text-base font-bold text-gray-900 mb-4 leading-snug">
                The customer wants the job in a hurry. You rush it through in record time. Perfect colors, tight registration. Then you fold it... and the material cracks along the spine.
              </p>
              <p className="text-sm text-gray-700 mb-3 leading-relaxed">
                <strong>You promised the job today.</strong> Now what?
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm font-bold text-red-900 mb-2">Your OEM scoring tools are critically flawed.</p>
                <p className="text-sm text-gray-700">
                  They haven't evolved since 1850. They use a V-shaped steel blade that pushes fibres from the inside, causing spine damage. When used for creasing single cover stock, the steel is too harsh and destroys the fibres.
                </p>
              </div>
              <p className="text-sm text-gray-700 mb-2 leading-relaxed">
                <strong>The Tri-Creaser works the opposite way</strong>—gently stretching the fibres from the outside, resulting in a smooth non-cracked spine and a perfect inside ridge.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Cost of Traditional Scoring</h3>
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✕</span>
                  <span>Jobs crack on the fold—forcing expensive reprints</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✕</span>
                  <span>Send jobs to cylinder (if you have one)—or outsource and wait</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✕</span>
                  <span>30+ minutes per setup adjusting crease settings</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✕</span>
                  <span>Turning down premium work (laminated, UV, heavy stocks)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-600 mt-0.5">✕</span>
                  <span>Losing jobs to competitors with better gear</span>
                </li>
              </ul>
              <div className="bg-gray-900 text-white p-4">
                <p className="text-lg font-bold mb-1">£10,000 - £30,000</p>
                <p className="text-xs text-gray-300">Annual waste reported by most printing companies</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Breakthrough - Compact */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-green-100 text-green-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                Patented Technology
              </div>
              <h2 className="text-2xl font-bold text-gray-900">The Tri-Creaser Method</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-red-50 border-2 border-red-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-red-500 text-white w-6 h-6 flex items-center justify-center text-xs font-bold">✕</span>
                Traditional Scoring
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>V-shaped steel blade concentrates pressure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Crushes and destroys paper fibers</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Shallow penetration = weak crease</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Toner flaking on digital stocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold">•</span>
                  <span>Technology unchanged since 1850</span>
                </li>
              </ul>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="bg-green-500 text-white w-6 h-6 flex items-center justify-center text-xs font-bold">✓</span>
                Tri-Creaser Method
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>U-shaped rubber rib spreads pressure</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Compresses fibers without breaking them</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Penetrates 3x deeper without damage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Rubber is "digital friendly" - no flaking</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 font-bold">•</span>
                  <span>Patented technology, proven worldwide</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-50 border-2 border-slate-300 p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-orange-500 flex items-center justify-center">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-gray-900 mb-2">Graham Harris's Discovery</h4>
                <p className="text-sm text-gray-700 leading-relaxed">
                  Founder Graham Harris tested the 5 leading scoring devices worldwide before inventing Tri-Creaser. The breakthrough: <strong>crease on the TOP (outside) so the bulge is visible on the INSIDE after folding</strong>. This "reverse crease" method matched the proven Heidelberg Cylinder letterpress technique—achieving quality that rotary scoring was thought impossible to deliver.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Visual Proof: Before & After */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-8">
            <div className="inline-block bg-green-100 text-green-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
              Visual Proof
            </div>
            <h2 className="text-3xl font-bold text-gray-900">See the Difference: Metal Scoring vs. Tri-Creaser</h2>
            <p className="text-gray-600 mt-2">Real results from actual production runs</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-8">
            <div className="bg-red-50 border-2 border-red-300 p-6 rounded-lg">
              <img
                src="/images/results/fiber-crack-before.JPG"
                alt="Fiber cracking with traditional metal scoring"
                className="w-full rounded-lg shadow-lg mb-4"
              />
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-red-500 text-white px-2 py-1 text-xs font-bold rounded">BEFORE</span>
                <span className="text-sm font-bold text-gray-900">Traditional Metal Scoring</span>
              </div>
              <p className="text-sm text-gray-700">
                Visible fiber cracking and surface damage along the fold line. This is the inevitable result of V-shaped steel blades crushing paper fibers.
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6 rounded-lg">
              <img
                src="/images/results/fiber-crack-after.JPG"
                alt="Perfect crease with Tri-Creaser"
                className="w-full rounded-lg shadow-lg mb-4"
              />
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-green-500 text-white px-2 py-1 text-xs font-bold rounded">AFTER</span>
                <span className="text-sm font-bold text-gray-900">Tri-Creaser Technology</span>
              </div>
              <p className="text-sm text-gray-700">
                Zero fiber cracking. Clean, professional fold that maintains coating integrity. The rubber creasing rib gently stretches fibers instead of breaking them.
              </p>
            </div>
          </div>

          {/* Video Section */}
          <div className="bg-slate-50 border-2 border-slate-300 p-8 rounded-lg">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">See It In Action</h3>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  Watch how the Tri-Creaser Fast-Fit installs in seconds and delivers letterpress-quality creases at full production speed.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">✓</span>
                    <span>Color-coded setup system</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">✓</span>
                    <span>No machine modifications required</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-orange-500">✓</span>
                    <span>Change settings in seconds</span>
                  </li>
                </ul>
              </div>
              <div>
                <div className="aspect-video rounded-lg overflow-hidden shadow-lg">
                  <iframe
                    src="https://www.youtube.com/embed/QEZVzxka01U"
                    title="Tri-Creaser Fast-Fit demonstration"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technical Validation - Compact */}
      <section className="py-10 bg-slate-900 text-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b border-white/20">
            <div className="inline-block bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2 text-orange-300">
              Industry Recognition
            </div>
            <h2 className="text-2xl font-bold">Proven Performance. Globally Validated.</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div className="bg-white/10 border border-white/20 p-6">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-5 h-5 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-lg font-semibold text-white mb-4 leading-relaxed">
                "The quality of this creasing is comparable with that produced in letterpress printing"
              </blockquote>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-500 flex items-center justify-center text-white font-bold">
                  S
                </div>
                <div>
                  <div className="font-bold text-sm text-white">Sappi Paper Engineering Report</div>
                  <div className="text-xs text-gray-300">Independent Laboratory Testing (2001)</div>
                </div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 p-6">
              <h3 className="text-lg font-bold text-white mb-4">The Only Rotary Device That Totally Eliminates Fiber Cracking</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">✓</span>
                  <span><strong className="text-white">Tested against the top scoring systems worldwide</strong> and outperformed them all significantly in ease of setup, efficiency, versatility and finished quality</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">✓</span>
                  <span><strong className="text-white">Outsells competitors 20-1</strong> in the global market</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">✓</span>
                  <span><strong className="text-white">Heidelberg purchased 3,000+ units</strong> for OEM integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-400">✓</span>
                  <span>Supplied to folding machine manufacturers <strong className="text-white">GUK, MB, and other global leaders</strong></span>
                </li>
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white/10 border border-white/20 p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">40,000+</div>
              <div className="text-xs text-gray-300">Installations worldwide</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">3,000+</div>
              <div className="text-xs text-gray-300">Units bought by Heidelberg</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">20:1</div>
              <div className="text-xs text-gray-300">Outsells competitors</div>
            </div>
            <div className="bg-white/10 border border-white/20 p-4 text-center">
              <div className="text-3xl font-bold text-white mb-1">£30k</div>
              <div className="text-xs text-gray-300">Annual savings (larger companies)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Fast-Fit Color System */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b-2 border-gray-300">
            <div className="inline-block bg-orange-500 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
              Simple Color-Coded System
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Fast-Fit Split Creasing Ribs</h2>
            <p className="text-sm text-gray-600 mt-2">Change from one crease setting to another instantly—never remove the device from your machine again</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white border-2 border-orange-400 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">O</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Orange</div>
                  <div className="text-sm text-gray-600">85-200gsm</div>
                </div>
              </div>
              <p className="text-sm text-gray-700">Light to medium stocks, standard digital output</p>
            </div>

            <div className="bg-white border-2 border-blue-400 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">B</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Blue</div>
                  <div className="text-sm text-gray-600">170-270gsm</div>
                </div>
              </div>
              <p className="text-sm text-gray-700">Medium to heavy stocks, coated papers</p>
            </div>

            <div className="bg-white border-2 border-yellow-400 p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-full bg-yellow-400 flex items-center justify-center">
                  <span className="text-gray-900 font-bold text-lg">Y</span>
                </div>
                <div>
                  <div className="font-bold text-gray-900">Yellow</div>
                  <div className="text-sm text-gray-600">250-350gsm</div>
                </div>
              </div>
              <p className="text-sm text-gray-700">Heavy stocks, board, laminated materials</p>
            </div>
          </div>

          <div className="bg-green-50 border-2 border-green-500 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-3">Why Fast-Fit Saves You Time and Money</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Split creasing rib technology</strong>—change settings without removing exit shafts from machine</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Minutes to setup</strong>, seconds to change from one crease setting to another</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Works like magic</strong> on difficult toner-based digital output</span>
                </li>
              </ul>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Works just as well</strong> when creasing against the grain as with it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>No speed limitations</strong>—works as fast as your folding machine can run</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Pays for itself</strong> within 1-3 job runs</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Tri-Creaser Advance - Digital Upgrade */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b-2 border-gray-300">
            <div className="inline-block bg-blue-100 text-blue-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
              Digital Stock Upgrade
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Tri-Creaser Advance</h2>
            <p className="text-sm text-gray-600 mt-2">Two-way creasing that tackles inside-fold toner flaking on particularly difficult digital stocks</p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-blue-50 border-2 border-blue-300 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Inside-Fold Toner Flaking Problem</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                With changing paper manufacturing processes and paper quality standards, <strong>"inside-fold toner flaking"</strong> is a growing problem regardless of what creasing technology is applied.
              </p>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                The Tri-Creaser Advance is the world's first folding machine solution designed to prevent fiber-cracking on the fold <strong>AND</strong> tackle inside-fold toner flaking at the same time.
              </p>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">How Advance Works</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">1.</span>
                  <span><strong>Two-way creasing application</strong> using interlocking male and female components</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">2.</span>
                  <span><strong>U-shaped crease formed first</strong>, then main fold is placed on top of it</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">3.</span>
                  <span><strong>Areas prone to toner flaking</strong> are ironed out using specially profiled female ring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 font-bold">4.</span>
                  <span><strong>Simple color-coding</strong> maintained—still uses orange, blue, yellow system</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 bg-slate-50 border border-gray-300 p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 bg-blue-500 text-white flex items-center justify-center font-bold">
                i
              </div>
              <div>
                <h4 className="font-bold text-gray-900 mb-2">Available as Complete System or Upgrade</h4>
                <p className="text-sm text-gray-700 mb-2">
                  <strong>Tri-Creaser Advance Complete:</strong> For first-time users looking to introduce unbeatable creasing power to your folding machine. Contains all components needed to produce better defined creasing.
                </p>
                <p className="text-sm text-gray-700">
                  <strong>Tri-Creaser Advance Upgrade:</strong> For existing Tri-Creaser Easy-Fit or Fast-Fit users. Use your existing male components in combination with the Tri-Creaser Advance Female.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Customer Testimonials */}
      <section className="py-10 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-6 pb-3 border-b border-white/20">
            <div className="inline-block bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2 text-orange-300">
              Real Results from Real Printers
            </div>
            <h2 className="text-2xl font-bold">ROI That Speaks for Itself</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white/10 border border-white/20 p-6">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                "We purchased the Tri-Creaser Easy Fit in August and it has only taken us <strong className="text-white">four weeks to recover our investment</strong>. Now that we know the system works so well we <strong className="text-white">estimate that it may save us £20,000 in the next 12 months.</strong>"
              </p>
              <div className="text-sm">
                <div className="font-bold text-white">Andy Coles</div>
                <div className="text-xs text-gray-400">Wyndeham Westway, Luton, UK</div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 p-6">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                "The savings we made by not having to send out for scoring <strong className="text-white">paid for our Tri-creaser on the first job!</strong>"
              </p>
              <div className="text-sm">
                <div className="font-bold text-white">Bob Humphrys</div>
                <div className="text-xs text-gray-400">Wessex Binding Services, Wimbourne</div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 p-6">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                "We had a difficult job with bleeds on both sides and the grain going the wrong way, the outside looked great but the inside was cracking. We just got a new Tri-Creaser Advance in and after a little trial and error, both sides looked great. <strong className="text-white">We only had 1, the next day I ordered 2 more.</strong> We delivered that job on time and it saved us from getting a letterpress score and missing a deadline."
              </p>
              <div className="text-sm">
                <div className="font-bold text-white">Jim Navulis</div>
                <div className="text-xs text-gray-400">Haapanen Brothers, Illinois, USA</div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white/10 border border-white/20 p-6">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                "We have used the Tech-ni-Fold Tri-Creaser in-line on our folders for a number of years, it is a very quick system to make ready and <strong className="text-white">the results are equal to a cylinder crease.</strong> Because we can crease in-line, we are able to <strong className="text-white">achieve speeds of up to 30k sheets per hour</strong> on our Heidelberg Stahl folders, eliminating all cracking across a multitude of stock types."
              </p>
              <div className="text-sm">
                <div className="font-bold text-white">Jake Whitford</div>
                <div className="text-xs text-gray-400">Pepper Communications Ltd</div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 p-6">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                "We run a 300gsm silk job for a perfume brand. The job is laminated on the outside but not on the inside. <strong className="text-white">The Tri-Creaser Advance gives a beautiful square crease result on the inside of the fold</strong> by producing a deeper impression. The Tri-Creaser Advance is an improvement even on previous versions."
              </p>
              <div className="text-sm">
                <div className="font-bold text-white">Tony Puxty</div>
                <div className="text-xs text-gray-400">Fontain, London, UK</div>
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
              <h2 className="text-2xl font-bold mb-2">Ready To Eliminate Cracking Forever?</h2>
              <p className="text-orange-100">
                Join 40,000+ installations worldwide. Most companies see full payback within 1-3 job runs.
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
