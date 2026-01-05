import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';
import MachineFinder from '@/components/machines/MachineFinder';
import { getSupabaseClient } from '@/lib/supabase';

export const metadata = {
  title: 'Technifold International - Print Finishing Solutions',
  description: 'World-leading manufacturer of Tri-Creaser, Quad-Creaser, and Spine-Creaser systems. Eliminate cracking, reduce waste, increase profits.',
};

export default async function HomePage() {
  const supabase = getSupabaseClient();

  // Get featured solutions for the grid
  const solutions = [
    {
      slug: 'tri-creaser',
      name: 'Tri-Creaser',
      category: 'Rotary Creasing Systems',
      description: 'The world standard for rotary creasing. Patented reverse-crease method eliminates fiber cracking on digital stocks, laminated sheets, and heavy substrates.',
      applications: ['Digital Printing', 'Offset', 'Laminated Stocks'],
      stats: ['40,000+ installations', '100% crack elimination', '1-3 jobs to ROI'],
    },
    {
      slug: 'quad-creaser',
      name: 'Quad-Creaser',
      category: 'Multi-Crease Systems',
      description: 'Four independent creasing ribs for complex folding applications. Perfect parallel creases for greeting cards, invitations, and multi-panel work.',
      applications: ['Greeting Cards', 'Invitations', 'Complex Packaging'],
      stats: ['±0.1mm accuracy', '4 creases/pass', 'Any stock weight'],
    },
    {
      slug: 'spine-creaser',
      name: 'Spine Creaser',
      category: 'Binding Solutions',
      description: 'Pre-crease covers before perfect binding. Eliminates spine cracking on thick covers and achieves professional booklet finishing.',
      applications: ['Perfect Binding', 'Saddle Stitching', 'Booklet Making'],
      stats: ['Zero spine cracking', '15-second setup', '95% waste reduction'],
    },
    {
      slug: 'spine-and-hinge-creaser',
      name: 'Spine & Hinge Creaser',
      category: 'Binding Solutions',
      description: 'Dual-crease system creates spine and hinge creases for 180° lay-flat opening. Essential for premium catalogs and manuals.',
      applications: ['Catalogs', 'Technical Manuals', 'Coffee Table Books'],
      stats: ['180° lay-flat', '2 creases/pass', 'Premium quality'],
    },
    {
      slug: 'multi-tool',
      name: 'Multi-Tool',
      category: 'Specialty Systems',
      description: 'Versatile solution for irregular stocks, thick substrates, and specialty applications that standard folders cannot handle.',
      applications: ['Irregular Stocks', 'Heavy Board', 'Specialty Work'],
      stats: ['400gsm+ capacity', 'Irregular material', 'Custom solutions'],
    },
    {
      slug: 'micro-perforator',
      name: 'Micro-Perforator',
      category: 'Specialty Systems',
      description: 'Add clean tear-off sections to any folded product. Professional perforations for tickets, coupons, and reply cards.',
      applications: ['Reply Cards', 'Tickets', 'Coupons'],
      stats: ['Clean separation', 'No ragged edges', 'Easy tear-off'],
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />
      <main>
        {/* Hero with Problem Image and Machine Finder */}
        <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white py-16 border-b-4 border-blue-500">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-12 items-start">
              {/* Left: Text and Problem Image */}
              <div className="flex flex-col h-full">
                <div className="inline-block bg-blue-500 text-white px-3 py-1.5 text-xs font-bold uppercase tracking-wide mb-4">
                  Trusted by 30,000+ Companies Worldwide
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
                  Professional Print Finishing Solutions
                </h1>
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  Eliminate fiber cracking, reduce waste, and handle jobs you couldn't touch before.
                </p>

                {/* Fiber Cracking Image */}
                <div className="relative overflow-hidden shadow-xl border-4 border-blue-400 flex-1">
                  <img
                    src="/images/problems/fiber-cracking.jpg"
                    alt="Fiber cracking on printed material"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Right: Machine Finder */}
              <div className="bg-white shadow-xl border-4 border-blue-400 p-8 flex flex-col h-full">
                <div className="text-center mb-6">
                  <h2 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: "'Inter', 'system-ui', sans-serif" }}>
                    Find Your Machine
                  </h2>
                  <p className="text-slate-600">
                    Get solutions engineered for your exact equipment
                  </p>
                </div>
                <MachineFinder />
              </div>
            </div>
          </div>
        </section>

        {/* Dense Product Catalog Grid */}
        <section className="py-12 bg-gray-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Product Catalog</h2>
                <p className="text-sm text-gray-600 mt-1">Precision-engineered systems for professional print finishing</p>
              </div>
              <a href="/contact" className="bg-orange-500 text-white px-6 py-2 text-sm font-bold hover:bg-orange-600 transition-colors">
                Request Quote
              </a>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {solutions.map((solution) => (
                <a
                  key={solution.slug}
                  href={`/tools/${solution.slug}`}
                  className="bg-white border-2 border-gray-200 hover:border-orange-500 transition-all group overflow-hidden"
                >
                  {/* Product Image */}
                  <div className="h-48 bg-gradient-to-br from-slate-100 to-slate-200 border-b-2 border-gray-200 overflow-hidden">
                    <img
                      src={`/images/products/${solution.slug}-action.jpg`}
                      alt={`${solution.name} installed on machine`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>

                  <div className="p-5">
                    <div className="text-xs font-bold text-orange-600 uppercase tracking-wide mb-1">
                      {solution.category}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                      {solution.name}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed mb-4">
                      {solution.description}
                    </p>

                    {/* Applications */}
                    <div className="mb-3">
                      <div className="text-xs font-bold text-gray-700 mb-1">Applications:</div>
                      <div className="flex flex-wrap gap-1">
                        {solution.applications.map((app, idx) => (
                          <span key={idx} className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                            {app}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="border-t border-gray-200 pt-3">
                      {solution.stats.map((stat, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                          <span className="text-green-600">✓</span>
                          <span>{stat}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* ROI Information - Compact */}
        <section className="py-10 bg-white border-t border-b border-gray-300">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-4 gap-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Typical First-Year ROI</h3>
                <p className="text-sm text-gray-600">Based on average print shop operations</p>
              </div>
              <div className="text-center border-l border-gray-200 pl-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">£10,000</div>
                <div className="text-xs text-gray-600">Eliminated Waste</div>
              </div>
              <div className="text-center border-l border-gray-200 pl-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">£12,000</div>
                <div className="text-xs text-gray-600">Reduced Setup Time</div>
              </div>
              <div className="text-center border-l border-gray-200 pl-6">
                <div className="text-3xl font-bold text-gray-900 mb-1">£18,000</div>
                <div className="text-xs text-gray-600">New Job Capability</div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Validation - Compact */}
        <section className="py-10 bg-slate-900 text-white">
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="inline-block bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-3 text-orange-300">
                  Third-Party Validation
                </div>
                <h3 className="text-xl font-bold mb-3">
                  "Comparable to Letterpress Quality"
                </h3>
                <p className="text-sm text-gray-300 mb-4 leading-relaxed">
                  Sappi Paper Engineering conducted independent laboratory testing of Tri-Creaser technology against traditional scoring methods.
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500">✓</span>
                    <span className="text-gray-300">Zero fiber cracking on coated stocks</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500">✓</span>
                    <span className="text-gray-300">3x deeper crease penetration without damage</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-500">✓</span>
                    <span className="text-gray-300">Digital-friendly rubber eliminates toner flaking</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 border border-white/20 p-4 text-center">
                  <div className="text-3xl font-bold mb-1">30,000+</div>
                  <div className="text-xs text-gray-400">Companies Worldwide</div>
                </div>
                <div className="bg-white/10 border border-white/20 p-4 text-center">
                  <div className="text-3xl font-bold mb-1">40,000+</div>
                  <div className="text-xs text-gray-400">Installations</div>
                </div>
                <div className="bg-white/10 border border-white/20 p-4 text-center">
                  <div className="text-3xl font-bold mb-1">25+</div>
                  <div className="text-xs text-gray-400">Years Innovation</div>
                </div>
                <div className="bg-white/10 border border-white/20 p-4 text-center">
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-xs text-gray-400">Quality Guarantee</div>
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
                <h2 className="text-2xl font-bold mb-2">Request Your Free Trial</h2>
                <p className="text-orange-100">
                  See the transformation yourself. Zero commitment. Most companies keep the full system.
                </p>
              </div>
              <a
                href="/contact"
                className="bg-slate-900 text-white px-8 py-3 font-bold hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                Get Started →
              </a>
            </div>
          </div>
        </section>

      </main>
      <MarketingFooter />
    </div>
  );
}
