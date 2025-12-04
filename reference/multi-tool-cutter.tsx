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
    row => row && row.tool && row.tool === 'Multi-tool Cutter'
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

export default function MultiToolCutterPage({ compatibilityList }: Props) {
  return (
    <>
      <SEOHead
        title="Multi-Tool Cutter - All-in-One Cutting Solution | Tech-ni-Fold"
        description="Eliminate tool changes forever. Cut, crease, and perforate with one revolutionary tool. Save 1-2 hours per shift."
        keywords="Multi-Tool Cutter, multi-function cutting, tool changes, cutting efficiency, all-in-one"
      />
      <Layout>
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4">
          <div className="flex-1">
            {/* HERO SECTION */}
            <section className="mb-12">
              <h1 className="text-4xl font-bold mb-6">Multi-Tool Cutter Technical Guide</h1>
              <p className="text-xl text-gray-700 mb-8">
                Revolutionary all-in-one cutting technology - eliminate tool changes forever
              </p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <img 
                    src="/images/products/multi-tool-action.jpg" 
                    alt="Multi-Tool Cutter in operation"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Multi-Tool Cutter handling cuts, creases, and perforations in one pass
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4">Key Benefits</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Cut, crease, and perforate with ONE tool</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Zero tool change downtime</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Save 1-2 hours per shift</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Replace 5-8 separate tools</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Increase throughput by 15%</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Universal machine compatibility</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>ROI in 4-6 weeks typical</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* VIDEO AND CTA SECTION */}
            <section className="mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">See the Multi-Tool Cutter in Action</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/Cbd3I5rSd7w"
                      title="Multi-Tool Cutter demonstration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg shadow-lg"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-4">Ready to Eliminate Tool Changes Forever?</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    Join thousands of print shops saving hours daily with the Multi-Tool Cutter.
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

            {/* WHAT IS THE MULTI-TOOL CUTTER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What is the Multi-Tool Cutter?</h2>
              <p className="text-lg text-gray-700 mb-4">
                The Multi-Tool Cutter is a revolutionary all-in-one cutting solution that combines straight 
                cutting, perforating, and creasing capabilities in a single tool. This patented design eliminates 
                the need for constant tool changes, dramatically improving productivity and reducing operator fatigue.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Developed for modern print shops handling diverse job requirements, the Multi-Tool Cutter has 
                become essential for operations looking to maximize equipment efficiency while maintaining 
                flexibility for any job type.
              </p>
            </section>

            {/* THE PROBLEM IT SOLVES */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">The Tool Change Time Drain</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Traditional Tool Limitations</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• 5-8 different tools required</li>
                    <li>• 10-15 minutes per tool change</li>
                    <li>• 35% of jobs need multiple tools</li>
                    <li>• Storage space for redundant tools</li>
                    <li>• Operator fatigue from changes</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Production Impact</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• 1-2 hours lost per shift</li>
                    <li>• £165 per hour in setup downtime</li>
                    <li>• Complex jobs require multiple passes</li>
                    <li>• Limited flexibility for rush jobs</li>
                    <li>• 40% storage space wasted</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <p className="text-gray-700">
                  <strong>Industry Reality:</strong> Modern job complexity means constant tool changes. Print 
                  shops waste hours daily swapping between cutting, perforating, and creasing tools - time that 
                  should be spent producing revenue.
                </p>
              </div>
            </section>

            {/* VISUAL PROOF: BEFORE & AFTER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Visual Proof: Before & After</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Without Multi-Tool Cutter</h3>
                  <img 
                    src="/images/results/cutting-before-1.jpg" 
                    alt="Multiple tools and changeovers"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• 5-8 separate tools needed</li>
                    <li>• Constant changeovers</li>
                    <li>• Storage clutter</li>
                    <li>• Production delays</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">With Multi-Tool Cutter</h3>
                  <img 
                    src="/images/results/cutting-after-1.jpg" 
                    alt="Single multi-function tool"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• ONE tool does it all</li>
                    <li>• Zero changeovers</li>
                    <li>• Clean workspace</li>
                    <li>• Continuous production</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS - TECHNICAL */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Multi-Function Technology Explained</h2>
              <div className="bg-blue-50 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-4">The Engineering Behind Multi-Tool Cutter</h3>
                <p className="text-lg text-gray-700 mb-6">
                  The Multi-Tool Cutter uses a revolutionary segmented design that incorporates cutting edges, 
                  perforating teeth, and creasing channels in a single tool body. Operators simply position the 
                  appropriate segment for each operation without removing the tool.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Cutting Segment</h4>
                    <p className="text-sm text-gray-700">
                      Precision-ground edge for clean straight cuts
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Perforating Segment</h4>
                    <p className="text-sm text-gray-700">
                      50/50 micro teeth for perfect perforations
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Creasing Segment</h4>
                    <p className="text-sm text-gray-700">
                      Channel-creating profile for crack-free creases
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Key Technical Advantages</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Three functions in one tool body</li>
                  <li>• Quick segment selection without removal</li>
                  <li>• Maintains precision across all functions</li>
                  <li>• Reduced storage requirements by 80%</li>
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
                      <td className="px-6 py-4 font-semibold bg-gray-50">Functions</td>
                      <td className="px-6 py-4">Cut, Crease, Perforate</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Tool Changes Required</td>
                      <td className="px-6 py-4">Zero - all functions built-in</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Time Savings</td>
                      <td className="px-6 py-4">1-2 hours per shift</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Storage Reduction</td>
                      <td className="px-6 py-4">80% less tool storage needed</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Installation</td>
                      <td className="px-6 py-4">Direct replacement</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Warranty</td>
                      <td className="px-6 py-4">3 years parts and labor</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* COMPATIBLE MACHINES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Universal Machine Compatibility</h2>
              <p className="text-lg text-gray-700 mb-6">
                The Multi-Tool Cutter is engineered to fit ALL major cutting and finishing equipment
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
                Compatible with all major die-cutting and finishing systems
              </p>
            </section>

            {/* PROBLEM-SOLVING METRICS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Quantified Improvements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">100%</p>
                  <p className="text-sm text-gray-700">Tool Changes Eliminated</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">3-in-1</p>
                  <p className="text-sm text-gray-700">Functions Combined</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">15%</p>
                  <p className="text-sm text-gray-700">Throughput Increase</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">4-6 wks</p>
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
                      <td className="px-6 py-4">Tool Change Downtime</td>
                      <td className="px-6 py-4 text-right">£825</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£825</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Multiple Pass Jobs</td>
                      <td className="px-6 py-4 text-right">£495</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£495</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Tool Storage/Management</td>
                      <td className="px-6 py-4 text-right">£165</td>
                      <td className="px-6 py-4 text-right">£33</td>
                      <td className="px-6 py-4 text-right font-semibold">£132</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold">Total Weekly Impact</td>
                      <td className="px-6 py-4 text-right">£1,485</td>
                      <td className="px-6 py-4 text-right">£33</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">£1,452</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center mt-6 text-lg font-semibold text-gray-700">
                Based on typical 2-shift operation. Savings increase with job diversity.
              </p>
            </section>

            {/* INSTALLATION OVERVIEW */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Simple Installation Process</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Remove Existing Tools</h3>
                    <p className="text-gray-700">Clear out your collection of single-function tools</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Install Multi-Tool Cutter</h3>
                    <p className="text-gray-700">Mount using your existing tool holder system</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Operator Training</h3>
                    <p className="text-gray-700">Quick training on segment selection and positioning</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Start Saving Time</h3>
                    <p className="text-gray-700">Immediate productivity gains with zero tool changes</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-gray-700">
                <strong>Installation support:</strong> Phone or on-site training available
              </p>
            </section>

            {/* CUSTOMER SUCCESS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Real-World Results</h2>
              <blockquote className="bg-gray-50 rounded-lg p-6 italic text-lg text-gray-700 mb-6">
                "The Multi-Tool Cutter revolutionized our finishing department. We went from 8 tool changes 
                per shift to zero. The time savings alone paid for it in 5 weeks, and our operators love 
                not having to constantly swap tools."
              </blockquote>
              <p className="text-gray-600 mb-4">- Finishing Manager, Leeds Print Group</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Before:</p>
                  <p className="text-gray-700">8 changes/shift, 2 hours lost</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">After:</p>
                  <p className="text-gray-700">Zero changes, full production</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Result:</p>
                  <p className="text-gray-700">£1,452 weekly savings</p>
                </div>
              </div>
            </section>

            {/* 60-DAY GUARANTEE */}
            <section className="mb-12 bg-green-50 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">60-Day Money-Back Guarantee</h2>
              <p className="text-lg text-gray-700 mb-4">
                We're so confident the Multi-Tool Cutter will transform your operation that we offer a full 
                60-day money-back guarantee. If you're not completely satisfied with the time savings, 
                we'll refund your investment.
              </p>
              <p className="text-gray-600">No risk. No hassle. Just results.</p>
            </section>

            {/* WHAT'S INCLUDED */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What's Included</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>✓ Multi-Tool Cutter with all three functions</li>
                  <li>✓ Quick-reference operation guide</li>
                  <li>✓ Operator training (phone or on-site)</li>
                  <li>✓ 3-year parts and labor warranty</li>
                  <li>✓ Lifetime technical support</li>
                  <li>✓ 60-day money-back guarantee</li>
                </ul>
              </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section id="quote-form" className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-12 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Ready to Transform Your Production?
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Join thousands of successful print shops using Multi-Tool Cutter technology
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
                <ToolQuoteForm toolName="Multi-Tool Cutter" />
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