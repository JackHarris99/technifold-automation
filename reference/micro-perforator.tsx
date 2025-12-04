import { GetStaticProps } from "next";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { slugify } from "@/lib/slugify";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import ToolSidebar from "@/components/ToolSidebar";
import { getManufacturerLogo } from "@/lib/manufacturer-logos";
import ToolQuoteForm from "@/components/ToolQuoteForm";

type DataRow = {
  manufacturer: string;
  model?: string;
  problem: string;
  tool: string;
};

type Props = {
  compatibilityList: {
    manufacturer: string;
    model: string | null;
    useCase: string;
    slug: string;
  }[];
};

export const getStaticProps: GetStaticProps = async () => {
  const file = fs.readFileSync(path.join(process.cwd(), "data", "data.csv"), "utf8");
  const cleanFile = file.replace(/^\uFEFF/, '');
  const { data } = Papa.parse<DataRow>(cleanFile, { header: true });
  const validRows = (data as DataRow[]).filter(
    row => row && row.tool && row.tool === 'Micro Perforator'
  );
  const compatibilityList = validRows.map(row => ({
    manufacturer: row.manufacturer,
    model: row.model || null,
    useCase: row.problem,
    slug: `/${slugify(row.manufacturer)}/${slugify(row.tool)}`,
  }));
  return {
    props: {
      compatibilityList,
    },
  };
};

