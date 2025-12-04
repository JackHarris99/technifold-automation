interface CoverWorkNarrativeProps {
  machine: {
    display_name: string;
  };
}

export function CoverWorkNarrative({ machine }: CoverWorkNarrativeProps) {
  return (
    <article className="bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white py-12 border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6">
          <p className="text-cyan-400 text-sm font-medium tracking-wide uppercase mb-3">
            Technifold Technical Reference
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-white leading-tight">
            Unlock Thousands in Monthly Finishing Efficiency from Your Existing{' '}
            <span className="font-medium">{machine.display_name}</span>
          </h1>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">

        {/* Introduction */}
        <section className="mb-12">
          <p className="text-lg text-slate-700 leading-relaxed mb-6">
            Your folding machine already handles speed, registration and folding accuracy brilliantly — but it has one unavoidable limitation.
          </p>

          <p className="text-lg text-slate-800 font-medium leading-relaxed mb-6">
            It was never engineered to crease, perforate, or cut single sheets to a high standard.
          </p>

          <div className="text-slate-600 leading-relaxed space-y-4 mb-8">
            <p>OEM scoring wheels tear fibres. Standard perf wheels rip rather than perforate. Integrated slitting knives rough-trim a stack, not a single sheet.</p>

            <p>If you've ever fought with cracking along the fold, furry chewed edges, tough folds that refuse to lie flat, perfs that snap, tear or don't run straight, operators babysitting the machine all shift, or guillotine bottlenecks that delay dispatch — none of that is the fault of your {machine.display_name}.</p>
          </div>

          <p className="text-slate-900 font-medium text-lg border-l-2 border-cyan-500 pl-4">
            It's the tooling. And that's exactly where Technifold comes in.
          </p>
        </section>

        {/* Video Reference */}
        <aside className="mb-12 bg-slate-50 border border-slate-200 p-6">
          <p className="text-sm text-slate-500 uppercase tracking-wide mb-3">Technical Demonstration</p>
          <div className="aspect-video">
            <iframe
              src="https://www.youtube.com/embed/QEZVzxka01U"
              title="Tri-Creaser Fast-Fit demonstration"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        </aside>

        {/* Three Capabilities Overview */}
        <section className="mb-12">
          <h2 className="text-2xl font-medium text-slate-900 mb-6">
            Three Precision-Engineered Capabilities for Your {machine.display_name}
          </h2>

          <p className="text-slate-600 leading-relaxed mb-8">
            Technifold finishing tools are built around patented rubber-based technology and colour-coded tooling systems that deliver measurable, consistent results across a wide range of substrates and applications.
          </p>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="border border-slate-200 p-5">
              <p className="text-cyan-600 text-xs font-medium uppercase tracking-wide mb-2">Capability 01</p>
              <p className="text-slate-900 font-medium">Tri-Creaser</p>
              <p className="text-slate-500 text-sm mt-1">Fibre-crack elimination</p>
            </div>
            <div className="border border-slate-200 p-5">
              <p className="text-cyan-600 text-xs font-medium uppercase tracking-wide mb-2">Capability 02</p>
              <p className="text-slate-900 font-medium">Micro-Perforator</p>
              <p className="text-slate-500 text-sm mt-1">Precision perforation</p>
            </div>
            <div className="border border-slate-200 p-5">
              <p className="text-cyan-600 text-xs font-medium uppercase tracking-wide mb-2">Capability 03</p>
              <p className="text-slate-900 font-medium">Multi-Tool</p>
              <p className="text-slate-500 text-sm mt-1">Inline trimming &amp; slitting</p>
            </div>
          </div>
        </section>

        {/* Capability 1: Tri-Creaser */}
        <section className="mb-12 pb-12 border-b border-slate-200">
          <h3 className="text-xl font-medium text-slate-900 mb-4">
            Tri-Creaser: Eliminate Fibre-Cracking Permanently
          </h3>

          <div className="md:flex md:gap-8 mb-6">
            <div className="md:flex-1">
              <p className="text-slate-600 leading-relaxed mb-4">
                OEM scoring wheels crush and fracture the substrate. Every fold becomes a fault line waiting to crack — especially on coated, laminated, or digitally printed stock.
              </p>

              <p className="text-slate-600 leading-relaxed mb-4">
                The Tri-Creaser uses patented rubber-matrix technology to form a genuine channel crease without damaging fibres. The result is a fold that bends cleanly, lies flat, and never cracks — regardless of paper weight, coating, or grain direction.
              </p>

              <p className="text-slate-600 leading-relaxed">
                This applies to 170gsm gloss, 350gsm board, short-grain digital, laminated covers — and everything in between.
              </p>
            </div>

            <figure className="md:w-64 mt-6 md:mt-0 flex-shrink-0">
              <img
                src="/images/products/tri-creaser-action.jpg"
                alt="Tri-Creaser tooling in operation"
                className="w-full border border-slate-200"
              />
              <figcaption className="text-xs text-slate-400 mt-2">Fig. 1 — Tri-Creaser Fast-Fit module</figcaption>
            </figure>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 md:flex md:gap-8">
            <figure className="md:w-48 flex-shrink-0 mb-4 md:mb-0">
              <img
                src="/images/results/fiber-crack-before.JPG"
                alt="Fibre cracking with OEM scoring"
                className="w-full border border-slate-300"
              />
              <figcaption className="text-xs text-slate-400 mt-2">Before: OEM scoring damage</figcaption>
            </figure>
            <figure className="md:w-48 flex-shrink-0">
              <img
                src="/images/results/fiber-crack-after.JPG"
                alt="Clean fold with Tri-Creaser"
                className="w-full border border-slate-300"
              />
              <figcaption className="text-xs text-slate-400 mt-2">After: Tri-Creaser result</figcaption>
            </figure>
          </div>
        </section>

        {/* Capability 2: Micro-Perforator */}
        <section className="mb-12 pb-12 border-b border-slate-200">
          <h3 className="text-xl font-medium text-slate-900 mb-4">
            Micro-Perforator: Clean, Consistent, Controllable Perforations
          </h3>

          <div className="md:flex md:gap-8 mb-6">
            <div className="md:flex-1">
              <p className="text-slate-600 leading-relaxed mb-4">
                Standard perf wheels leave ragged edges. The cuts are uneven, the tear is unpredictable, and the result looks cheap. The Micro-Perforator solves this with a precision-engineered rotary blade system that delivers cleanly cut micro-perforations on every pass.
              </p>

              <p className="text-slate-600 leading-relaxed mb-4">
                Operators can adjust cut-to-tie ratio and perforation depth to match the stock. The result is a professional tear that separates exactly where intended — no ripping, no burrs, no fibre pull.
              </p>

              <p className="text-slate-600 leading-relaxed">
                Direct mail, response cards, tickets, coupons, vouchers — anything that needs to separate cleanly can now be finished inline, in one pass, at full machine speed.
              </p>
            </div>

            <figure className="md:w-64 mt-6 md:mt-0 flex-shrink-0">
              <img
                src="/images/products/micro-perforator-action.jpg"
                alt="Micro-Perforator tooling"
                className="w-full border border-slate-200"
              />
              <figcaption className="text-xs text-slate-400 mt-2">Fig. 2 — Micro-Perforator module</figcaption>
            </figure>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 md:flex md:gap-8">
            <figure className="md:w-48 flex-shrink-0 mb-4 md:mb-0">
              <img
                src="/images/results/perforation-before-1.jpg"
                alt="Poor perforation quality"
                className="w-full border border-slate-300"
              />
              <figcaption className="text-xs text-slate-400 mt-2">Before: Ragged perf edge</figcaption>
            </figure>
            <figure className="md:w-48 flex-shrink-0">
              <img
                src="/images/results/perforation-after-1.jpg"
                alt="Clean Micro-Perforator result"
                className="w-full border border-slate-300"
              />
              <figcaption className="text-xs text-slate-400 mt-2">After: Micro-Perforator result</figcaption>
            </figure>
          </div>
        </section>

        {/* Capability 3: Multi-Tool */}
        <section className="mb-12 pb-12 border-b border-slate-200">
          <h3 className="text-xl font-medium text-slate-900 mb-4">
            Multi-Tool: Inline Trimming Without the Guillotine Bottleneck
          </h3>

          <div className="md:flex md:gap-8 mb-6">
            <div className="md:flex-1">
              <p className="text-slate-600 leading-relaxed mb-4">
                Guillotine trimming is slow, manual, and creates a bottleneck between folding and dispatch. Every stack that stops at the guillotine burns labour, floor space, and turnaround time.
              </p>

              <p className="text-slate-600 leading-relaxed mb-4">
                The Multi-Tool removes this entirely. Rotary slitting and trimming happens inline, on the folder, at full production speed. Sheets come off the machine finished — no secondary handling, no stack waiting, no guillotine queue.
              </p>

              <p className="text-slate-600 leading-relaxed">
                The result is faster job completion, lower labour cost per job, and a bindery floor that moves work instead of storing it.
              </p>
            </div>

            <figure className="md:w-64 mt-6 md:mt-0 flex-shrink-0">
              <img
                src="/images/products/multi-tool-action.jpg"
                alt="Multi-Tool cutting system"
                className="w-full border border-slate-200"
              />
              <figcaption className="text-xs text-slate-400 mt-2">Fig. 3 — Multi-Tool cutting module</figcaption>
            </figure>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-5 md:flex md:gap-8">
            <figure className="md:w-48 flex-shrink-0 mb-4 md:mb-0">
              <img
                src="/images/before-after/cutting-before-and-after-1.jpg"
                alt="Inline trim result"
                className="w-full border border-slate-300"
              />
              <figcaption className="text-xs text-slate-400 mt-2">Inline trim quality</figcaption>
            </figure>
          </div>
        </section>

        {/* Business Impact */}
        <section className="mb-12">
          <h2 className="text-2xl font-medium text-slate-900 mb-6">
            Operational Impact
          </h2>

          <p className="text-slate-600 leading-relaxed mb-6">
            Technifold tooling is not a marginal improvement. It fundamentally changes the economics of your finishing operation.
          </p>

          <div className="grid md:grid-cols-2 gap-x-8 gap-y-4 text-slate-600 mb-8">
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Eliminate reprints caused by cracked folds</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Remove guillotine bottlenecks from workflow</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Reduce operator intervention and babysitting</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Accept jobs previously rejected as "too difficult"</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Finish digitally printed work without compromise</span>
            </div>
            <div className="flex gap-3">
              <span className="text-cyan-600 flex-shrink-0">—</span>
              <span>Lower labour cost per finished piece</span>
            </div>
          </div>

          <p className="text-slate-600 leading-relaxed">
            Across more than 100,000 installations worldwide over 20+ years, customers consistently report savings of £1,000–£5,000 per month — with full payback in as few as five job runs.
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
              <p className="text-2xl font-light">£3K+</p>
              <p className="text-slate-400 text-sm">Avg. Monthly Saving</p>
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
            Next Steps
          </h2>

          <p className="text-slate-600 leading-relaxed mb-6">
            Every Technifold tool is available for a 30-day evaluation on your {machine.display_name}. There is no obligation and no charge for the trial period. If the results don't meet expectations, return the tooling at no cost.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <button className="bg-slate-900 text-white px-6 py-3 font-medium hover:bg-slate-800 transition-colors">
              Request 30-Day Trial
            </button>
            <a href="tel:+441onal11538" className="border border-slate-300 text-slate-700 px-6 py-3 font-medium hover:border-slate-400 transition-colors text-center">
              Technical Enquiries: +44 (0)1455 381 538
            </a>
          </div>
        </section>

      </div>
    </article>
  );
}
