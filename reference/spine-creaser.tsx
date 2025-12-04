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
    row => row && row.tool && row.tool.toLowerCase() === 'spine-creaser'
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

export default function SpineCreaserPage({ compatibilityList }: Props) {
  return (
    <>
      <SEOHead
        title="Spine Creaser - Inline Cover Creasing for Saddle Stitchers | Tech-ni-Fold"
        description="Eliminate offline cover creasing bottlenecks. Add professional spine creasing inline on any saddle stitcher without fibre cracking."
        keywords="Spine Creaser, saddle stitcher, inline creasing, cover creasing, bindery automation"
      />
      <Layout>
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4">
          <div className="flex-1">
            {/* HERO SECTION */}
            <section className="mb-12">
              <h1 className="text-4xl font-bold mb-6">Spine Creaser Technical Guide</h1>
              <p className="text-xl text-gray-700 mb-8">
                Professional inline cover creasing for saddle stitchers - eliminate offline bottlenecks forever
              </p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <img 
                    src="/images/products/spine-creaser-action.jpg" 
                    alt="Spine Creaser installed on saddle stitcher"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Spine Creaser creating perfect cover creases inline
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4">Key Benefits</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Eliminate 100% of offline cover creasing</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Save 15-20 hours of labor per week</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Handle covers up to 350gsm inline</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Zero fibre cracking on heavy stocks</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>ROI in 5-8 weeks average</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Universal saddle stitcher compatibility</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>No speed reduction - runs at full capacity</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* VIDEO AND CTA SECTION */}
            <section className="mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">See the Spine Creaser in Action</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/bdiPRqmoSj8"
                      title="Spine Creaser demonstration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg shadow-lg"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-4">Ready to Eliminate Cover Creasing Bottlenecks?</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    Save 15-20 hours of labor per week with inline cover creasing that delivers perfect results every time.
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      Get Your Custom Quote
                    </button>
                    <p className="text-sm text-gray-600 text-center">
                      Response within 2 hours • 90-Day Money-Back Guarantee
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* WHAT IS THE SPINE CREASER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What is the Spine Creaser?</h2>
              <p className="text-lg text-gray-700 mb-4">
                The Spine Creaser is a specialized inline creasing attachment designed specifically for saddle stitchers. 
                It eliminates the need for offline cover creasing by creating perfect spine creases during the stitching 
                process - saving hours of manual work and preventing fibre cracking on heavy covers.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Developed to solve the industry-wide problem of bottlenecked cover preparation, this patented device 
                has become essential for binderies looking to maximize saddle stitcher productivity while maintaining 
                premium quality standards.
              </p>
            </section>

            {/* THE PROBLEM IT SOLVES */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">The Saddle Stitching Cover Challenge</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">Traditional Offline Process</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Covers must be pre-creased offline</li>
                    <li>• 2-4 hours additional labor per job</li>
                    <li>• Risk of fibre cracking on heavy stocks</li>
                    <li>• Bottlenecks at creasing equipment</li>
                    <li>• Extra handling damages covers</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Production Impact</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Saddle stitcher sits idle waiting for covers</li>
                    <li>• Overtime costs for cover preparation</li>
                    <li>• Quality inconsistencies between operators</li>
                    <li>• Limited to lighter cover weights</li>
                    <li>• Customer complaints about cracked spines</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <p className="text-gray-700">
                  <strong>Industry Reality:</strong> Most binderies waste 15-20 hours per week on offline cover 
                  creasing, creating a massive bottleneck that limits saddle stitcher productivity and profitability.
                </p>
              </div>
            </section>

            {/* VISUAL PROOF: BEFORE & AFTER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Visual Proof: Before & After</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Without Spine Creaser</h3>
                  <img 
                    src="/images/results/cover-crease-before.JPG" 
                    alt="Manual offline creasing process"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Manual offline process required</li>
                    <li>• Extra labor costs</li>
                    <li>• Production bottlenecks</li>
                    <li>• Inconsistent quality</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">With Spine Creaser</h3>
                  <img 
                    src="/images/results/cover-crease-after.JPG" 
                    alt="Inline automated creasing"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Fully automated inline</li>
                    <li>• Zero extra labor</li>
                    <li>• Continuous production</li>
                    <li>• Perfect consistency</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS - TECHNICAL */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Inline Creasing Technology Explained</h2>
              <div className="bg-blue-50 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-4">The Engineering Behind Spine Creaser</h3>
                <p className="text-lg text-gray-700 mb-6">
                  The Spine Creaser uses precision-engineered creasing rings that mount directly onto your saddle 
                  stitcher's existing shafts. As covers feed through the machine, they receive a perfect spine crease 
                  at exactly the right position - all without slowing down production.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Step 1: Cover Feeding</h4>
                    <p className="text-sm text-gray-700">
                      Covers feed normally into the saddle stitcher without any special handling
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Step 2: Inline Creasing</h4>
                    <p className="text-sm text-gray-700">
                      Creasing occurs at the exact moment of optimal paper tension
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Step 3: Perfect Results</h4>
                    <p className="text-sm text-gray-700">
                      Covers emerge with professional spine creases ready for stitching
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Key Technical Advantages</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• Patented channel-creating technology prevents fibre damage</li>
                  <li>• Self-centering design ensures perfect alignment</li>
                  <li>• Works at full machine speed without slowdown</li>
                  <li>• Compatible with all cover weights up to 350gsm</li>
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
                      <td className="px-6 py-4 font-semibold bg-gray-50">Cover Weight Range</td>
                      <td className="px-6 py-4">80gsm to 350gsm</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Machine Speed</td>
                      <td className="px-6 py-4">Full production speed maintained</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Crease Quality</td>
                      <td className="px-6 py-4">Zero fibre cracking guaranteed</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Installation Time</td>
                      <td className="px-6 py-4">2-3 hours typical</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Maintenance</td>
                      <td className="px-6 py-4">Annual inspection only</td>
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
              <h2 className="text-3xl font-bold mb-6">Universal Saddle Stitcher Compatibility</h2>
              <p className="text-lg text-gray-700 mb-6">
                The Spine Creaser is engineered to fit ALL major saddle stitcher brands without modification
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
                Compatible with Muller Martini, Heidelberg, Horizon, and all other major brands
              </p>
            </section>

            {/* PROBLEM-SOLVING METRICS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Quantified Improvements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">100%</p>
                  <p className="text-sm text-gray-700">Offline Creasing Eliminated</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">20 hrs</p>
                  <p className="text-sm text-gray-700">Weekly Labor Saved</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">350gsm</p>
                  <p className="text-sm text-gray-700">Maximum Cover Weight</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">5-8 wks</p>
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
                      <th className="px-6 py-4 text-right">Monthly Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">Offline Creasing Labor</td>
                      <td className="px-6 py-4 text-right">£3,200</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£3,200</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Machine Idle Time</td>
                      <td className="px-6 py-4 text-right">£1,500</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£1,500</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Quality Issues/Reprints</td>
                      <td className="px-6 py-4 text-right">£800</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£800</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold">Total Monthly Impact</td>
                      <td className="px-6 py-4 text-right">£5,500</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">£5,500</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center mt-6 text-lg font-semibold text-gray-700">
                Based on typical 2-shift operation. Your savings may be higher.
              </p>
            </section>

            {/* INSTALLATION OVERVIEW */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Professional Installation Process</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Machine Assessment</h3>
                    <p className="text-gray-700">Our technician evaluates your specific saddle stitcher model and configuration</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Precision Mounting</h3>
                    <p className="text-gray-700">Spine Creaser components are installed with exact alignment for your machine</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Testing & Optimization</h3>
                    <p className="text-gray-700">Full production testing ensures perfect creasing across all cover weights</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Operator Training</h3>
                    <p className="text-gray-700">Your team learns optimal settings for different cover materials</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-gray-700">
                <strong>Installation time:</strong> 2-3 hours typical, including testing and training
              </p>
            </section>

            {/* CUSTOMER SUCCESS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Real-World Results</h2>
              <blockquote className="bg-gray-50 rounded-lg p-6 italic text-lg text-gray-700 mb-6">
                "The Spine Creaser transformed our saddle stitching operation. We eliminated two full-time positions 
                from offline creasing and increased our throughput by 40%. The ROI was under 6 weeks."
              </blockquote>
              <p className="text-gray-600 mb-4">- Production Manager, UK Commercial Bindery</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Before:</p>
                  <p className="text-gray-700">3 operators, 400 books/hour</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">After:</p>
                  <p className="text-gray-700">1 operator, 600 books/hour</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Result:</p>
                  <p className="text-gray-700">50% productivity increase</p>
                </div>
              </div>
            </section>

            {/* 3-MONTH GUARANTEE */}
            <section className="mb-12 bg-green-50 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">3-Month Money-Back Guarantee</h2>
              <p className="text-lg text-gray-700 mb-4">
                We're so confident the Spine Creaser will transform your bindery that we offer a full 
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
                  <li>✓ Complete Spine Creaser system for your machine model</li>
                  <li>✓ Professional installation by factory technician</li>
                  <li>✓ Operator training and optimization</li>
                  <li>✓ 3-year parts and labor warranty</li>
                  <li>✓ Lifetime technical support</li>
                  <li>✓ 90-day money-back guarantee</li>
                </ul>
              </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section id="quote-form" className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-12 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Ready to Transform Your Production?
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Join thousands of successful print shops using Tech-ni-Fold technology
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
                <ToolQuoteForm toolName="Spine-Creaser" />
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