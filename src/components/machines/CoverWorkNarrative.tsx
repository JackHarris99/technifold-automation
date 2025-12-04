interface CoverWorkNarrativeProps {
  machine: {
    display_name: string;
  };
}

export function CoverWorkNarrative({ machine }: CoverWorkNarrativeProps) {
  return (
    <div className="space-y-16 py-16">
      {/* HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 grid gap-8 md:grid-cols-2 items-center">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
            Unlock Thousands in Monthly Finishing Efficiency from Your Existing {machine.display_name}
          </h2>

          <p className="text-gray-700 mb-4">
            Your folding machine already handles speed, registration and folding accuracy brilliantly — but it has one unavoidable limitation:
          </p>

          <p className="text-gray-900 font-semibold mb-4">
            It was never engineered to crease, perforate, or cut single sheets to a high standard.
          </p>

          <ul className="text-gray-700 mb-6 space-y-1">
            <li>OEM scoring wheels tear fibres.</li>
            <li>Standard perf wheels rip rather than perforate.</li>
            <li>Integrated slitting knives rough-trim a stack, not a single sheet.</li>
          </ul>

          <p className="text-gray-700 mb-4">If you've ever fought with:</p>

          <ul className="text-gray-700 mb-6 space-y-1">
            <li>Cracking along the fold</li>
            <li>Furry, chewed edges</li>
            <li>Tough folds that refuse to lie flat</li>
            <li>Perfs that snap, tear or don't run straight</li>
            <li>Operators babysitting the machine all shift</li>
            <li>Guillotine bottlenecks that delay dispatch</li>
          </ul>

          <p className="text-gray-700 mb-4">
            …none of that is the fault of your {machine.display_name}.<br />
            It's the tooling.
          </p>

          <p className="text-gray-900 font-semibold">
            And that's exactly where Technifold comes in.
          </p>
        </div>

        <div className="rounded-lg overflow-hidden shadow-lg">
          <iframe
            src="https://www.youtube.com/embed/QEZVzxka01U"
            title="Tri-Creaser Fast-Fit demonstration"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="w-full aspect-video"
          />
        </div>
      </section>

      {/* TRI-CREASER SECTION */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            Transform Your {machine.display_name} into a High-End Finishing System
          </h3>

          <p className="text-gray-700 mb-8">
            By adding three world-leading capabilities — Tri-Creaser, Micro-Perforation, and Multi-Tool Cutting — you turn your {machine.display_name} into a machine that can genuinely finish commercial-grade single-sheet work inline:
          </p>

          <div className="grid gap-8 md:grid-cols-2 items-start">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                1) Tri-Creaser – Eliminate Fibre-Cracking & Produce Perfect Folds
              </h4>

              <p className="text-gray-700 mb-4">
                Your folder's metal scoring wheel isn't a creaser — it's a blunt scoring device designed decades ago. It crushes fibres, causes cracking along the fold, and forces operators to adjust constantly for stock, grain and coating.
              </p>

              <p className="text-gray-700 mb-4">
                The Tri-Creaser replaces that entire flawed process with:
              </p>

              <ul className="text-gray-700 mb-6 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>True compression creasing (no tearing or fibre-cracking)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Fold-flat results even on heavy, laminated and digital stocks</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Zero set-up headaches — the tooling compensates automatically</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Repeatable quality — same result on job 1 and job 10,000</span>
                </li>
              </ul>

              <div className="bg-white border-l-4 border-orange-500 p-4 mb-4 space-y-2">
                <p className="text-gray-600 italic">"Works perfectly across the entire substrate range."</p>
                <p className="text-gray-600 italic">"Prevents cracking 100% on laminated and digital stock."</p>
                <p className="text-gray-600 italic">"Operators report near-zero reprints caused by poor folds."</p>
              </div>

              <p className="text-gray-900 font-semibold">
                This is why Tri-Creaser is used on over 100,000 folding machines worldwide.
              </p>
            </div>

            <div className="space-y-4">
              <img
                src="/images/products/tri-creaser-action.jpg"
                alt="Tri-Creaser creating perfect letterpress-style creases"
                className="w-full rounded-lg shadow-lg"
              />
              <img
                src="/images/results/fiber-crack-before-and-after.jpg"
                alt="Before and after: fibre cracking eliminated with Tri-Creaser"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* MICRO-PERF SECTION */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4">
              2) Micro-Perforation – Clean, Controlled, Letterpress-Quality Perfs
            </h4>

            <p className="text-gray-700 mb-4">
              Most folders "perforate" by tearing.<br />
              The operator hears the wheel ripping the sheet.
            </p>

            <p className="text-gray-700 mb-4">
              The result: dust, debris, weak perfs, and inconsistent tear strength.
            </p>

            <p className="text-gray-700 mb-4">
              Technifold's Micro-Perf system delivers:
            </p>

            <ul className="text-gray-700 mb-6 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Crisp, controlled, letterpress-style perforation</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>No fibre ripping, no debris, no weak spots</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Multiple TPI options for every stock and job</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Close-proximity perfing for tickets, offers, vouchers</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-orange-500 mt-1">•</span>
                <span>Virtually invisible perf lines when required</span>
              </li>
            </ul>

            <div className="bg-gray-50 border-l-4 border-orange-500 p-4 mb-4 space-y-2">
              <p className="text-gray-600 italic">"Simulates true letterpress perforation."</p>
              <p className="text-gray-600 italic">"Perfectly even tear strength — no more snapping or dragging."</p>
              <p className="text-gray-600 italic">"Reduces guillotine load dramatically."</p>
            </div>

            <p className="text-gray-700">
              Operators love it because it just works.<br />
              <span className="font-semibold text-gray-900">Owners love it because it makes money.</span>
            </p>
          </div>

          <div className="space-y-4">
            <img
              src="/images/products/micro-perforator-action.jpg"
              alt="Micro-Perforator creating clean letterpress-style perforations"
              className="w-full rounded-lg shadow-lg"
            />
            <img
              src="/images/results/perforation-before-and-after-1.jpg"
              alt="Before and after: perforation quality comparison"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* MULTI-TOOL SECTION */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid gap-8 md:grid-cols-2 items-start">
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                3) Multi-Tool Cutting System – Guillotine-Quality Cutting, Inline
              </h4>

              <p className="text-gray-700 mb-4">
                Your {machine.display_name} was never built to clean-cut a single sheet.<br />
                Its built-in knives are made for trimming folded signatures — not producing commercial-grade edges.
              </p>

              <p className="text-gray-700 mb-4">
                The Multi-Tool Cutting System changes that entirely:
              </p>

              <ul className="text-gray-700 mb-6 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Guillotine-quality edge trimming</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>High-quality single-cut or double-cut</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Clean slitting for two-up work</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>Self-sharpening cutting bosses (thousands of runs)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>No more furry edges</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-orange-500 mt-1">•</span>
                  <span>No more offline finishing delays</span>
                </li>
              </ul>

              <div className="bg-white border-l-4 border-orange-500 p-4 mb-4 space-y-2">
                <p className="text-gray-600 italic">"Cut quality as good as a guillotine."</p>
                <p className="text-gray-600 italic">"Blades last up to 5× longer."</p>
                <p className="text-gray-600 italic">"Edge-trimming has never been easier."</p>
              </div>

              <p className="text-gray-900 font-semibold">
                This is what lets operators finish full jobs inline — at speed — without tying up the guillotine.
              </p>
            </div>

            <div className="space-y-4">
              <img
                src="/images/products/multi-tool-action.jpg"
                alt="Multi-Tool Cutting System producing guillotine-quality cuts inline"
                className="w-full rounded-lg shadow-lg"
              />
              <img
                src="/images/results/cutting-before-and-after-1.jpg"
                alt="Before and after: cutting quality comparison"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ROI / TRUST SECTION */}
      <section className="max-w-6xl mx-auto px-6">
        <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          The Result? Your {machine.display_name} Becomes a Production Weapon
        </h3>

        <p className="text-gray-700 mb-6">
          When Tri-Creaser + Micro-Perf + Multi-Tool Cutting are combined, your {machine.display_name}:
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600">✔</span> Eliminates cracking
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600">✔</span> Eliminates furry edges
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600">✔</span> Eliminates weak perfs
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600">✔</span> Finishes full jobs inline
            </li>
          </ul>
          <ul className="space-y-2">
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600">✔</span> Reduces guillotine load
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600">✔</span> Runs with fewer corrections
            </li>
            <li className="flex items-center gap-2 text-gray-700">
              <span className="text-green-600">✔</span> Handles more profitable job types
            </li>
          </ul>
        </div>

        <p className="text-gray-700 mb-8">
          Your machine becomes:
        </p>

        <ul className="text-gray-900 font-semibold mb-12 space-y-1">
          <li>faster</li>
          <li>more profitable</li>
          <li>more versatile</li>
          <li>more consistent</li>
          <li>and far more operator-friendly</li>
        </ul>

        <h4 className="text-xl font-bold text-gray-900 mb-4">
          Why Businesses Trust Technifold
        </h4>

        <p className="text-gray-700 mb-4">
          Technifold solutions run on over 100,000 folding, stitching and binding machines worldwide.
        </p>

        <p className="text-gray-700 mb-6">
          Across 20+ years, customers consistently report £1,000–£3,000+ in monthly savings through:
        </p>

        <ul className="text-gray-700 mb-8 space-y-1">
          <li>fewer reprints</li>
          <li>faster turnaround</li>
          <li>less guillotine usage</li>
          <li>fewer rejected jobs</li>
          <li>taking on higher-margin work</li>
        </ul>

        <p className="text-gray-700">
          A folding machine like the {machine.display_name} is already a powerful asset.<br />
          <span className="font-semibold text-gray-900">Technifold tooling ensures you extract its full financial potential.</span>
        </p>
      </section>

      {/* CTA SECTION (OFFICIAL, LOCKED) */}
      <section className="max-w-6xl mx-auto px-6 mt-12 text-center">
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
