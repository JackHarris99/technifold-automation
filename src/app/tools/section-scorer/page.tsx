import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Section-Scorer - 3x Deeper Scoring for Signature Work | Technifold',
  description: 'Eliminate crow\'s feet and inconsistent folds on signature work. 3x deeper scores than OEM tools. Color-coded 8-setting system for 4 to 64-page sections. Perfect for book and magazine production.',
};

export default function SectionScorerPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Compact Hero */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
          <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold mb-3 text-orange-300 inline-flex">
            Signature & Section Specialist
          </div>

          <h1 className="text-4xl font-bold mb-4 leading-tight">
            Section-Scorer<br />3x Deeper Scores for Perfect Signature Work
          </h1>
          <p className="text-lg text-gray-300 mb-2 max-w-3xl leading-relaxed">
            <strong>Producing 8, 16, 32, or 64-page signatures with crow's feet wrinkles and inconsistent folds?</strong> Section-Scorer replaces your OEM scoring tools with a system that delivers 3x deeper scores—ensuring sections fold tightly, register perfectly, and look professional.
          </p>
          <p className="text-base text-gray-400 mb-6 max-w-3xl">
            OEM scoring tools haven't evolved since 1850. Section-Scorer modernizes your folder with 8 color-coded settings that eliminate operator guesswork and deliver consistent results on all signature work.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">3x</div>
              <div className="text-xs text-gray-400">Deeper Than OEM</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">8</div>
              <div className="text-xs text-gray-400">Color-Coded Settings</div>
            </div>
            <div className="bg-white/10 border border-white/20 px-3 py-2 text-center">
              <div className="text-2xl font-bold">Zero</div>
              <div className="text-xs text-gray-400">Operator Guesswork</div>
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
            </div>

            <div>
              <img
                src="/images/products/section-scorer-action.jpg"
                alt="Section-Scorer installed on machine"
                className="w-full rounded-lg shadow-2xl border border-white/20"
              />
              <p className="text-sm text-gray-400 text-center mt-3">
                Section-Scorer delivering deep scoring impressions
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
                The 1850 Problem
              </div>
              <h2 className="text-2xl font-bold text-gray-900">OEM Scoring Tools Haven't Evolved in 174 Years</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Why OEM Scoring Fails on Signature Work</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                <strong>Your folder's OEM scoring tools use the exact same design from 1850.</strong> That shallow V-shaped scoring might have been acceptable for simple folding, but it's catastrophically inadequate for signature and section work in modern book and magazine production.
              </p>
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
                <p className="text-sm font-bold text-red-900 mb-2">What goes wrong with shallow OEM scoring:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">1.</span>
                    <span><strong>Crow's feet wrinkles</strong> appear at fold lines—unprofessional appearance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">2.</span>
                    <span><strong>Inconsistent folding</strong>—sections don't fold exactly where intended</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">3.</span>
                    <span><strong>Registration problems</strong> when multiple sections are gathered</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">4.</span>
                    <span><strong>Sections won't fold tight</strong>—causing feeding issues in binding equipment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">5.</span>
                    <span><strong>Operator guesswork</strong>—no clear system for choosing settings</span>
                  </li>
                </ul>
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">
                For book and magazine production, sections must fold tightly, register precisely with other sections, and maintain a flat, wrinkle-free appearance. <strong>OEM scoring simply isn't deep enough to achieve this.</strong>
              </p>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">The Section-Scorer Solution</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                <strong>3 times deeper scoring with 8 color-coded settings</strong> that eliminate all operator guesswork. Sections fold exactly where intended, every time—tight enough for perfect registration and binding.
              </p>
              <div className="bg-white border-l-4 border-green-500 p-4 mb-4">
                <p className="text-sm font-bold text-green-900 mb-2">Modern Engineering Replaces 1850 Design:</p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>3x deeper penetration</strong> than OEM tools</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>8 pre-determined settings</strong> for varying widths and depths</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>4 color-coded scoring ribs</strong> matched to stock weights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">▸</span>
                    <span><strong>8 color-coded female channels</strong> matched to rib settings</span>
                  </li>
                </ul>
              </div>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Eliminates crow's feet wrinkles</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>100% consistent folding</strong> with the score</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Perfect registration</strong> between sections</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Sections fold tight</strong> for downstream binding</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span><strong>Zero operator guesswork</strong>—match color to stock weight</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Color-Coding System - Compact */}
      <section className="py-10 bg-white border-t border-gray-300">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-slate-800 text-white px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                The Innovation
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Instant Operator Expertise Through Color-Coding</h2>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-orange-500 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">4 Color-Coded Scoring Ribs</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    <strong>Each color represents a specific stock weight range.</strong> Light stocks use one color, medium another, heavy a third, extra-heavy a fourth. Operator simply selects the rib color matching their stock weight.
                  </p>
                  <p className="text-sm text-orange-600 font-semibold">
                    Result: Even inexperienced operators become scoring experts instantly
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
                  <h3 className="text-xl font-bold text-gray-900 mb-2">8 Color-Coded Female Channels</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    <strong>Pre-determined channel widths matched to male ribs.</strong> Each channel creates the perfect score width for its corresponding rib—simply match the colors and you're guaranteed optimal results.
                  </p>
                  <p className="text-sm text-orange-600 font-semibold">
                    Result: Takes away all operator guesswork
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Split Design for Fast Changeovers</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    <strong>Male hub splits open/closed to lock ribs securely—no shaft removal required.</strong> Scoring ribs feature split design for quick insertion. Change settings between jobs in minutes.
                  </p>
                  <p className="text-sm text-green-600 font-semibold">
                    Result: Quick changeovers without complex disassembly
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border-2 border-blue-500 p-6">
              <div className="flex items-start gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold flex-shrink-0">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Non-Abrasive Plastic Construction</h3>
                  <p className="text-sm text-gray-700 leading-relaxed mb-2">
                    <strong>Engineered plastic ribs won't damage stock surfaces—unlike abrasive metal OEM tools.</strong> Delivers deeper penetration without surface marking, even on coated stocks.
                  </p>
                  <p className="text-sm text-blue-600 font-semibold">
                    Result: Deep scores without surface damage
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
                Perfect For
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Signature & Section Work for Books and Magazines</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Signature Production</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                <strong>Perfect for producing 4, 8, 16, 32, and 64-page sections</strong> for book and magazine production. Sections must fold tightly and register precisely—Section-Scorer's 3x deeper scores ensure this happens consistently.
              </p>
              <div className="bg-slate-50 p-3">
                <p className="text-xs font-bold text-slate-900 mb-2">Signature sizes handled:</p>
                <div className="grid grid-cols-2 gap-2 text-xs text-gray-700">
                  <div className="flex items-start gap-1">
                    <span className="text-orange-500">•</span>
                    <span>4-page sections</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-orange-500">•</span>
                    <span>8-page sections</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-orange-500">•</span>
                    <span>16-page sections</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-orange-500">•</span>
                    <span>32-page sections</span>
                  </div>
                  <div className="flex items-start gap-1">
                    <span className="text-orange-500">•</span>
                    <span>64-page sections</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">General Folding Applications</h3>
              <p className="text-sm text-gray-700 mb-4 leading-relaxed">
                While optimized for signature work, <strong>Section-Scorer handles everyday folding on all media types.</strong> The 8 settings and color-coding system make it versatile enough for any job requiring consistent scoring.
              </p>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Full range of media types</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Light to extra-heavy stocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Any job requiring consistent scoring</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✓</span>
                  <span>Works alongside Tri-Creaser for crease-fold work</span>
                </li>
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
                Business Impact
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Why Book & Magazine Producers Choose Section-Scorer</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-green-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                1
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Eliminate Crow's Feet Forever</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>No more unsightly wrinkles at fold lines.</strong> Section-Scorer's 3x deeper penetration ensures sections fold cleanly and tightly—professional appearance on every signature.
              </p>
              <p className="text-xs text-green-600 font-semibold">
                Result: Premium quality for high-end book and magazine work
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-orange-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                2
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Perfect Registration Between Sections</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Sections fold exactly where intended, every time.</strong> When multiple sections are gathered for binding, they register precisely—eliminating alignment problems in finished books.
              </p>
              <p className="text-xs text-orange-600 font-semibold">
                Result: Consistent, professional binding results
              </p>
            </div>

            <div className="bg-slate-50 border-2 border-slate-300 p-6">
              <div className="bg-blue-600 text-white w-10 h-10 flex items-center justify-center text-lg font-bold mb-3">
                3
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-3">Zero Operator Guesswork</h3>
              <p className="text-sm text-gray-700 leading-relaxed mb-4">
                <strong>Color-coding system eliminates trial and error.</strong> Operator matches rib color to stock weight, matches channel color to rib—guaranteed optimal results without expertise.
              </p>
              <p className="text-xs text-blue-600 font-semibold">
                Result: Instant operator expertise, faster training, consistent quality
              </p>
            </div>
          </div>

          <div className="mt-6 bg-slate-100 border-2 border-slate-300 p-6">
            <h3 className="text-base font-bold text-gray-900 mb-3">Additional Benefits:</h3>
            <div className="grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>3x deeper scores</strong> than OEM tools—proven measurement</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>8 adjustable settings</strong> for full range of stocks</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Split design</strong> for quick insertion without shaft removal</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Non-abrasive plastic</strong> won't damage stock surfaces</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>Simple instruction guide</strong>—up and running in minutes</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-orange-500 font-bold">•</span>
                <span><strong>3-month 100% money-back guarantee</strong></span>
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
              <h2 className="text-2xl font-bold mb-2">Modernize Your 1850 Scoring Technology</h2>
              <p className="text-orange-100">
                See how Section-Scorer eliminates crow's feet and delivers perfect signature folding. 3x deeper scores with zero operator guesswork.
              </p>
            </div>
            <a
              href="/contact"
              className="bg-slate-900 text-white px-8 py-3 font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Request Free Trial →
            </a>
          </div>
          <p className="mt-4 text-sm text-orange-100 text-center md:text-left">3-month 100% money-back guarantee • Try risk-free on your signature work</p>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}
