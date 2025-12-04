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
    row => row && row.tool && row.tool.toLowerCase() === 'quad-creaser'
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

export default function QuadCreaserPage({ compatibilityList }: Props) {
  return (
    <>
      <SEOHead
        title="Quad-Creaser - Perfect Binding Cover Solution | Tech-ni-Fold"
        description="Eliminate perfect binding cover failures. Inline 4-spine creasing prevents stress cracks on 250gsm+ covers. Save 6-8 hours per 1000 books."
        keywords="Quad-Creaser, perfect binding, cover creasing, binding equipment, book production"
      />
      <Layout>
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4">
          <div className="flex-1">
            {/* HERO SECTION */}
            <section className="mb-12">
              <h1 className="text-4xl font-bold mb-6">Quad-Creaser Technical Guide</h1>
              <p className="text-xl text-gray-700 mb-8">
                It is a simple fact; Perfect Bound books are often judged by their cover…
              </p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <img 
                    src="/images/products/quad-creaser-action.jpg" 
                    alt="Quad-Creaser installed on perfect binder"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Quad-Creaser producing letterpress quality creasing to spine & hinge areas
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4">Key Benefits</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Eliminates spine & hinge cracking</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>3 times deeper than OEM scoring</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Can crease both sides of cover</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>1-4 crease lines simultaneously</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Color-coding for fast setup</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>No more outsourcing covers</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Improves glue contact at hinge</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* VIDEO AND CTA SECTION */}
            <section className="mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">See the Quad-Creaser in Action</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/2_76v5KYx5U"
                      title="Quad-Creaser demonstration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg shadow-lg"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-4">Ready to Perfect Your Binding?</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    Join thousands of binderies eliminating cover failures with the Quad-Creaser.
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

            {/* WHAT IS THE QUAD-CREASER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What is the Quad-Creaser?</h2>
              <p className="text-lg text-gray-700 mb-4">
                The Quad Creaser replaces your OEM scoring mechanism to produce Letterpress quality creasing to the 
                spine & hinge area of your book covers. This patented application uses specially formulated rubber & 
                nylon creasing ribs that gently stretch the fibres in the book covers to produce flawless results.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Your existing supplied OEM steel scoring modules are abrasive and create shallow indentations in the 
                two spine & (two) hinge areas often resulting in the flaking problem. The problem is compounded by the 
                opening and closing of the front cover, adding more stress to the hinge.
              </p>
            </section>

            {/* THE PROBLEM IT SOLVES */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Why the Quad Creaser?</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">OEM Scoring Problems</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Steel scoring modules are abrasive</li>
                    <li>• Create shallow indentations only</li>
                    <li>• Flaking at spine and hinge areas</li>
                    <li>• Worse with UV/laminated stocks</li>
                    <li>• Requires offline cover creasing</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Cover Opening Issues</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Stress from cover opening/closing</li>
                    <li>• Print and coating flakes away</li>
                    <li>• Poor glue contact at hinge</li>
                    <li>• Cover flexibility problems</li>
                    <li>• Grain direction complications</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <p className="text-gray-700">
                  <strong>Industry Reality:</strong> The three times deeper crease applications help to prevent the print, 
                  coating and laminate from flaking away, regardless of grain direction. The Quad Creaser enables 
                  professional letterpress quality results on all cover types.
                </p>
              </div>
            </section>

            {/* VISUAL PROOF: BEFORE & AFTER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Visual Comparison: OEM vs Quad Creaser</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">OEM Steel Scoring</h3>
                  <img 
                    src="/images/results/cover-crease-before.JPG" 
                    alt="Flaking problem with OEM scoring"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Print & coating flaking</li>
                    <li>• Shallow indentations only</li>
                    <li>• Hinge area weakness</li>
                    <li>• Cover opening problems</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">With Quad Creaser</h3>
                  <img 
                    src="/images/results/cover-crease-after.JPG" 
                    alt="Letterpress quality with Quad Creaser"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Letterpress quality creasing</li>
                    <li>• 3x deeper creases</li>
                    <li>• Perfect hinge flexibility</li>
                    <li>• No flaking or cracking</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS - TECHNICAL */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Just a Few of the Quad Creaser Benefits</h2>
              <div className="bg-blue-50 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-4">Advanced Creasing Technology</h3>
                <p className="text-lg text-gray-700 mb-6">
                  The Quad Creaser applies three times deeper creasing than OEM scoring tools. Installation is simple 
                  and requires no machine modifications. The specially formulated rubber & nylon creasing ribs gently 
                  stretch the fibers rather than compress them.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Variable Settings</h4>
                    <p className="text-sm text-gray-700">
                      Vary the spine and/or hinge widths & depths to work on all cover stocks
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Colour-Coding System</h4>
                    <p className="text-sm text-gray-700">
                      Setting is fast and simple thanks to the colour-coding system
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Split Ribs Design</h4>
                    <p className="text-sm text-gray-700">
                      Split creasing ribs easily insert into the locking collars
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Key Technical Advantages</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Excellent on UV coated, laminated and digitally printed stocks</li>
                  <li>• Allows easy cover opening flexibility</li>
                  <li>• Improves glue contact of hinge area to text pages</li>
                  <li>• No more outsourcing your covers to be creased offline</li>
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
                      <td className="px-6 py-4 font-semibold bg-gray-50">Crease Depth</td>
                      <td className="px-6 py-4">3 times deeper than OEM scoring</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Crease Lines</td>
                      <td className="px-6 py-4">1 to 4 simultaneous creases</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Material</td>
                      <td className="px-6 py-4">Rubber & nylon creasing ribs</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Installation</td>
                      <td className="px-6 py-4">Simple - no machine modifications</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Side Capability</td>
                      <td className="px-6 py-4">Can crease both sides of cover</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Setup System</td>
                      <td className="px-6 py-4">Color-coded for fast changes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* COMPATIBLE MACHINES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Universal Perfect Binder Compatibility</h2>
              <p className="text-lg text-gray-700 mb-6">
                The Quad-Creaser is engineered to integrate with ALL major perfect binding systems
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
                Compatible with Muller Martini, Horizon, Duplo, and all other major brands
              </p>
            </section>

            {/* PROBLEM-SOLVING METRICS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Quantified Improvements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">3x</p>
                  <p className="text-sm text-gray-700">Deeper Creasing</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">1-4</p>
                  <p className="text-sm text-gray-700">Crease Lines</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">100%</p>
                  <p className="text-sm text-gray-700">Flaking Eliminated</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">Zero</p>
                  <p className="text-sm text-gray-700">Outsourcing Needed</p>
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
                      <th className="px-6 py-4 text-right">Monthly Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">Manual Pre-Creasing Labor</td>
                      <td className="px-6 py-4 text-right">£3,600</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£3,600</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Binding Line Stoppages</td>
                      <td className="px-6 py-4 text-right">£2,100</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£2,100</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Cover Waste & Reprints</td>
                      <td className="px-6 py-4 text-right">£1,800</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£1,800</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold">Total Monthly Impact</td>
                      <td className="px-6 py-4 text-right">£7,500</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">£7,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center mt-6 text-lg font-semibold text-gray-700">
                Based on typical perfect binding operation. Your savings may be higher.
              </p>
            </section>

            {/* INSTALLATION OVERVIEW */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Simple Installation Process</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Remove OEM Scoring</h3>
                    <p className="text-gray-700">Quick removal of existing steel scoring modules</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Install Quad Creaser</h3>
                    <p className="text-gray-700">Direct replacement with no machine modifications</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Select Settings</h3>
                    <p className="text-gray-700">Use colour-coding to set spine and hinge widths</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Start Production</h3>
                    <p className="text-gray-700">Immediate letterpress quality creasing results</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-gray-700">
                <strong>Installation time:</strong> Typically under 30 minutes
              </p>
            </section>

            {/* CUSTOMER SUCCESS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Real-World Results</h2>
              <blockquote className="bg-gray-50 rounded-lg p-6 italic text-lg text-gray-700 mb-6">
                "The Quad Creaser eliminated our flaking problems completely. The 3x deeper creasing and 
                colour-coding system made setup so simple. We no longer outsource any cover creasing - 
                everything is done inline now. The letterpress quality is remarkable."
              </blockquote>
              <p className="text-gray-600 mb-4">- Production Manager, Leading UK Book Manufacturer</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Before:</p>
                  <p className="text-gray-700">Flaking, outsourcing required</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">After:</p>
                  <p className="text-gray-700">Letterpress quality inline</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Result:</p>
                  <p className="text-gray-700">100% in-house production</p>
                </div>
              </div>
            </section>

            {/* 3-MONTH GUARANTEE */}
            <section className="mb-12 bg-green-50 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">3-Month Money-Back Guarantee</h2>
              <p className="text-lg text-gray-700 mb-4">
                We're so confident the Quad-Creaser will revolutionize your perfect binding that we offer a full 
                90-day money-back guarantee. If you're not completely satisfied, we'll remove it and 
                refund your investment.
              </p>
              <p className="text-gray-600">No risk. No hassle. Just results.</p>
            </section>

            {/* WHAT'S INCLUDED */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What's Included</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>✓ Quad Creaser device with rubber & nylon ribs</li>
                  <li>✓ Split creasing ribs for easy insertion</li>
                  <li>✓ Color-coded setting system</li>
                  <li>✓ Simple installation guide</li>
                  <li>✓ Phone support during setup</li>
                  <li>✓ Works on all cover stocks</li>
                </ul>
              </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section id="quote-form" className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-12 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Ready to Transform Your Production?
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Join thousands of successful print shops using Quad-Creaser technology
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
                <ToolQuoteForm toolName="Quad-Creaser" />
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