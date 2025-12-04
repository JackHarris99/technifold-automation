interface SpineCreaserNarrativeProps {
  machine: {
    display_name: string;
  };
}

export function SpineCreaserNarrative({ machine }: SpineCreaserNarrativeProps) {
  return (
    <div className="py-16">
      {/* TITLE BLOCK - variant: lead */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Stop Fibre-Cracking, Weak Spines and Cover Waste on Your {machine.display_name} — Permanently
        </h1>
      </section>

      {/* PARAGRAPH BLOCK */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          <div>
            <p className="text-gray-700 mb-4">
              Your saddle stitcher, booklet maker or cover feeder is an exceptional machine.
            </p>

            <p className="text-gray-700 mb-4">
              It feeds, aligns, collates, stitches and trims with impressive consistency — but it suffers from one unavoidable weakness:
            </p>

            <p className="text-gray-900 font-semibold mb-4">
              The single cover crease.
            </p>

            <p className="text-gray-700 mb-4">
              OEM scoring wheels were never engineered to crease premium cover stocks cleanly and consistently. They cut. They slice. They drag fibres apart. And they leave operators fighting the same faults day after day.
            </p>

            <p className="text-gray-700 mb-4">If you've ever had to deal with:</p>

            <ul className="text-gray-700 mb-6 space-y-1">
              <li>• fibre-cracking on the outside spine</li>
              <li>• ugly white break lines across the cover</li>
              <li>• laminated covers splitting as soon as they fold</li>
              <li>• visible stress marks on thicker stocks</li>
              <li>• covers weakening around the stitched spine</li>
              <li>• "one angle wrong" leading to a ruined run</li>
              <li>• endless operator adjustments</li>
              <li>• high setup waste before the job even starts</li>
            </ul>

            <p className="text-gray-700 mb-4">
              …none of this is caused by your {machine.display_name}.
            </p>

            <p className="text-gray-900 font-semibold">
              It's the tooling.
            </p>
          </div>

          <div className="rounded-lg overflow-hidden shadow-lg">
            <iframe
              src="https://www.youtube.com/embed/bdiPRqmoSj8"
              title="Spine Creaser demonstration"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full aspect-video"
            />
          </div>
        </div>
      </section>

      {/* SUBHEADER BLOCK */}
      <section className="bg-gray-50 py-12 mb-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Why OEM Metal Scoring Will Always Fail
          </h2>

          {/* PARAGRAPH BLOCK */}
          <p className="text-gray-700 mb-4">
            Traditional scoring wheels operate by slicing through fibres and dragging the substrate downwards into a crude channel.
          </p>

          <p className="text-gray-700 mb-4">This creates:</p>

          <ul className="text-gray-700 mb-6 space-y-2">
            <li>❌ Fibre cracking</li>
            <li>❌ Laminate lifting</li>
            <li>❌ Weak spine formation</li>
            <li>❌ Inconsistent crease depth</li>
            <li>❌ Setup waste</li>
            <li>❌ Increased operator intervention</li>
          </ul>

          <p className="text-gray-700 mb-4">
            And because metal scoring is a single-action process, it offers almost no control over:
          </p>

          <ul className="text-gray-700 mb-6 space-y-1">
            <li>• crease width</li>
            <li>• crease depth</li>
            <li>• substrate sensitivity</li>
            <li>• laminate behaviour</li>
            <li>• toner brittleness</li>
            <li>• grain direction issues</li>
          </ul>

          <p className="text-gray-700 mb-1">
            Even on high-end booklet makers and stitchers, the scoring system is the bottleneck.
          </p>
          <p className="text-gray-700">
            The machine itself isn't the problem — the scoring wheel is.
          </p>
        </div>
      </section>

      {/* SUBHEADER BLOCK */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        <div className="grid gap-8 md:grid-cols-2 items-start">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
              The Technifold Spine-Creaser Turns Your {machine.display_name} Into a Premium Cover-Finishing System
            </h2>

            {/* PARAGRAPH BLOCK */}
            <p className="text-gray-700 mb-4">
              The Technifold Spine-Creaser replaces the metal scoring wheel with a precision-engineered rotary creasing mechanism that gently manipulates fibres instead of tearing them.
            </p>

            <p className="text-gray-700 mb-4">Its design is built around:</p>

            <ul className="text-gray-700 mb-6 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>Gentle rotary action</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>Patented split-band technology (easy band replacement)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>Adjustable crease width</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>Adjustable crease depth</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>Substrate-responsive tooling</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>Non-destructive pressure distribution</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✔</span>
                <span>Consistent results on every stock type</span>
              </li>
            </ul>

            <p className="text-gray-700 mb-4">
              This combination allows the Spine-Creaser to create a controlled, professional, non-cracking single spine crease on any cover substrate.
            </p>

            <p className="text-gray-700 mb-1">
              You're not improving the {machine.display_name}.
            </p>
            <p className="text-gray-900 font-semibold">
              You're fixing its only real weakness.
            </p>
          </div>

          <div className="space-y-4">
            <img
              src="/images/products/spine-creaser-action.jpg"
              alt="Spine Creaser creating perfect inline cover creases"
              className="w-full rounded-lg shadow-lg"
            />
            <img
              src="/images/products/spine-creaser-detail.jpg"
              alt="Spine Creaser detail showing rubber creasing technology"
              className="w-full rounded-lg shadow-lg"
            />
          </div>
        </div>
      </section>

      {/* SUBHEADER BLOCK */}
      <section className="bg-gray-50 py-12 mb-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8">
            What the Spine-Creaser Does Differently
          </h2>

          {/* CAPABILITY 1 */}
          <div className="grid gap-8 md:grid-cols-2 items-start mb-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                1. Eliminates Fibre Cracking Completely
              </h3>

              <p className="text-gray-700 mb-4">
                Every PDF, brochure and field installation says the same thing:
              </p>

              <p className="text-gray-700 italic mb-4">
                "Stops fibre cracking 100%."
              </p>

              <p className="text-gray-700 mb-4">Operators see:</p>

              <ul className="text-gray-700 mb-4 space-y-1">
                <li>• clean, crisp, professional spines</li>
                <li>• no white break lines</li>
                <li>• no fibre disruption</li>
                <li>• no cover rejection during QC</li>
              </ul>

              <p className="text-gray-700">
                Whether you run coated, uncoated, laminated or digital short-grain stocks — you get consistent, sale-ready creases every time.
              </p>
            </div>

            <div>
              <img
                src="/images/results/spine-creaser-result-1.jpg"
                alt="Perfect spine crease with no fibre cracking"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* CAPABILITY 2 */}
          <div className="grid gap-8 md:grid-cols-2 items-start mb-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                2. Prevents Laminate Lifting — Permanently
              </h3>

              <p className="text-gray-700 mb-4">
                Metal scoring pulls laminate apart.<br />
                The Spine-Creaser prevents it.
              </p>

              <p className="text-gray-700 mb-4">
                By using a dual-direction, non-destructive pressure profile, it keeps the laminate layer fully bonded even on:
              </p>

              <ul className="text-gray-700 mb-4 space-y-1">
                <li>• heavy laminated covers</li>
                <li>• gloss films</li>
                <li>• matt soft-touch laminates</li>
                <li>• textured and premium finishes</li>
              </ul>

              <p className="text-gray-700">
                This makes premium cover work far more reliable and profitable.
              </p>
            </div>

            <div>
              <img
                src="/images/results/spine-creaser-result-2.jpg"
                alt="Laminated cover with perfect crease - no lifting"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* CAPABILITY 3 */}
          <div className="grid gap-8 md:grid-cols-2 items-start mb-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                3. Creates a Strong, Consistent, Non-Cracking Single Spine Crease
              </h3>

              <p className="text-gray-700 mb-4">
                OEM scoring gives you one static, often-destructive crease.<br />
                The Spine-Creaser gives you true creasing control, letting you fine-tune:
              </p>

              <ul className="text-gray-700 mb-4 space-y-1">
                <li>• crease depth</li>
                <li>• crease width</li>
                <li>• substrate response</li>
              </ul>

              <p className="text-gray-700 mb-4">
                The result is a reinforced, reliable spine crease that folds cleanly around the stitched text block — without cracking, tearing or bursting fibres.
              </p>

              <p className="text-gray-700">
                This is the crease that prevents failures in production and ensures every booklet leaves the machine sale-ready.
              </p>
            </div>

            <div>
              <img
                src="/images/products/spine-creaser-installed.JPG"
                alt="Spine Creaser installed on saddle stitcher"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>

          {/* CAPABILITY 4 */}
          <div className="grid gap-8 md:grid-cols-2 items-start mb-12">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                4. Dramatically Reduces Setup Waste
              </h3>

              <p className="text-gray-700 mb-4">Metal scoring causes:</p>

              <ul className="text-gray-700 mb-4 space-y-1">
                <li>• cracking within the first few covers</li>
                <li>• tearing during setup</li>
                <li>• adjustments that never quite stabilise</li>
                <li>• burning through 20–50 covers before production settles</li>
              </ul>

              <p className="text-gray-700 mb-4">
                The Spine-Creaser stops this completely.
              </p>

              <p className="text-gray-700 mb-1">
                From sheet one, the crease is clean, controlled and repeatable.
              </p>
              <p className="text-gray-700">
                Operators stop firefighting and start producing.
              </p>
            </div>

            <div>
              <img
                src="/images/before-after/saddle-stitch-perfect-crease.JPG"
                alt="Perfect saddle stitch crease result"
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
                Many finishing upgrades slow the line down.<br />
                This doesn't.
              </p>

              <p className="text-gray-700">
                The Spine-Creaser runs at whatever speed your {machine.display_name} can achieve — with zero loss of quality.
              </p>
            </div>

            <div>
              <img
                src="/images/before-after/book-spine-perfect-after.JPG"
                alt="Professional booklet with perfect spine at full speed"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* SUBHEADER BLOCK - What This Means for Your Business */}
      <section className="max-w-6xl mx-auto px-6 mb-12">
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          What This Means for Your Business
        </h2>

        <ul className="space-y-2">
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✔</span> Zero substrate cracking
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✔</span> Zero laminate failures
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✔</span> Zero weak spine creases
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✔</span> Zero wasted covers during setup
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✔</span> Fewer customer complaints
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✔</span> Faster turnaround
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✔</span> Higher utilisation of your stitcher/booklet maker
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✔</span> More premium cover work accepted confidently
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✔</span> Less operator stress, far fewer adjustments
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✔</span> More jobs completed per shift
          </li>
          <li className="flex items-center gap-2 text-gray-700">
            <span className="text-green-600">✔</span> Lower labour cost per run
          </li>
        </ul>
      </section>

      {/* SUBHEADER BLOCK - Real-World ROI */}
      <section className="bg-gray-50 py-12 mb-12">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
            Real-World ROI (Based on Global Installations)
          </h2>

          <p className="text-gray-700 mb-4">
            Across more than 20 years of installations on over 100,000 finishing machines worldwide, customers consistently report:
          </p>

          <ul className="text-gray-700 mb-6 space-y-1">
            <li>• £1,000–£5,000 saved per month</li>
            <li>• Payback in just a handful of runs</li>
            <li>• Major reduction in setup waste</li>
            <li>• Significant increase in premium cover jobs won</li>
          </ul>

          <p className="text-gray-700">
            If your {machine.display_name} runs covers weekly, the Spine-Creaser is a financial no-brainer.
          </p>
        </div>
      </section>

      {/* CTA BLOCK - variant: lead */}
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
