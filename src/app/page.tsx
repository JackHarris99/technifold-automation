import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import MachineFinder from '@/components/machines/MachineFinder';
import Image from 'next/image';

export const metadata = {
  title: 'Technifold International - Print Finishing Solutions',
  description: 'Precision creasing and finishing tools for folders, perfect binders, and saddle stitchers. Eliminate fibre cracking on your machine.',
};

export default async function HomePage() {
  return (
    <div className="min-h-screen">
      <MarketingHeader />

      <main>
        {/* Hero Section - Industrial Calm */}
        <section className="container-wide py-16 md:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12 items-center">
            {/* Left: Machine Finder + Headline */}
            <div className="lg:col-span-2 space-y-8">
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-semibold leading-tight tracking-tight">
                  Eliminate fibre cracking on your folder.
                </h1>
                <p className="text-lg text-graphite leading-relaxed">
                  Precision creasing for 40,000+ installations worldwide.
                </p>
              </div>

              {/* Machine Finder - Prominent */}
              <div className="space-y-4">
                <MachineFinder />

                <p className="text-sm text-graphite-light">
                  Or browse{' '}
                  <a href="/machines" className="text-accent hover:text-accent-hover underline">
                    all compatible machines
                  </a>
                </p>
              </div>
            </div>

            {/* Right: Massive Proof Image */}
            <div className="lg:col-span-3">
              <figure className="evidence-well">
                <Image
                  src="/images/before-after/hero-fibre-cracking-comparison.jpg"
                  alt="Before and after fibre cracking elimination on folding machine"
                  width={1200}
                  height={675}
                  priority
                  className="w-full h-auto"
                />
                <figcaption>
                  Heidelberg Stahlfolder - Fibre cracking eliminated
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        {/* Breadth Signal - Restrained */}
        <section className="py-12 bg-stone-light border-y border-stone-dark">
          <div className="container-wide">
            <p className="text-center text-graphite">
              Compatible with machines from <span className="text-near-black font-medium">Heidelberg</span>,{' '}
              <span className="text-near-black font-medium">Horizon</span>,{' '}
              <span className="text-near-black font-medium">MBO</span>,{' '}
              <span className="text-near-black font-medium">Morgana</span>,{' '}
              <span className="text-near-black font-medium">Muller Martini</span>,{' '}
              <span className="text-near-black font-medium">Duplo</span>,{' '}
              <span className="text-near-black font-medium">Plockmatic</span>, and more
            </p>
          </div>
        </section>

        {/* Future: More proof images will go here */}
        {/*
        <section className="container-wide py-24">
          <h2 className="text-3xl font-semibold mb-12">Problems we solve</h2>
          <div className="grid md:grid-cols-3 gap-8">
            [Before/after grid for each problem group]
          </div>
        </section>
        */}

      </main>

      <MarketingFooter />
    </div>
  );
}
