import { MarketingHeader } from '@/components/marketing/MarketingHeader';
import { MarketingFooter } from '@/components/marketing/MarketingFooter';

export const metadata = {
  title: 'Web-Tool - Web Press Creasing Solution | Technifold',
  description: 'Precision creasing for web-fed presses. Handle high-speed production with zero cracking.',
};

export default function WebToolPage() {
  return (
    <div className="min-h-screen bg-white">
      <MarketingHeader />

      {/* Compact Hero */}
      <section className="bg-slate-900 text-white py-12 border-b-4 border-orange-500">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-2 bg-orange-500/20 border border-orange-500/30 px-3 py-1 text-xs font-bold mb-3 text-orange-300 inline-flex">
            Web Press Creasing
          </div>

          <h1 className="text-3xl font-bold mb-3">Web-Tool</h1>
          <p className="text-lg text-gray-300 mb-6 max-w-3xl">
            Precision creasing for high-speed web-fed production. Zero cracking at production speeds.
          </p>

          <a
            href="/contact"
            className="inline-block bg-orange-500 text-white px-6 py-2 text-sm font-bold hover:bg-orange-600 transition-colors"
          >
            Request Free Trial →
          </a>
        </div>
      </section>

      {/* Applications - Compact */}
      <section className="py-10 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between mb-6 pb-3 border-b-2 border-gray-300">
            <div>
              <div className="inline-block bg-orange-100 text-orange-800 px-3 py-1 text-xs font-bold uppercase tracking-wide mb-2">
                High-Speed Production
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Web Press Quality at Production Speed</h2>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-white border-2 border-gray-200 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Web Press Applications</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span><span>High-volume magazine production</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span><span>Catalog and directory printing</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span><span>Direct mail and commercial work</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-500 font-bold">•</span><span>Newspaper and tabloid formats</span></li>
              </ul>
            </div>

            <div className="bg-green-50 border-2 border-green-500 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Production Benefits</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>Zero cracking at production speeds</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>Consistent quality across long runs</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>Minimal setup and changeover time</span></li>
                <li className="flex items-start gap-2"><span className="text-green-600">✓</span><span>Proven Tri-Creaser technology for web</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - Compact */}
      <section className="py-10 bg-orange-500 text-white border-t-4 border-orange-600">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Transform Web Press Quality</h2>
              <p className="text-orange-100">
                See how Web-Tool delivers crack-free creasing at production speed.
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
