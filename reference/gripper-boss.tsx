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
    row => row && row.tool && row.tool === 'Gripper Boss'
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

export default function GripperBossPage({ compatibilityList }: Props) {
  return (
    <>
      <SEOHead
        title="Gripper Boss - Permanent Roller Grip Solution | Tech-ni-Fold"
        description="Eliminate £4,800-6,000 annual regripping costs forever. One-time installation provides permanent grip without degradation."
        keywords="Gripper Boss, roller maintenance, permanent grip, regripping costs, roller slip"
      />
      <Layout>
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4">
          <div className="flex-1">
            {/* HERO SECTION */}
            <section className="mb-12">
              <h1 className="text-4xl font-bold mb-6">Gripper Boss Technical Guide</h1>
              <p className="text-xl text-gray-700 mb-8">
                Permanent polymer grip technology - eliminate roller maintenance costs forever
              </p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <img 
                    src="/images/products/gripper-boss-action.jpg" 
                    alt="Gripper Boss permanent roller solution"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Gripper Boss providing permanent grip without degradation
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4">Key Benefits</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Eliminate £4,800-6,000 annual costs</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Zero maintenance required</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Permanent grip never degrades</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>No more downtime for regripping</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Maintain full production speed</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Works on any machine with rollers</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>ROI in first year guaranteed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* CTA SECTION */}
            <section className="mb-12">
              <div className="bg-blue-50 rounded-lg p-8 text-center">
                <h3 className="text-2xl font-bold mb-4">Ready to Eliminate Roller Maintenance Forever?</h3>
                <p className="text-lg text-gray-700 mb-6">
                  Join print shops saving thousands annually with permanent Gripper Boss technology.
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                    className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                  >
                    Get Your Custom Quote
                  </button>
                  <p className="text-sm text-gray-600">
                    Response within 2 hours • 100% Money-Back Guarantee
                  </p>
                </div>
              </div>
            </section>

            {/* WHAT IS GRIPPER BOSS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What is Gripper Boss?</h2>
              <p className="text-lg text-gray-700 mb-4">
                Gripper Boss is a revolutionary permanent roller grip solution that replaces traditional rubber 
                surfaces with an engineered polymer coating. Unlike rubber that degrades and requires expensive 
                regripping every 12-18 months, Gripper Boss provides permanent grip that never wears out.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Developed to eliminate the endless cycle of roller maintenance costs, Gripper Boss has become 
                the smart choice for print shops looking to reduce operating expenses while maintaining optimal 
                feed performance.
              </p>
            </section>

            {/* THE PROBLEM IT SOLVES */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">The Roller Maintenance Money Pit</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Traditional Rubber Problems</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• £4,800-6,000 annual regripping costs</li>
                    <li>• 16-24 hours yearly downtime</li>
                    <li>• 25% grip loss after 6 months</li>
                    <li>• Speed reductions to compensate</li>
                    <li>• Continuous degradation cycle</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Hidden Costs</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Lost production during service</li>
                    <li>• Misfeeds from worn rollers</li>
                    <li>• Variable feed quality</li>
                    <li>• Planning around maintenance</li>
                    <li>• Never-ending expense</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <p className="text-gray-700">
                  <strong>Industry Reality:</strong> Rubber roller surfaces are a consumable that deteriorate 
                  from day one. Print shops accept £4,800-6,000 in annual regripping costs as "normal" when a 
                  permanent solution exists.
                </p>
              </div>
            </section>

            {/* VISUAL PROOF: BEFORE & AFTER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Visual Proof: Before & After</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Without Gripper Boss</h3>
                  <img 
                    src="/images/results/gripper-boss-before.jpg" 
                    alt="Worn rubber rollers needing regripping"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Degraded rubber surface</li>
                    <li>• Poor grip causing slips</li>
                    <li>• Annual regripping needed</li>
                    <li>• Ongoing costs forever</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">With Gripper Boss</h3>
                  <img 
                    src="/images/results/gripper-boss-after.jpg" 
                    alt="Permanent Gripper Boss surface"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Permanent polymer grip</li>
                    <li>• Consistent performance</li>
                    <li>• Zero maintenance needed</li>
                    <li>• One-time investment</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS - TECHNICAL */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Permanent Grip Technology Explained</h2>
              <div className="bg-blue-50 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-4">The Engineering Behind Gripper Boss</h3>
                <p className="text-lg text-gray-700 mb-6">
                  Gripper Boss uses an advanced polymer surface that's molecularly engineered for permanent grip. 
                  Unlike rubber that relies on softness and degrades with use, our polymer maintains its grip 
                  characteristics indefinitely through a unique surface texture that never wears smooth.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Polymer Surface</h4>
                    <p className="text-sm text-gray-700">
                      Engineered texture provides consistent grip without degradation
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Permanent Bond</h4>
                    <p className="text-sm text-gray-700">
                      Molecular adhesion to roller core prevents any delamination
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Zero Maintenance</h4>
                    <p className="text-sm text-gray-700">
                      No regripping, resurfacing, or replacement ever needed
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Key Technical Advantages</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Permanent polymer grip surface</li>
                  <li>• No degradation over time</li>
                  <li>• Consistent performance for machine life</li>
                  <li>• Chemical and solvent resistant</li>
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
                      <td className="px-6 py-4 font-semibold bg-gray-50">Surface Material</td>
                      <td className="px-6 py-4">Engineered permanent polymer</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Maintenance Required</td>
                      <td className="px-6 py-4">Zero - permanent solution</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Grip Life</td>
                      <td className="px-6 py-4">Permanent - machine lifetime</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Annual Savings</td>
                      <td className="px-6 py-4">£4,800-6,000 per machine</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Installation</td>
                      <td className="px-6 py-4">Professional application</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Warranty</td>
                      <td className="px-6 py-4">Lifetime grip guarantee</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* COMPATIBLE MACHINES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Universal Roller Compatibility</h2>
              <p className="text-lg text-gray-700 mb-6">
                Gripper Boss can be applied to rollers on ALL types of printing and finishing equipment
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
                Works on folders, feeders, conveyors, and all roller-based systems
              </p>
            </section>

            {/* PROBLEM-SOLVING METRICS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Quantified Improvements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">£0</p>
                  <p className="text-sm text-gray-700">Annual Maintenance</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">Lifetime</p>
                  <p className="text-sm text-gray-700">Grip Duration</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">100%</p>
                  <p className="text-sm text-gray-700">Consistent Grip</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">1 year</p>
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
                      <th className="px-6 py-4 text-right">Annual Before</th>
                      <th className="px-6 py-4 text-right">Annual After</th>
                      <th className="px-6 py-4 text-right">Annual Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">Regripping Service</td>
                      <td className="px-6 py-4 text-right">£4,800</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£4,800</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Production Downtime</td>
                      <td className="px-6 py-4 text-right">£1,600</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£1,600</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Misfeed Waste</td>
                      <td className="px-6 py-4 text-right">£400</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£400</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold">Total Annual Impact</td>
                      <td className="px-6 py-4 text-right">£6,800</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">£6,800</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center mt-6 text-lg font-semibold text-gray-700">
                Per machine savings. Most shops save £15,000-30,000 annually across all equipment.
              </p>
            </section>

            {/* INSTALLATION OVERVIEW */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Professional Installation Process</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Roller Assessment</h3>
                    <p className="text-gray-700">Our technician evaluates your rollers and determines application requirements</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Surface Preparation</h3>
                    <p className="text-gray-700">Existing rubber removed and core prepared for polymer application</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Polymer Application</h3>
                    <p className="text-gray-700">Permanent grip surface professionally applied and cured</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Lifetime Performance</h3>
                    <p className="text-gray-700">Never pay for roller maintenance again</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-gray-700">
                <strong>Installation options:</strong> On-site or at our facility
              </p>
            </section>

            {/* CUSTOMER SUCCESS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Real-World Results</h2>
              <blockquote className="bg-gray-50 rounded-lg p-6 italic text-lg text-gray-700 mb-6">
                "We applied Gripper Boss to our folder feeders 3 years ago and haven't touched them since. 
                We used to spend £5,000 annually on regripping - that's £15,000 saved so far with perfect 
                feed performance every day."
              </blockquote>
              <p className="text-gray-600 mb-4">- Operations Director, Newcastle Print Works</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Before:</p>
                  <p className="text-gray-700">£5,000/year maintenance</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">After:</p>
                  <p className="text-gray-700">£0/year maintenance</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">3-Year Savings:</p>
                  <p className="text-gray-700">£15,000 and counting</p>
                </div>
              </div>
            </section>

            {/* LIFETIME GUARANTEE */}
            <section className="mb-12 bg-green-50 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">Lifetime Grip Guarantee</h2>
              <p className="text-lg text-gray-700 mb-4">
                We're so confident in Gripper Boss technology that we guarantee the grip will last for the 
                lifetime of your equipment. If the grip ever fails, we'll reapply it free of charge.
              </p>
              <p className="text-gray-600">Permanent solution. Permanent savings. Guaranteed.</p>
            </section>

            {/* WHAT'S INCLUDED */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What's Included</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>✓ Professional roller assessment</li>
                  <li>✓ Complete Gripper Boss application</li>
                  <li>✓ All preparation and materials</li>
                  <li>✓ Lifetime grip guarantee</li>
                  <li>✓ Zero maintenance forever</li>
                  <li>✓ Annual savings documentation</li>
                </ul>
              </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section id="quote-form" className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-12 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Ready to Transform Your Production?
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Join thousands of successful print shops using Gripper Boss technology
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
                <ToolQuoteForm toolName="Gripper-Boss" />
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