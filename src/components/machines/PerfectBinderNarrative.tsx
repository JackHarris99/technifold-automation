interface PerfectBinderNarrativeProps {
  machine: {
    display_name: string;
  };
}

export function PerfectBinderNarrative({ machine }: PerfectBinderNarrativeProps) {
  return (
    <div className="py-16">
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
          Stop Fibre-Cracking, Laminate Lifting and Slow Makereadies on Your {machine.display_name} — Permanently
        </h1>

        {/* CTA Block */}
        <div className="bg-slate-900 text-white p-8 rounded-lg mt-8">
          <h2 className="text-2xl font-semibold mb-2">
            Unlock the full potential of your {machine.display_name}
          </h2>
          <p className="text-gray-300 mb-4">
            Register below to begin your free 30-day trial.
          </p>
          <button className="bg-orange-500 text-white px-8 py-3 font-bold hover:bg-orange-600 transition-colors">
            Register for Free Trial
          </button>
        </div>
      </section>

      {/* INTRO PROBLEM SECTION */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          <div>
            <p className="text-gray-700 mb-4">
              Your perfect binder is an incredible machine.
            </p>

            <p className="text-gray-700 mb-4">
              It handles feeding, gluing, nipping and trimming with astonishing reliability — but it has one fatal weak link:
            </p>

            <p className="text-gray-900 font-semibold mb-4">
              The cover-feeder's rotary metal scoring system.
            </p>

            <p className="text-gray-700 mb-2">
              It wasn't engineered for modern coated stocks.
            </p>
            <p className="text-gray-700 mb-2">
              It wasn't engineered for premium finishes.
            </p>
            <p className="text-gray-700 mb-4">
              And it certainly wasn't engineered for digital, laminated or short-grain work.
            </p>

            <p className="text-gray-700 mb-4">If your operators are fighting:</p>

            <ul className="text-gray-700 mb-6 space-y-1">
              <li>fibre-cracking along the spine</li>
              <li>laminate lifting on premium covers</li>
              <li>weak, shallow hinge lines</li>
              <li>spine splitting during setup</li>
              <li>covers tearing at the fold during feeding</li>
              <li>slow makeready whenever stock changes</li>
              <li>inconsistent creases from run to run</li>
            </ul>

            <p className="text-gray-700 mb-4">
              …none of that is because your {machine.display_name} is "old" or "fussy."
            </p>

            <p className="text-gray-700 mb-1">
              It's the scoring system.
            </p>
            <p className="text-gray-900 font-semibold">
              And it's holding the machine back.
            </p>
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/2_76v5KYx5U"
              title="Quad-Creaser demonstration"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video"
            />
          </div>
        </div>
      </section>

      {/* WHY METAL SCORING FAILS SECTION */}
      <section className="bg-gray-50 py-12 mb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Why Metal Scoring Fails — and Always Will
          </h2>

          <p className="text-gray-700 mb-4">
            Rotary metal scoring wheels are fundamentally flawed because they slice through fibres, instead of working with them.
          </p>

          <p className="text-gray-700 mb-4">That action causes:</p>

          <ul className="text-gray-700 mb-6 space-y-2">
            <li>❌ fibre cracking</li>
            <li>❌ laminate delamination</li>
            <li>❌ cover weakness at the hinge</li>
            <li>❌ excessive operator intervention</li>
            <li>❌ spine "popping" shortly after folding</li>
          </ul>

          <p className="text-gray-700 mb-4">
            And because the metal wheel can only cut in one way, there's no meaningful control over:
          </p>

          <ul className="text-gray-700 mb-6 space-y-1">
            <li>crease width</li>
            <li>crease depth</li>
            <li>stock compensation</li>
            <li>coating sensitivity</li>
            <li>digital toner behaviour</li>
          </ul>

          <p className="text-gray-700">
            Operators are forced to "fight" the cover every time the substrate changes.
          </p>
        </div>
      </section>

      {/* QUAD CREASER OVERVIEW SECTION */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              The Quad Creaser Turns Your {machine.display_name} Into a Precision Creasing System
            </h2>

            <p className="text-gray-700 mb-4">
              The Technifold Quad Creaser replaces the metal scoring wheel with a true fibre-friendly creasing mechanism engineered around:
            </p>

            <ul className="text-gray-700 mb-6 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>gentle rotary action</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>substrate-responsive rubber profiles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>adjustable crease width and depth</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>adjustable hinge width</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>non-destructive pressure distribution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>replaceable split-band design (for consumable renewal)</span>
              </li>
            </ul>

            <p className="text-gray-700 mb-4">
              The result is the closest thing to a letterpress-quality hinge you can achieve on a rotary perfect binder — without damaging fibres or lifting laminate.
            </p>

            <p className="text-gray-900 font-semibold">
              Zero cracking. Zero tearing. Zero laminate lifting.<br />
              At any production speed.
            </p>
          </div>

          <div className="space-y-4">
            <img
              src="/images/products/quad-creaser-action.jpg"
              alt="Quad Creaser installed on perfect binder"
              className="w-full rounded-lg shadow-lg"
            />
            <img
              src="/images/products/quad-creaser-color-ribs.jpg"
              alt="Quad Creaser colour-coded ribs for easy setup"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* WHAT THE QUAD CREASER DOES DIFFERENTLY */}
      <section className="bg-gray-50 py-12 mb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            What the Quad Creaser Does Differently
          </h2>

          {/* CAPABILITY 1 */}
          <div className="grid gap-8 md:grid-cols-2 items-start mb-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                1. Eliminates Fibre Cracking Completely
              </h3>

              <p className="text-gray-700 mb-4">
                Your documentation states clearly that the Quad Creaser:
              </p>

              <p className="text-gray-700 italic mb-4">
                "Completely eliminates fibre cracking 100%."
              </p>

              <p className="text-gray-700 mb-4">This applies to:</p>

              <ul className="text-gray-700 mb-6 space-y-1">
                <li>coated stocks</li>
                <li>laminated covers</li>
                <li>UV varnished covers</li>
                <li>digital short-grain work</li>
                <li>heavy 300–400gsm materials</li>
              </ul>

              <p className="text-gray-700">
                Where metal scoring destroys fibres, the Quad Creaser uses gentle, controlled, rubber-based pressure to create a strong, flexible hinge without any surface damage.
              </p>
            </div>

            <div>
              <img
                src="/images/results/cover-crease-before.JPG"
                alt="Cover cracking before Quad Creaser"
                className="w-full rounded-lg shadow-lg mb-2"
              />
              <p className="text-sm text-gray-500 text-center">Before: Fibre cracking with OEM scoring</p>
            </div>
          </div>

          {/* CAPABILITY 2 */}
          <div className="grid gap-8 md:grid-cols-2 items-start mb-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                2. Eliminates Laminate Lifting Permanently
              </h3>

              <p className="text-gray-700 mb-4">
                Metal scoring knives pull laminate apart.<br />
                The Quad Creaser supports the surface layer during hinge formation to prevent:
              </p>

              <ul className="text-gray-700 mb-6 space-y-1">
                <li>film break</li>
                <li>film lift</li>
                <li>film curl</li>
              </ul>

              <p className="text-gray-700">
                This unlocks premium cover options without risk.
              </p>
            </div>

            <div>
              <img
                src="/images/results/cover-crease-after.JPG"
                alt="Perfect cover crease with Quad Creaser"
                className="w-full rounded-lg shadow-lg mb-2"
              />
              <p className="text-sm text-gray-500 text-center">After: Letterpress-quality crease with Quad Creaser</p>
            </div>
          </div>

          {/* CAPABILITY 3 */}
          <div className="grid gap-8 md:grid-cols-2 items-start mb-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                3. Creates Stronger, Deeper and More Consistent Hinges
              </h3>

              <p className="text-gray-700 mb-4">
                Metal scoring gives you one crease.<br />
                The Quad Creaser gives precise control over:
              </p>

              <ul className="text-gray-700 mb-6 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✔</span>
                  <span>crease width</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✔</span>
                  <span>crease depth</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600">✔</span>
                  <span>hinge width</span>
                </li>
              </ul>

              <p className="text-gray-700 mb-4">Operators can now:</p>

              <ul className="text-gray-700 mb-6 space-y-1">
                <li>create soft creases for lighter stocks</li>
                <li>create deeper, reinforced hinges for heavy covers</li>
                <li>adjust hinge width for laminate behaviour</li>
                <li>achieve consistent results over long runs</li>
              </ul>

              <p className="text-gray-700">
                This is genuine tooling control — not "press harder / press softer."
              </p>
            </div>

            <div>
              <img
                src="/images/products/quad-creaser-installed.JPG"
                alt="Quad Creaser installed showing adjustable settings"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* CAPABILITY 4 */}
          <div className="grid gap-8 md:grid-cols-2 items-start mb-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                4. Stops Setup Waste Dead
              </h3>

              <p className="text-gray-700 mb-4">
                OEM scoring regularly splits, tears or ruins covers during setup.
              </p>

              <p className="text-gray-700 mb-4">With Quad Creaser:</p>

              <ul className="text-gray-700 mb-6 space-y-1">
                <li>no tearing</li>
                <li>no splitting</li>
                <li>no bursting</li>
                <li>no laminate lift</li>
                <li>no reprint cascade</li>
              </ul>

              <p className="text-gray-700">
                From sheet one, results are sale-ready.
              </p>
            </div>

            <div>
              <img
                src="/images/technical/quad-creaser-step1.jpeg"
                alt="Quad Creaser setup step 1"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* CAPABILITY 5 */}
          <div className="grid gap-8 md:grid-cols-2 items-start">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                5. Works at Full Machine Speed
              </h3>

              <p className="text-gray-700 mb-4">
                Most finishing tools slow a machine down.<br />
                The Quad Creaser does not.
              </p>

              <p className="text-gray-700 mb-4">
                As your documentation confirms:
              </p>

              <p className="text-gray-700 italic mb-4">
                "Not limited by speed — works as fast as the machine can run."
              </p>

              <p className="text-gray-700">
                If your {machine.display_name} can run 6,000 cycles/hour, the Quad Creaser runs 6,000.
              </p>
            </div>

            <div>
              <img
                src="/images/products/quad-creaser-main.jpg"
                alt="Quad Creaser main product view"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* BUSINESS ROI SECTION */}
      <section className="max-w-6xl mx-auto px-6 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          What This Means for Your Business
        </h2>

        <ul className="space-y-4">
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✔</span>
            <div>
              <span className="font-semibold text-gray-900">Fewer reprints</span>
              <p className="text-gray-700">Cracked or delaminated covers go straight in the bin. Quad Creaser eliminates that.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✔</span>
            <div>
              <span className="font-semibold text-gray-900">Fewer customer complaints</span>
              <p className="text-gray-700">Covers look clean, tight and professional — every single time.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✔</span>
            <div>
              <span className="font-semibold text-gray-900">Faster job turnaround</span>
              <p className="text-gray-700">No more bindery delays caused by cover scoring issues.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✔</span>
            <div>
              <span className="font-semibold text-gray-900">Better utilisation of your perfect binder</span>
              <p className="text-gray-700">More jobs per shift, fewer interruptions.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✔</span>
            <div>
              <span className="font-semibold text-gray-900">Take on more premium cover work</span>
              <p className="text-gray-700">Run laminates, digital, heavy and coated stocks confidently.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✔</span>
            <div>
              <span className="font-semibold text-gray-900">Lower labour cost per job</span>
              <p className="text-gray-700">Operators stop firefighting and start producing.</p>
            </div>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-600 mt-1">✔</span>
            <div>
              <span className="font-semibold text-gray-900">Increased profitability</span>
              <p className="text-gray-700">Your perfect binder becomes a reliable high-end finishing asset — not a bottleneck.</p>
            </div>
          </li>
        </ul>
      </section>

      {/* GLOBAL TRUST / ROI SECTION */}
      <section className="bg-gray-50 py-12 mb-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Real-World ROI (Based on 20+ Years of Installations)
          </h2>

          <p className="text-gray-700 mb-4">Across global binderies:</p>

          <ul className="text-gray-700 mb-6 space-y-1">
            <li>£1,000–£5,000 saved per month</li>
            <li>Pays for itself in as few as 5 job runs</li>
            <li>Massive reduction in setup waste</li>
            <li>Dramatic reduction in customer returns</li>
            <li>Stabilised finishing quality</li>
            <li>Predictable, repeatable cover production</li>
          </ul>

          <p className="text-gray-700 mb-4">
            The Quad Creaser is used across well over 100,000 finishing machines worldwide, and the economics are proven.
          </p>

          <p className="text-gray-700">
            Your {machine.display_name} is already capable of brilliant work —<br />
            you just need the creasing system it deserved from day one.
          </p>
        </div>
      </section>

      {/* FINAL CTA SECTION */}
      <section className="max-w-6xl mx-auto px-6 text-center">
        <h2 className="text-2xl font-semibold text-gray-900">
          Unlock the full potential of your {machine.display_name}
        </h2>
        <p className="mt-2 text-gray-700">
          Register below to begin your free 30-day trial.
        </p>
        <div className="mt-4">
          <button className="bg-orange-500 text-white px-8 py-3 font-bold hover:bg-orange-600 transition-colors">
            Register for Free Trial
          </button>
        </div>
      </section>
    </div>
  );
}
