'use client';

import { TrialRequestForm } from './TrialRequestForm';

interface PerfectBinderNarrativeProps {
  machine: {
    machine_id: string;
    brand: string;
    model: string;
    type: string;
    display_name: string;
  };
}

export function PerfectBinderNarrative({ machine }: PerfectBinderNarrativeProps) {
  return (
    <article className="bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white py-12 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-cyan-400 text-sm font-medium tracking-wide uppercase mb-3">
            Technifold Technical Reference
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-white leading-tight">
            Stop Fibre-Cracking, Laminate Lifting and Slow Makereadies on Your{' '}
            <span className="font-medium">{machine.display_name}</span> — Permanently
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Introduction */}
        <section className="mb-12">
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Your perfect binder is an incredible machine. It handles feeding, gluing, nipping and trimming with astonishing reliability — but it has one fatal weak link:
          </p>

          <p className="text-lg text-slate-800 font-medium leading-relaxed mb-6">
            The cover-feeder's rotary metal scoring system.
          </p>

          <div className="text-slate-600 leading-relaxed space-y-4 mb-8">
            <p>It wasn't engineered for modern coated stocks. It wasn't engineered for premium finishes. And it certainly wasn't engineered for digital, laminated or short-grain work.</p>

            <p>If your operators are fighting fibre-cracking along the spine, laminate lifting on premium covers, weak shallow hinge lines, spine splitting during setup, covers tearing at the fold during feeding, slow makeready whenever stock changes, or inconsistent creases from run to run — none of that is because your {machine.display_name} is "old" or "fussy."</p>
          </div>

          <p className="text-slate-900 font-medium text-lg border-l-2 border-cyan-500 pl-4">
            It's the scoring system. And it's holding the machine back.
          </p>
        </section>

        {/* Video Reference */}
        <aside className="mb-12 bg-slate-50 border border-slate-200 p-6">
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-3">Technical Demonstration</p>
          <div className="aspect-video">
            <iframe
              src="https://www.youtube.com/embed/2_76v5KYx5U"
              title="Quad-Creaser demonstration"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </aside>

        {/* Why Metal Scoring Fails */}
        <section className="mb-12 pb-12 border-b border-slate-200">
          <h2 className="text-2xl font-medium text-slate-900 mb-6">
            Why Metal Scoring Fails — and Always Will
          </h2>

          <p className="text-slate-600 leading-relaxed mb-6">
            Rotary metal scoring wheels are fundamentally flawed because they slice through fibres, instead of working with them. That action causes fibre cracking, laminate delamination, cover weakness at the hinge, excessive operator intervention, and spine "popping" shortly after folding.
          </p>

          <p className="text-slate-600 leading-relaxed mb-6">
            And because the metal wheel can only cut in one way, there's no meaningful control over crease width, crease depth, stock compensation, coating sensitivity, or digital toner behaviour.
          </p>

          <p className="text-slate-600 leading-relaxed">
            Operators are forced to "fight" the cover every time the substrate changes.
          </p>
        </section>

        {/* The Quad Creaser Solution */}
        <section className="mb-12 pb-12 border-b border-slate-200">
          <h2 className="text-2xl font-medium text-slate-900 mb-6">
            The Quad Creaser Turns Your {machine.display_name} Into a Precision Creasing System
          </h2>

          <div className="md:flex md:gap-8 mb-6">
            <div className="md:flex-1">
              <p className="text-slate-600 leading-relaxed mb-4">
                The Technifold Quad Creaser replaces the metal scoring wheel with a true fibre-friendly creasing mechanism engineered around gentle rotary action, substrate-responsive rubber profiles, adjustable crease width and depth, adjustable hinge width, non-destructive pressure distribution, and replaceable split-band design for consumable renewal.
              </p>

              <p className="text-slate-600 leading-relaxed mb-4">
                The result is the closest thing to a letterpress-quality hinge you can achieve on a rotary perfect binder — without damaging fibres or lifting laminate.
              </p>

              <p className="text-slate-900 font-medium">
                Zero cracking. Zero tearing. Zero laminate lifting. At any production speed.
              </p>
            </div>

            <figure className="md:w-64 mt-6 md:mt-0 flex-shrink-0">
              <img
                src="/images/products/quad-creaser-action.jpg"
                alt="Quad Creaser installed on perfect binder"
                className="w-full border border-slate-200"
              />
              <figcaption className="text-xs text-slate-400 mt-2">Fig. 1 — Quad Creaser module</figcaption>
            </figure>
          </div>
        </section>

        {/* What the Quad Creaser Does Differently */}
        <section className="mb-12 pb-12 border-b border-slate-200">
          <h2 className="text-2xl font-medium text-slate-900 mb-6">
            What the Quad Creaser Does Differently
          </h2>

          {/* Capability 1 */}
          <div className="mb-10">
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              1. Eliminates Fibre Cracking Completely
            </h3>

            <div className="md:flex md:gap-8">
              <div className="md:flex-1">
                <p className="text-slate-600 leading-relaxed mb-4">
                  The Quad Creaser completely eliminates fibre cracking 100%. This applies to coated stocks, laminated covers, UV varnished covers, digital short-grain work, and heavy 300–400gsm materials.
                </p>

                <p className="text-slate-600 leading-relaxed">
                  Where metal scoring destroys fibres, the Quad Creaser uses gentle, controlled, rubber-based pressure to create a strong, flexible hinge without any surface damage.
                </p>
              </div>

              <div className="md:w-48 mt-4 md:mt-0 flex-shrink-0 space-y-3">
                <figure>
                  <img src="/images/results/cover-crease-before.JPG" alt="Cover cracking before" className="w-full border border-slate-300" />
                  <figcaption className="text-xs text-slate-400 mt-1">Before: OEM scoring</figcaption>
                </figure>
                <figure>
                  <img src="/images/results/cover-crease-after.JPG" alt="Perfect crease after" className="w-full border border-slate-300" />
                  <figcaption className="text-xs text-slate-400 mt-1">After: Quad Creaser</figcaption>
                </figure>
              </div>
            </div>
          </div>

          {/* Capability 2 */}
          <div className="mb-10">
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              2. Eliminates Laminate Lifting Permanently
            </h3>

            <p className="text-slate-600 leading-relaxed mb-4">
              Metal scoring knives pull laminate apart. The Quad Creaser supports the surface layer during hinge formation to prevent film break, film lift, and film curl. This unlocks premium cover options without risk.
            </p>
          </div>

          {/* Capability 3 */}
          <div className="mb-10">
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              3. Creates Stronger, Deeper and More Consistent Hinges
            </h3>

            <p className="text-slate-600 leading-relaxed mb-4">
              Metal scoring gives you one crease. The Quad Creaser gives precise control over crease width, crease depth, and hinge width. Operators can create soft creases for lighter stocks, deeper reinforced hinges for heavy covers, and adjust hinge width for laminate behaviour — achieving consistent results over long runs.
            </p>

            <p className="text-slate-600 leading-relaxed">
              This is genuine tooling control — not "press harder / press softer."
            </p>
          </div>

          {/* Capability 4 */}
          <div className="mb-10">
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              4. Stops Setup Waste Dead
            </h3>

            <p className="text-slate-600 leading-relaxed">
              OEM scoring regularly splits, tears or ruins covers during setup. With Quad Creaser: no tearing, no splitting, no bursting, no laminate lift, no reprint cascade. From sheet one, results are sale-ready.
            </p>
          </div>

          {/* Capability 5 */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              5. Works at Full Machine Speed
            </h3>

            <p className="text-slate-600 leading-relaxed">
              Most finishing tools slow a machine down. The Quad Creaser does not. It works as fast as the machine can run. If your {machine.display_name} can run 6,000 cycles/hour, the Quad Creaser runs 6,000.
            </p>
          </div>
        </section>

        {/* Business Impact */}
        <section className="mb-12">
          <h2 className="text-2xl font-medium text-slate-900 mb-6">
            What This Means for Your Business
          </h2>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-slate-600 mb-8">
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Fewer reprints from cracked or delaminated covers</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Fewer customer complaints</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Faster job turnaround</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Better utilisation of your perfect binder</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Take on more premium cover work confidently</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Lower labour cost per job</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Increased profitability</span>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Your perfect binder becomes a reliable high-end finishing asset — not a bottleneck.
          </p>
        </section>

        {/* Technical Specifications Reference */}
        <section className="mb-12 bg-slate-900 text-white p-6">
          <p className="text-cyan-400 text-sm font-medium tracking-wide uppercase mb-3">
            Performance Data
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <p className="text-2xl font-light">100K+</p>
              <p className="text-slate-400 text-sm">Installations</p>
            </div>
            <div>
              <p className="text-2xl font-light">20+</p>
              <p className="text-slate-400 text-sm">Years in Field</p>
            </div>
            <div>
              <p className="text-2xl font-light">£5K+</p>
              <p className="text-slate-400 text-sm">Monthly Savings</p>
            </div>
            <div>
              <p className="text-2xl font-light">30</p>
              <p className="text-slate-400 text-sm">Day Trial Period</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-medium text-slate-900 mb-4">
            Request Your 30-Day Trial
          </h2>

          <p className="text-slate-600 leading-relaxed mb-6">
            Every Technifold tool is available for a 30-day evaluation on your {machine.display_name}. There is no obligation and no charge for the trial period. If the results don't meet expectations, return the tooling at no cost.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded">
              <TrialRequestForm machine={machine} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-slate-600 mb-4">
                Prefer to speak with someone?
              </p>
              <a href="tel:+441455381538" className="inline-flex items-center gap-2 text-slate-900 font-medium hover:text-cyan-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +44 (0)1455 381 538
              </a>
              <p className="text-sm text-slate-500 mt-2">
                Technical enquiries welcome
              </p>
            </div>
          </div>
        </section>

      </div>
    </article>
  );
}
