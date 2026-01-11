'use client';

import { TrialRequestForm } from './TrialRequestForm';

interface SpineCreaserNarrativeProps {
  machine: {
    machine_id: string;
    brand: string;
    model: string;
    type: string;
    display_name: string;
  };
}

export function SpineCreaserNarrative({ machine }: SpineCreaserNarrativeProps) {
  return (
    <article className="bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white py-12 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-cyan-400 text-sm font-medium tracking-wide uppercase mb-3">
            Technifold Technical Reference
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-white leading-tight">
            Stop Fibre-Cracking, Weak Spines and Cover Waste on Your{' '}
            <span className="font-medium">{machine.display_name}</span> — Permanently
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Introduction */}
        <section className="mb-12">
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Your saddle stitcher, booklet maker or cover feeder is an exceptional machine. It feeds, aligns, collates, stitches and trims with impressive consistency — but it suffers from one unavoidable weakness:
          </p>

          <p className="text-lg text-slate-800 font-medium leading-relaxed mb-6">
            The single cover crease.
          </p>

          <div className="text-slate-800 leading-relaxed space-y-4 mb-8">
            <p>OEM scoring wheels were never engineered to crease premium cover stocks cleanly and consistently. They cut. They slice. They drag fibres apart. And they leave operators fighting the same faults day after day.</p>

            <p>If you've ever had to deal with fibre-cracking on the outside spine, ugly white break lines across the cover, laminated covers splitting as soon as they fold, visible stress marks on thicker stocks, covers weakening around the stitched spine, "one angle wrong" leading to a ruined run, endless operator adjustments, or high setup waste before the job even starts — none of this is caused by your {machine.display_name}.</p>
          </div>

          <p className="text-slate-900 font-medium text-lg border-l-2 border-cyan-500 pl-4">
            It's the tooling.
          </p>
        </section>

        {/* Video Reference */}
        <aside className="mb-12 bg-slate-50 border border-slate-200 p-6">
          <p className="text-sm text-slate-700 uppercase tracking-wide mb-3">Technical Demonstration</p>
          <div className="aspect-video">
            <iframe
              src="https://www.youtube.com/embed/bdiPRqmoSj8"
              title="Spine Creaser demonstration"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </aside>

        {/* Why OEM Metal Scoring Fails */}
        <section className="mb-12 pb-12 border-b border-slate-200">
          <h2 className="text-2xl font-medium text-slate-900 mb-6">
            Why OEM Metal Scoring Will Always Fail
          </h2>

          <p className="text-slate-800 leading-relaxed mb-6">
            Traditional scoring wheels operate by slicing through fibres and dragging the substrate downwards into a crude channel. This creates fibre cracking, laminate lifting, weak spine formation, inconsistent crease depth, setup waste, and increased operator intervention.
          </p>

          <p className="text-slate-800 leading-relaxed mb-6">
            And because metal scoring is a single-action process, it offers almost no control over crease width, crease depth, substrate sensitivity, laminate behaviour, toner brittleness, or grain direction issues.
          </p>

          <p className="text-slate-800 leading-relaxed">
            Even on high-end booklet makers and stitchers, the scoring system is the bottleneck. The machine itself isn't the problem — the scoring wheel is.
          </p>
        </section>

        {/* The Spine Creaser Solution */}
        <section className="mb-12 pb-12 border-b border-slate-200">
          <h2 className="text-2xl font-medium text-slate-900 mb-6">
            The Technifold Spine-Creaser Turns Your {machine.display_name} Into a Premium Cover-Finishing System
          </h2>

          <div className="md:flex md:gap-8 mb-6">
            <div className="md:flex-1">
              <p className="text-slate-800 leading-relaxed mb-4">
                The Technifold Spine-Creaser replaces the metal scoring wheel with a precision-engineered rotary creasing mechanism that gently manipulates fibres instead of tearing them.
              </p>

              <p className="text-slate-800 leading-relaxed mb-4">
                Its design is built around gentle rotary action, patented split-band technology for easy band replacement, adjustable crease width and depth, substrate-responsive tooling, non-destructive pressure distribution, and consistent results on every stock type.
              </p>

              <p className="text-slate-800 leading-relaxed mb-4">
                This combination allows the Spine-Creaser to create a controlled, professional, non-cracking single spine crease on any cover substrate.
              </p>

              <p className="text-slate-900 font-medium">
                You're not improving the {machine.display_name}. You're fixing its only real weakness.
              </p>
            </div>

            <figure className="md:w-64 mt-6 md:mt-0 flex-shrink-0">
              <img
                src="/images/products/spine-creaser-action.jpg"
                alt="Spine Creaser creating perfect inline cover creases"
                className="w-full border border-slate-200"
              />
              <figcaption className="text-xs text-slate-700 mt-2">Fig. 1 — Spine Creaser module</figcaption>
            </figure>
          </div>
        </section>

        {/* What the Spine Creaser Does Differently */}
        <section className="mb-12 pb-12 border-b border-slate-200">
          <h2 className="text-2xl font-medium text-slate-900 mb-6">
            What the Spine-Creaser Does Differently
          </h2>

          {/* Capability 1 */}
          <div className="mb-10">
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              1. Eliminates Fibre Cracking Completely
            </h3>

            <div className="md:flex md:gap-8">
              <div className="md:flex-1">
                <p className="text-slate-800 leading-relaxed mb-4">
                  Every PDF, brochure and field installation says the same thing: "Stops fibre cracking 100%."
                </p>

                <p className="text-slate-800 leading-relaxed mb-4">
                  Operators see clean, crisp, professional spines with no white break lines, no fibre disruption, and no cover rejection during QC.
                </p>

                <p className="text-slate-800 leading-relaxed">
                  Whether you run coated, uncoated, laminated or digital short-grain stocks — you get consistent, sale-ready creases every time.
                </p>
              </div>

              <figure className="md:w-48 mt-4 md:mt-0 flex-shrink-0">
                <img src="/images/results/spine-creaser-result-1.jpg" alt="Perfect spine crease" className="w-full border border-slate-300" />
                <figcaption className="text-xs text-slate-700 mt-1">Perfect spine crease result</figcaption>
              </figure>
            </div>
          </div>

          {/* Capability 2 */}
          <div className="mb-10">
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              2. Prevents Laminate Lifting — Permanently
            </h3>

            <p className="text-slate-800 leading-relaxed mb-4">
              Metal scoring pulls laminate apart. The Spine-Creaser prevents it. By using a dual-direction, non-destructive pressure profile, it keeps the laminate layer fully bonded even on heavy laminated covers, gloss films, matt soft-touch laminates, and textured premium finishes.
            </p>

            <p className="text-slate-800 leading-relaxed">
              This makes premium cover work far more reliable and profitable.
            </p>
          </div>

          {/* Capability 3 */}
          <div className="mb-10">
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              3. Creates a Strong, Consistent, Non-Cracking Single Spine Crease
            </h3>

            <p className="text-slate-800 leading-relaxed mb-4">
              OEM scoring gives you one static, often-destructive crease. The Spine-Creaser gives you true creasing control, letting you fine-tune crease depth, crease width, and substrate response.
            </p>

            <p className="text-slate-800 leading-relaxed">
              The result is a reinforced, reliable spine crease that folds cleanly around the stitched text block — without cracking, tearing or bursting fibres. This is the crease that prevents failures in production and ensures every booklet leaves the machine sale-ready.
            </p>
          </div>

          {/* Capability 4 */}
          <div className="mb-10">
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              4. Dramatically Reduces Setup Waste
            </h3>

            <p className="text-slate-800 leading-relaxed mb-4">
              Metal scoring causes cracking within the first few covers, tearing during setup, adjustments that never quite stabilise, and burning through 20–50 covers before production settles.
            </p>

            <p className="text-slate-800 leading-relaxed">
              The Spine-Creaser stops this completely. From sheet one, the crease is clean, controlled and repeatable. Operators stop firefighting and start producing.
            </p>
          </div>

          {/* Capability 5 */}
          <div>
            <h3 className="text-lg font-medium text-slate-900 mb-3">
              5. Works at Full Machine Speed
            </h3>

            <p className="text-slate-800 leading-relaxed">
              Many finishing upgrades slow the line down. This doesn't. The Spine-Creaser runs at whatever speed your {machine.display_name} can achieve — with zero loss of quality.
            </p>
          </div>
        </section>

        {/* Business Impact */}
        <section className="mb-12">
          <h2 className="text-2xl font-medium text-slate-900 mb-6">
            What This Means for Your Business
          </h2>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-slate-800 mb-8">
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Zero substrate cracking</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Zero laminate failures</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Zero weak spine creases</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Zero wasted covers during setup</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Fewer customer complaints</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Faster turnaround</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Higher utilisation of your stitcher/booklet maker</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>More premium cover work accepted confidently</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Less operator stress, far fewer adjustments</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>More jobs completed per shift</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Lower labour cost per run</span>
            </div>
          </div>
        </section>

        {/* ROI Section */}
        <section className="mb-12">
          <h2 className="text-2xl font-medium text-slate-900 mb-6">
            Real-World ROI (Based on Global Installations)
          </h2>

          <p className="text-slate-800 leading-relaxed mb-6">
            Across more than 20 years of installations on over 100,000 finishing machines worldwide, customers consistently report savings of £1,000–£5,000 per month, payback in just a handful of runs, major reduction in setup waste, and significant increase in premium cover jobs won.
          </p>

          <p className="text-slate-800 leading-relaxed">
            If your {machine.display_name} runs covers weekly, the Spine-Creaser is a financial no-brainer.
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
              <p className="text-slate-700 text-sm">Installations</p>
            </div>
            <div>
              <p className="text-2xl font-light">20+</p>
              <p className="text-slate-700 text-sm">Years in Field</p>
            </div>
            <div>
              <p className="text-2xl font-light">£5K+</p>
              <p className="text-slate-700 text-sm">Monthly Savings</p>
            </div>
            <div>
              <p className="text-2xl font-light">30</p>
              <p className="text-slate-700 text-sm">Day Trial Period</p>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="border-t border-slate-200 pt-12">
          <h2 className="text-2xl font-medium text-slate-900 mb-4">
            Request Your 30-Day Trial
          </h2>

          <p className="text-slate-800 leading-relaxed mb-6">
            Every Technifold tool is available for a 30-day evaluation on your {machine.display_name}. There is no obligation and no charge for the trial period. If the results don't meet expectations, return the tooling at no cost.
          </p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 border border-slate-200 p-6 rounded">
              <TrialRequestForm machine={machine} />
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-slate-800 mb-4">
                Prefer to speak with someone?
              </p>
              <a href="tel:+441455381538" className="inline-flex items-center gap-2 text-slate-900 font-medium hover:text-cyan-600 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +44 (0)1455 381 538
              </a>
              <p className="text-sm text-slate-700 mt-2">
                Technical enquiries welcome
              </p>
            </div>
          </div>
        </section>

      </div>
    </article>
  );
}