export default function MicroPerforatorPage({ compatibilityList }: Props) {
  return (
    <>
      <SEOHead
        title="Micro Perforator - Laser-Safe Perforations | Tech-ni-Fold"
        description="Eliminate fibre issues and printer jams. Create perforations that tear cleanly without leaving residue."
        keywords="Micro Perforator, laser-safe perforations, clean tear, printer jams, perforation quality"
      />
      <Layout>
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4">
          <div className="flex-1">
            {/* HERO SECTION */}
            <section className="mb-12">
              <h1 className="text-4xl font-bold mb-6">Micro-Perforator Technical Guide</h1>
              <p className="text-xl text-gray-700 mb-8">
                The world's only rotary solution delivering true industry standard micro-perforating results directly from your folding machine
              </p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <img 
                    src="/images/products/micro-perforator-action.jpg" 
                    alt="Micro Perforator creating clean perforations"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Micro Perforator delivering clean, precise perforations
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4">Superior Engineering Benefits</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Flat perforations vs. OEM's 4mm ridges</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>D2 steel blades last 12-18 months</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>True kiss-cutting maintains sheet integrity</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Laser printer safe - no jamming</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>5 TPI options: 12, 17, 25, 52 & 72</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Handles 60-350gsm stocks perfectly</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>ROI in 1-4 months guaranteed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* VIDEO AND CTA SECTION */}
            <section className="mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">See the Micro Perforator in Action</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/z55CF3zJXC8"
                      title="Micro Perforator demonstration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg shadow-lg"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-4">Ready to Bring Premium Work In-House?</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    Process order forms, coupons, and vouchers that you previously had to outsource. Eliminate flatbed cylinder delays while delivering superior results.
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      Get Your Custom Quote
                    </button>
                    <p className="text-sm text-gray-600 text-center">
                      Response within 2 hours • 100% Money-Back Guarantee
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* WHAT IS MICRO PERFORATOR */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Revolutionary Multi-Blade Solution</h2>
              <p className="text-lg text-gray-700 mb-4">
                Unlike OEM's one-size-fits-none approach, the Micro-Perforator provides three essential perforation 
                styles (12, 17 & 25 TPI) plus optional ultra-fine options (52 & 72 TPI) to handle the complete 
                range from 60gsm paper to 350gsm heavy stocks - exactly what professional applications demand.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Developed from over 20 years of experience with failing OEM tooling, this revolutionary device 
                transforms inadequate factory micro-perforating into professional-grade results that match or 
                exceed flatbed cylinder quality - directly from your folding machine.
              </p>
            </section>

            {/* THE PROBLEM IT SOLVES */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">The Micro-Perforation Crisis</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">OEM Tools Are Destroying Your Business</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Designed 40 years ago for hand-fed inkjet copiers</li>
                    <li>• Random tooth spacing - pure engineering incompetence</li>
                    <li>• 4mm raised ridges that jam every laser printer</li>
                    <li>• Steel blade technology that leaves fiber "flags"</li>
                    <li>• Your brand reputation damaged by their failures</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">The Real Cost of Perforation Failure</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• £1,285 weekly cleaning labor waste</li>
                    <li>• £350 per printer jam complaint</li>
                    <li>• 20% customer defection rate</li>
                    <li>• Lost premium voucher/coupon contracts</li>
                    <li>• Your competitors winning YOUR work</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <p className="text-gray-700">
                  <strong>The Shocking Truth:</strong> Your OEM's "micro-perforating" tool is a 40-year-old design 
                  failure that was never engineered for modern laser printers. Their random tooth spacing and raised 
                  ridge design guarantees printer jams - turning you into their beta tester while your customers suffer.
                </p>
              </div>
            </section>

            {/* VISUAL PROOF: BEFORE & AFTER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Visual Proof: Before & After</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Without Micro Perforator</h3>
                  <img 
                    src="/images/results/perforation-before-1.jpg" 
                    alt="Poor perforation with fibre flags"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Visible fibre "flags"</li>
                    <li>• Uneven tear lines</li>
                    <li>• Printer jam risk</li>
                    <li>• Customer complaints</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">With Micro Perforator</h3>
                  <img 
                    src="/images/results/perforation-after-1.jpg" 
                    alt="Clean perforation tear"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Clean tear edge</li>
                    <li>• No fibre residue</li>
                    <li>• Laser-safe feeding</li>
                    <li>• Zero complaints</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ADVANCED DESIGN FEATURES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Advanced Design Features</h2>
              <div className="bg-blue-50 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-4">Engineering Excellence vs OEM Mediocrity</h3>
                <p className="text-lg text-gray-700 mb-6">
                  While OEMs peddle 40-year-old technology with random tooth spacing that creates fiber "flags" 
                  and 4mm raised ridges that jam laser printers, the Micro-Perforator represents 20+ years of 
                  engineering refinement specifically designed for modern print environments.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Precision D2 Steel Blades</h4>
                    <p className="text-sm text-gray-700">
                      Mathematical tooth spacing creates clean cuts without fiber residue - lasting 12-18 months
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Flat Profile Design</h4>
                    <p className="text-sm text-gray-700">
                      Zero raised edges means sheets feed perfectly through laser printers every time
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">True Kiss-Cutting</h4>
                    <p className="text-sm text-gray-700">
                      Maintains sheet integrity while delivering perfect tear quality - no compromise
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">5 Specialized TPI Options</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>12 TPI:</strong> Heavy stocks and card (200-350gsm)</li>
                  <li>• <strong>17 TPI:</strong> Standard commercial print (150-200gsm)</li>
                  <li>• <strong>25 TPI:</strong> General purpose (80-150gsm)</li>
                  <li>• <strong>52 TPI:</strong> Fine work and thin stocks (60-80gsm)</li>
                  <li>• <strong>72 TPI:</strong> Ultra-fine specialty applications</li>
                </ul>
              </div>
            </section>

            {/* TECHNICAL SPECIFICATIONS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Technical Specifications</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Perforation Quality</td>
                      <td className="px-6 py-4">Precision-engineered for clean tears</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Fiber Residue</td>
                      <td className="px-6 py-4">Zero - guaranteed clean tear</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Printer Compatibility</td>
                      <td className="px-6 py-4">All laser and inkjet printers</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Machine Speed</td>
                      <td className="px-6 py-4">Full production speed</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Installation Time</td>
                      <td className="px-6 py-4">15-30 minutes typical</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Warranty</td>
                      <td className="px-6 py-4">2 years parts and labor</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* COMPATIBLE MACHINES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Universal Equipment Compatibility</h2>
              <p className="text-lg text-gray-700 mb-6">
                The Micro Perforator is engineered to fit ALL major finishing equipment brands
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {compatibilityList.slice(0, 8).map((item, index) => {
                  const logo = getManufacturerLogo(item.manufacturer);
                  return logo ? (
                    <div key={index} className="bg-white rounded-lg shadow p-4 flex items-center justify-center">
                      <img src={logo} alt={item.manufacturer} className="h-12 object-contain" />
                    </div>
                  ) : null;
                })}
              </div>
              <p className="text-sm text-gray-600 mt-4 text-center">
                Compatible with Duplo, Morgana, Count, and all other major brands
              </p>
            </section>

            {/* IMMEDIATE BUSINESS TRANSFORMATION */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Immediate Business Transformation</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Day One Impact</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Printer jam complaints stop immediately</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Production speed doubles without quality compromise</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Premium voucher work comes in-house profitably</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Cleaning labor eliminated permanently</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">New Revenue Opportunities</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Premium direct mail response cards</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>High-value voucher and coupon contracts</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Pharmaceutical detachable forms</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Banking and financial mailings</span>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="mt-8 bg-blue-50 rounded-lg p-6">
                <p className="text-lg text-gray-700 text-center">
                  <strong>Bottom Line:</strong> The Micro-Perforator pays for itself in 1-4 months through labor 
                  savings alone, while opening doors to premium contracts your competitors can't handle.
                </p>
              </div>
            </section>

            {/* PROFESSIONAL APPLICATIONS */}
            <section className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Professional Applications</h2>
              <h3 className="text-xl font-semibold mb-4">Premium Work That Pays Premium Prices:</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>High-Value Vouchers:</strong> Retail promotions, loyalty rewards</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Response Cards:</strong> Direct mail campaigns, surveys</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Order Forms:</strong> Catalog inserts, subscription cards</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Membership Cards:</strong> Detachable ID cards, passes</span>
                  </li>
                </ul>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Event Tickets:</strong> Entry tickets, parking passes</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Payment Stubs:</strong> Utility bills, invoice remittance</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Gaming Cards:</strong> Lottery tickets, scratch cards</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Pharmaceutical:</strong> Prescription forms, patient cards</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* ROI SECTION */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Financial Impact Analysis</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Revenue Impact</th>
                      <th className="px-6 py-4 text-right">Weekly Loss (Before)</th>
                      <th className="px-6 py-4 text-right">Weekly Gain (After)</th>
                      <th className="px-6 py-4 text-right">Net Improvement</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">Cleaning Labor Waste</td>
                      <td className="px-6 py-4 text-right text-red-600">-£390</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">+£390</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Jam Complaint Costs</td>
                      <td className="px-6 py-4 text-right text-red-600">-£700</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">+£700</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Lost Production Time</td>
                      <td className="px-6 py-4 text-right text-red-600">-£195</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">+£195</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">New Premium Contracts</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right text-green-600">+£2,800</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-600">+£2,800</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold">Total Weekly Impact</td>
                      <td className="px-6 py-4 text-right text-red-600">-£1,285</td>
                      <td className="px-6 py-4 text-right text-green-600">+£2,800</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">+£4,085</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center mt-6 text-lg font-semibold text-gray-700">
                Typical ROI: 1-4 months from cost savings alone. New revenue opportunities provide unlimited upside.
              </p>
            </section>

            {/* OBJECTION HANDLING */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Common Concerns Addressed</h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-2">"Our OEM says their tool is designed for our machine..."</h3>
                  <p className="text-gray-700 mb-2">
                    <strong>Reality Check:</strong> Your OEM's perforator was designed 40 years ago for hand-fed copiers, 
                    not modern laser printers. They've never updated it because selling you a failing tool is profitable - 
                    you keep buying replacements while your customers suffer.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">"We've tried other perforators before..."</h3>
                  <p className="text-gray-700 mb-2">
                    <strong>The Difference:</strong> Other "solutions" are just variations of the same failed OEM design. 
                    The Micro-Perforator is the ONLY tool engineered from scratch specifically for laser printer compatibility. 
                    That's why we can guarantee zero jams - nobody else dares make that promise.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">"Installation seems complicated..."</h3>
                  <p className="text-gray-700 mb-2">
                    <strong>Simple Truth:</strong> If you can change a scoring wheel, you can install the Micro-Perforator. 
                    Takes 15-30 minutes with our photo guide. We provide phone support if needed, but most customers 
                    don't even call - it's that straightforward.
                  </p>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">"We're not sure about the investment..."</h3>
                  <p className="text-gray-700">
                    <strong>Do the Math:</strong> You're already losing £1,285 every week to cleaning labor and complaints. 
                    The Micro-Perforator pays for itself in 1-4 months through savings alone. Plus our 90-day money-back 
                    guarantee means zero risk. Can you afford NOT to fix this problem?
                  </p>
                </div>
              </div>
            </section>

            {/* INSTALLATION OVERVIEW */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">15-Minute Installation Process</h2>
              <p className="text-lg text-gray-700 mb-6">
                So simple your operator can do it - no technician required
              </p>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Remove OEM Failure</h3>
                    <p className="text-gray-700">2 minutes - Remove the tool that's been costing you thousands</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Install Success</h3>
                    <p className="text-gray-700">5 minutes - Micro-Perforator drops into existing mounting</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Set & Test</h3>
                    <p className="text-gray-700">8 minutes - Adjust pressure, run test sheet, start producing</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 bg-blue-50 rounded-lg p-4">
                <p className="text-gray-700 text-center">
                  <strong>Support Available:</strong> Phone guidance included, but 95% of customers never need to call
                </p>
              </div>
            </section>

            {/* CUSTOMER SUCCESS STORIES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Customer Success Stories</h2>
              
              <div className="space-y-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <blockquote className="italic text-lg text-gray-700 mb-3">
                    "The Micro-Perforator transformed our direct mail operation. We went from outsourcing £8,000/month 
                    in voucher work to bringing it all in-house profitably. Zero printer jams since day one. This tool 
                    literally saved our business during COVID when we lost 40% of our regular work."
                  </blockquote>
                  <p className="text-gray-600 font-semibold">- Operations Director, Manchester Print Co.</p>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white rounded p-3 text-center">
                      <p className="text-sm text-gray-600">Monthly Savings</p>
                      <p className="font-bold text-green-600">£8,000</p>
                    </div>
                    <div className="bg-white rounded p-3 text-center">
                      <p className="text-sm text-gray-600">ROI Period</p>
                      <p className="font-bold">6 weeks</p>
                    </div>
                    <div className="bg-white rounded p-3 text-center">
                      <p className="text-sm text-gray-600">Jam Complaints</p>
                      <p className="font-bold text-green-600">Zero</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <blockquote className="italic text-lg text-gray-700 mb-3">
                    "Our pharmaceutical client was ready to pull a £250,000 annual contract due to perforation issues. 
                    The Micro-Perforator not only saved the contract but impressed them so much we won an additional 
                    £180,000 in new business. Best investment we've ever made."
                  </blockquote>
                  <p className="text-gray-600 font-semibold">- Managing Director, Birmingham Commercial Print</p>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white rounded p-3 text-center">
                      <p className="text-sm text-gray-600">Contract Saved</p>
                      <p className="font-bold text-green-600">£250,000</p>
                    </div>
                    <div className="bg-white rounded p-3 text-center">
                      <p className="text-sm text-gray-600">New Business</p>
                      <p className="font-bold text-green-600">£180,000</p>
                    </div>
                    <div className="bg-white rounded p-3 text-center">
                      <p className="text-sm text-gray-600">Total Impact</p>
                      <p className="font-bold text-green-600">£430,000</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <blockquote className="italic text-lg text-gray-700 mb-3">
                    "We were spending 3 hours every morning cleaning fiber debris from OEM perforators. The Micro-Perforator 
                    eliminated this completely. My operators actually thanked me for buying it - first time that's happened 
                    in 20 years!"
                  </blockquote>
                  <p className="text-gray-600 font-semibold">- Production Manager, Leeds Print Services</p>
                  <div className="grid md:grid-cols-3 gap-4 mt-4">
                    <div className="bg-white rounded p-3 text-center">
                      <p className="text-sm text-gray-600">Daily Time Saved</p>
                      <p className="font-bold text-green-600">3 hours</p>
                    </div>
                    <div className="bg-white rounded p-3 text-center">
                      <p className="text-sm text-gray-600">Weekly Labor Saved</p>
                      <p className="font-bold text-green-600">£525</p>
                    </div>
                    <div className="bg-white rounded p-3 text-center">
                      <p className="text-sm text-gray-600">Operator Satisfaction</p>
                      <p className="font-bold text-green-600">100%</p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* RISK-FREE INVESTMENT */}
            <section className="mb-12 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-center">Risk-Free Investment Protected by 3 Guarantees</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg p-6 text-center shadow">
                  <div className="text-4xl mb-3">💰</div>
                  <h3 className="font-bold text-lg mb-2">90-Day Money Back</h3>
                  <p className="text-gray-700">Full refund if you're not 100% satisfied - no questions asked</p>
                </div>
                <div className="bg-white rounded-lg p-6 text-center shadow">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="font-bold text-lg mb-2">Zero Jam Guarantee</h3>
                  <p className="text-gray-700">If ANY customer reports a jam, we'll refund your investment</p>
                </div>
                <div className="bg-white rounded-lg p-6 text-center shadow">
                  <div className="text-4xl mb-3">📈</div>
                  <h3 className="font-bold text-lg mb-2">ROI Promise</h3>
                  <p className="text-gray-700">Documented savings within 90 days or your money back</p>
                </div>
              </div>
              <p className="text-center mt-6 text-lg text-gray-700">
                <strong>Why we can guarantee this:</strong> In 20+ years, we've never had a return. Not one.
              </p>
            </section>

            {/* COMPLETE SOLUTION PACKAGE */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Your Complete Micro-Perforation Solution</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">What's Included:</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>✓ Precision Micro-Perforator for your specific machine</li>
                    <li>✓ Complete installation guide with photos</li>
                    <li>✓ Direct phone support during setup</li>
                    <li>✓ 3-year warranty on all components</li>
                    <li>✓ Lifetime technical support</li>
                    <li>✓ 90-day money-back guarantee</li>
                    <li>✓ Priority shipping included</li>
                  </ul>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Exclusive Bonuses:</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>🎁 <strong>TPI Selection Guide:</strong> Choose perfect settings for any job</li>
                    <li>🎁 <strong>Premium Applications Manual:</strong> Maximize revenue opportunities</li>
                    <li>🎁 <strong>Troubleshooting Videos:</strong> Solve any issue in minutes</li>
                    <li>🎁 <strong>Customer Success Templates:</strong> Win more premium contracts</li>
                    <li>🎁 <strong>ROI Calculator:</strong> Track your savings and profits</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section id="quote-form" className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-lg p-12 text-center text-white">
              <h2 className="text-3xl font-bold mb-4">
                Stop Losing £1,285 Every Week to OEM Failures
              </h2>
              <p className="text-xl mb-8">
                Your competitors are already using Micro-Perforator to win YOUR premium contracts
              </p>
              
              <div className="bg-red-600 text-white rounded-lg p-4 mb-8 max-w-2xl mx-auto">
                <p className="font-bold text-lg">
                  ⚠️ WARNING: Every week you delay costs you £1,285 in waste PLUS lost premium contracts
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6 mb-8 max-w-3xl mx-auto">
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <p className="font-bold text-2xl">90-Day</p>
                  <p className="text-sm">Money-Back Guarantee</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <p className="font-bold text-2xl">Zero</p>
                  <p className="text-sm">Jam Guarantee</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-lg p-6">
                  <p className="font-bold text-2xl">1-4 Month</p>
                  <p className="text-sm">Proven ROI</p>
                </div>
              </div>

              <div className="max-w-2xl mx-auto bg-white rounded-lg p-8">
                <h3 className="text-2xl font-bold mb-6 text-gray-900">
                  Get Your Quote Now - Installation Available This Week
                </h3>
                <ToolQuoteForm toolName="Micro-Perforator" />
              </div>
              
              <div className="mt-8">
                <p className="text-lg mb-2">
                  Questions? Call Jack Harris directly:
                </p>
                <p className="text-2xl font-bold">
                  📞 +44 (0)1455 554491
                </p>
                <p className="text-sm mt-2">
                  Monday-Friday 8am-5pm GMT • 2-hour response guaranteed
                </p>
              </div>
            </section>
          </div>
          <ToolSidebar compatibilityList={compatibilityList} />
        </div>
      </Layout>
    </>
  );
}