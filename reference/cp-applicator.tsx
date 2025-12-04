import { GetStaticProps } from "next";
import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { slugify } from "@/lib/slugify";
import Layout from "@/components/Layout";
import SEOHead from "@/components/SEOHead";
import ToolSidebar from "@/components/ToolSidebar";
import ToolQuoteForm from "@/components/ToolQuoteForm";
import { getManufacturerLogo } from "@/lib/manufacturer-logos";

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
    row => row && row.tool && row.tool === 'CP Applicator'
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

export default function CPApplicatorPage({ compatibilityList }: Props) {
  return (
    <>
      <SEOHead
        title="CP Applicator - Revolutionary Close Proximity Technology | Tech-ni-Fold"
        description="Produce micro-perforations as close as 5mm from crease lines. Perfect for signatures, coupons, tickets with tear-off sections. Works at maximum machine speed."
        keywords="CP Applicator, close proximity, micro-perforating, tear-off sections, signatures, coupons, tickets"
      />
      <Layout>
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4">
          <div className="flex-1">
            {/* HERO SECTION */}
            <section className="mb-12">
              <h1 className="text-4xl font-bold mb-6">CP Applicator Technical Guide</h1>
              <p className="text-xl text-gray-700 mb-8">
                Revolutionary close proximity technology - micro-perforations as close as 5mm from crease lines
              </p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <img 
                    src="/images/products/cp-applicator-action.jpg" 
                    alt="CP Applicator enabling close proximity work"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-600 text-center mt-2">
                    CP Applicator creating crease and perforation 3mm apart
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4">Key Benefits</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Micro-perforates as close as 5mm from crease line</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Up to 50mm spacing for versatile applications</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Works at your equipment's maximum speed</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Perfect cross-grain performance</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>17, 25 & 52 teeth per inch options</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Colour-coded creasing ribs</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>No speed limitations</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* VIDEO AND CTA SECTION */}
            <section className="mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">See the CP Applicator in Action</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/Tb1IEVfZrM0"
                      title="CP Applicator demonstration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg shadow-lg"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-4">Ready to Achieve 5mm Proximity?</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    Join print shops producing impossible close proximity work with the CP Applicator.
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

            {/* WHAT IS CP APPLICATOR */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What is the CP Applicator?</h2>
              <p className="text-lg text-gray-700 mb-4">
                The CP Applicator represents revolutionary close proximity technology that produces micro-perforations 
                as close as 5mm from crease lines - 80% closer than any OEM device. Where factory tooling requires 
                massive 25mm+ spacing between operations, the CP Applicator brings single-pass capability to the 
                most challenging modern design work.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                This breakthrough enables perfect execution of signatures, tear-off coupons, event tickets and 
                precision direct mail pieces featuring ultra-close crease and perforation proximity that would 
                otherwise require costly two-pass production or complete rejection.
              </p>
            </section>

            {/* THE PROBLEM IT SOLVES */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">The Close Proximity Crisis</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">OEM Tooling Forces 25mm Minimum Spacing</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Two-pass production required for modern designs</li>
                    <li>• Registration nightmares cost hours daily</li>
                    <li>• 40% of design work must be rejected</li>
                    <li>• Customers forced to simplify designs</li>
                    <li>• Lost revenue from turned-away jobs</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">The Business Cost</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• £195/hour productivity loss on two-pass work</li>
                    <li>• 15% material waste from misregistration</li>
                    <li>• Premium job opportunities lost to competitors</li>
                    <li>• Reputation damage from design limitations</li>
                    <li>• Operating below true profit potential</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <p className="text-gray-700">
                  <strong>Market Reality:</strong> Today's signature work, event tickets, direct mail and tear-off 
                  coupons demand crease-to-perforation spacing your OEM tools simply cannot achieve. While designs 
                  evolve toward tighter tolerances, you're trapped with 1970s spacing limitations.
                </p>
              </div>
            </section>

            {/* VISUAL PROOF: BEFORE & AFTER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Visual Proof: Before & After</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Without CP Applicator</h3>
                  <img 
                    src="/images/results/cp-applicator-before.jpg" 
                    alt="Two-pass production required"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Two separate passes required</li>
                    <li>• Registration challenges</li>
                    <li>• Production delays</li>
                    <li>• Higher waste rates</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">With CP Applicator</h3>
                  <img 
                    src="/images/results/cp-applicator-after.jpg" 
                    alt="Single-pass close proximity work"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Single-pass production</li>
                    <li>• Perfect registration</li>
                    <li>• 3mm proximity achieved</li>
                    <li>• Zero waste increase</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS - TECHNICAL */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Revolutionary Close Proximity Technology</h2>
              <div className="bg-blue-50 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-4">Dual Function Excellence</h3>
                <p className="text-lg text-gray-700 mb-6">
                  The CP Applicator seamlessly combines creasing and micro-perforating operations in a single pass, 
                  with operations possible as close as 5mm apart. This patented design eliminates the spacing 
                  constraints that have limited print finishing for decades.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">5mm Minimum Spacing</h4>
                    <p className="text-sm text-gray-700">
                      80% closer than any OEM tool - enabling designs previously impossible
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Maximum Speed Operation</h4>
                    <p className="text-sm text-gray-700">
                      Works at your machine's full rated speed without limitations
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Universal Cross-Grain</h4>
                    <p className="text-sm text-gray-700">
                      Perfect performance with or against the grain direction
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Colour-Coded Setup System</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Blue Hub:</strong> 17 teeth per inch for heavyweight stocks</li>
                  <li>• <strong>Green Hub:</strong> 25 teeth per inch for standard applications</li>
                  <li>• <strong>Red Hub:</strong> 52 teeth per inch for delicate materials</li>
                  <li>• <strong>Instant Recognition:</strong> No guesswork or measurement needed</li>
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
                      <td className="px-6 py-4 font-semibold bg-gray-50">Minimum Spacing</td>
                      <td className="px-6 py-4">5mm from crease line (80% closer than OEM)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Maximum Spacing</td>
                      <td className="px-6 py-4">Up to 50mm for versatile applications</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Perforation Options</td>
                      <td className="px-6 py-4">17, 25 & 52 teeth per inch</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Speed Capability</td>
                      <td className="px-6 py-4">Maximum machine speed - no limitations</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Grain Direction</td>
                      <td className="px-6 py-4">Perfect cross-grain performance</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Setup System</td>
                      <td className="px-6 py-4">Colour-coded instant identification</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* PERFECT APPLICATIONS */}
            <section className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Perfect Applications</h2>
              <h3 className="text-xl font-semibold mb-4">Transform Your Production Capabilities:</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Signatures with tear-off sections</strong> - Single-pass perfection</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Promotional coupons</strong> - Clean removal without damage</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Event tickets</strong> - Professional stub separation</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Direct mail pieces</strong> - Complex designs made simple</span>
                  </li>
                </ul>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Reply cards</strong> - Perfect fold and tear combinations</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Raffle ticket books</strong> - Precise sequential tearing</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Parking permits</strong> - Secure yet removable sections</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span><strong>Any design requiring ultra-close tolerances</strong></span>
                  </li>
                </ul>
              </div>
            </section>

            {/* COMPLETE SYSTEM COMPONENTS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Complete System Components</h2>
              <div className="bg-blue-50 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-4">Everything You Need for Success</h3>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Micro-Perforating Excellence:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Blue Hub (17 TPI):</strong> Heavy stocks and cardboards</li>
                      <li>• <strong>Green Hub (25 TPI):</strong> Standard commercial printing</li>
                      <li>• <strong>Red Hub (52 TPI):</strong> Lightweight and delicate stocks</li>
                      <li>• <strong>Precision teeth:</strong> Clean, flat perforations every time</li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-3">Creasing System Components:</h4>
                    <ul className="space-y-2 text-gray-700">
                      <li>• <strong>Colour-coded ribs:</strong> Instant visual identification</li>
                      <li>• <strong>Multiple width options:</strong> Match any substrate weight</li>
                      <li>• <strong>Quick-change design:</strong> Swap setups in seconds</li>
                      <li>• <strong>Lifetime durability:</strong> Engineered for millions of impressions</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            {/* COMPATIBLE MACHINES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Universal Equipment Compatibility</h2>
              <p className="text-lg text-gray-700 mb-6">
                The CP Applicator is engineered to fit ALL major finishing and converting equipment
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
                Works with all die-cutting and finishing systems
              </p>
            </section>

            {/* PROBLEM-SOLVING METRICS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Quantified Improvements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">5mm</p>
                  <p className="text-sm text-gray-700">Minimum Spacing</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">100%</p>
                  <p className="text-sm text-gray-700">Single Pass Success</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">Zero</p>
                  <p className="text-sm text-gray-700">Registration Errors</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">3-4 wks</p>
                  <p className="text-sm text-gray-700">Typical ROI</p>
                </div>
              </div>
            </section>

            {/* ROI SECTION */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Investment Return Analysis</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Cost Factor</th>
                      <th className="px-6 py-4 text-right">Before</th>
                      <th className="px-6 py-4 text-right">After</th>
                      <th className="px-6 py-4 text-right">Weekly Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">Two-Pass Production Time</td>
                      <td className="px-6 py-4 text-right">£975</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£975</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Registration Waste</td>
                      <td className="px-6 py-4 text-right">£225</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£225</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Lost Job Revenue</td>
                      <td className="px-6 py-4 text-right">£450</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£450</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold">Total Weekly Impact</td>
                      <td className="px-6 py-4 text-right">£1,650</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">£1,650</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center mt-6 text-lg font-semibold text-gray-700">
                Plus ability to accept 40% more profitable design work
              </p>
            </section>

            {/* INSTALLATION OVERVIEW */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Simple Installation Process</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Equipment Assessment</h3>
                    <p className="text-gray-700">Verify compatibility with your finishing equipment</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Tool Installation</h3>
                    <p className="text-gray-700">Mount CP Applicator using existing tool holders</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Proximity Setup</h3>
                    <p className="text-gray-700">Configure for your specific proximity requirements</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Production Ready</h3>
                    <p className="text-gray-700">Start accepting close proximity work immediately</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-gray-700">
                <strong>Installation time:</strong> 30-60 minutes typical
              </p>
            </section>

            {/* CUSTOMER SUCCESS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Real-World Results</h2>
              <blockquote className="bg-gray-50 rounded-lg p-6 italic text-lg text-gray-700 mb-6">
                "The CP Applicator opened up a whole new revenue stream. We can now accept complex design 
                work we previously had to turn away. Last month alone we took on £8,000 in jobs that would 
                have been impossible without it."
              </blockquote>
              <p className="text-gray-600 mb-4">- Operations Manager, Glasgow Design Print</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Before:</p>
                  <p className="text-gray-700">40% jobs rejected</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">After:</p>
                  <p className="text-gray-700">100% jobs accepted</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Result:</p>
                  <p className="text-gray-700">£8,000 new revenue/month</p>
                </div>
              </div>
            </section>

            {/* 30-DAY GUARANTEE */}
            <section className="mb-12 bg-green-50 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">30-Day Performance Guarantee</h2>
              <p className="text-lg text-gray-700 mb-4">
                We guarantee the CP Applicator will enable 3mm proximity operations in a single pass on your 
                equipment. If it doesn't perform as promised, we'll refund your investment completely.
              </p>
              <p className="text-gray-600">No risk. No hassle. Just results.</p>
            </section>

            {/* WHAT'S INCLUDED */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What's Included</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>✓ CP Applicator for your equipment type</li>
                  <li>✓ Setup and calibration guide</li>
                  <li>✓ Phone support during installation</li>
                  <li>✓ 2-year parts and labor warranty</li>
                  <li>✓ Lifetime technical support</li>
                  <li>✓ 30-day performance guarantee</li>
                </ul>
              </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section id="quote-form" className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-12 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Ready to Transform Your Production?
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Join thousands of successful print shops using CP Applicator technology
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="bg-blue-900 text-white rounded-lg p-6">
                  <p className="font-bold text-2xl">100%</p>
                  <p className="text-sm">Money-Back Guarantee</p>
                </div>
                <div className="bg-blue-900 text-white rounded-lg p-6">
                  <p className="font-bold text-2xl">2 Hour</p>
                  <p className="text-sm">Quote Response</p>
                </div>
                <div className="bg-blue-900 text-white rounded-lg p-6">
                  <p className="font-bold text-2xl">25 Years</p>
                  <p className="text-sm">Industry Experience</p>
                </div>
              </div>

              <div className="max-w-2xl mx-auto">
                <ToolQuoteForm toolName="CP-Applicator" />
              </div>
              <p className="text-gray-600 mt-4">
                Or call us directly: <strong>+44 (0)1455 554491</strong>
              </p>
            </section>
          </div>
          <ToolSidebar compatibilityList={compatibilityList} />
        </div>
      </Layout>
    </>
  );
}