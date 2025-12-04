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
    row => row && row.tool && row.tool.toLowerCase() === 'pharma-score'
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

export default function PharmaScorePage({ compatibilityList }: Props) {
  return (
    <>
      <SEOHead
        title="Pharma-Score - Zero-Damage Pharmaceutical Scoring | Tech-ni-Fold"
        description="Eliminate micro-tears on delicate pharmaceutical inserts. Ensure 100% regulatory compliance with zero-damage scoring technology."
        keywords="Pharma-Score, pharmaceutical scoring, micro-tears, regulatory compliance, insert damage"
      />
      <Layout>
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4">
          <div className="flex-1">
            {/* HERO SECTION */}
            <section className="mb-12">
              <h1 className="text-4xl font-bold mb-6">Pharma-Score Technical Guide</h1>
              <p className="text-xl text-gray-700 mb-8">
                Superior multi-choice scoring device for pharmaceutical leaflets and instructional documents
              </p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <img 
                    src="/images/products/pharma-score-action.JPG" 
                    alt="Pharma-Score protecting delicate inserts"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Pharma-Score with 3x deeper scoring capability for pharmaceutical leaflets
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4">Key Benefits</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>3 times deeper score than OEM</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>6 score settings to choose from</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>100% consistent folding</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Reduces crow's feet wrinkles</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Male/female colour-coding</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Hard plastic compound ribs</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>3-month money back guarantee</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* VIDEO AND CTA SECTION */}
            <section className="mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">See Pharma-Score's 3x Deeper Scoring</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/N3yjKfTsVMo"
                      title="Pharma-Score demonstration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg shadow-lg"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-4">Ready for Perfect Pharmaceutical Folding?</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    Achieve 100% consistent folding with 3x deeper scoring technology designed for multi-fold leaflets.
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      Get Your Custom Quote
                    </button>
                    <p className="text-sm text-gray-600 text-center">
                      Response within 2 hours • 3-Month Money-Back Guarantee
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* WHAT IS PHARMA-SCORE */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What is Pharma-Score?</h2>
              <p className="text-lg text-gray-700 mb-4">
                The Pharma-Score is a 3 times deeper scoring option you can purchase to replace the steel scoring 
                devices that are supplied as standard with your folding machine(s). This device boasts 6 score 
                settings of varying widths & depths, all of which are quick & easy to implement for any job being 
                processed thanks to its inbuilt Male/Female colour-coding system.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                Because pharmaceutical information leaflets & instructional guides are folded so many times in 
                order to fit into small boxes, the OEM scoring application has to be highly effective to aid the 
                process, unfortunately it falls below acceptable standards. OEM scoring tools are made of steel 
                and are therefore abrasive and usually tear the product before the required depth is achieved.
              </p>
            </section>

            {/* THE PROBLEM IT SOLVES */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Why the Pharma Score?</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">OEM Scoring Problems</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Steel scoring tools are abrasive</li>
                    <li>• Tears product before proper depth</li>
                    <li>• Inadequate for multi-fold leaflets</li>
                    <li>• Falls below acceptable standards</li>
                    <li>• Causes fold wrinkles (crow's feet)</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Production Impact</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Inconsistent folding results</li>
                    <li>• Operator guesswork required</li>
                    <li>• Time lost to setup and adjustments</li>
                    <li>• Reduced productivity</li>
                    <li>• Customer complaints</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <p className="text-gray-700">
                  <strong>Industry Reality:</strong> In the world of pharmaceutical instructional media production, 
                  due to the number of folded pages that need scoring, the score width & depth is critically 
                  important. The unique Pharma Score helps deliver optimum fold quality results.
                </p>
              </div>
            </section>

            {/* VISUAL PROOF: BEFORE & AFTER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Visual Comparison: OEM vs Pharma-Score</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Standard OEM Scoring</h3>
                  <img 
                    src="/images/results/pharma-score-before.jpg" 
                    alt="Standard steel scoring results"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Shallow score depth</li>
                    <li>• Tearing on multi-fold leaflets</li>
                    <li>• Crow's feet wrinkles</li>
                    <li>• Inconsistent folding</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">With Pharma-Score</h3>
                  <img 
                    src="/images/results/pharma-score-after.JPG" 
                    alt="Pharma-Score 3x deeper scoring"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• 3x deeper score depth</li>
                    <li>• Perfect multi-fold capability</li>
                    <li>• No crow's feet</li>
                    <li>• 100% consistent results</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* HOW IT WORKS - TECHNICAL */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Some Pharma Score Features & Benefits</h2>
              <div className="bg-blue-50 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-4">Advanced Multi-Choice Scoring System</h3>
                <p className="text-lg text-gray-700 mb-6">
                  The scoring ribs are made from a hard plastic compound to increase score depth. The Pharma Score 
                  applies 3 times deeper score than OEM scoring tools, ensuring that folding is 100% consistent 
                  with the score line.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">6 Female Channels</h4>
                    <p className="text-sm text-gray-700">
                      Help create the score widths required for the full range of folded media
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">3 Split Color-Coded Ribs</h4>
                    <p className="text-sm text-gray-700">
                      Various sizes dictate the depth of score according to the processed stock
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Male/Female System</h4>
                    <p className="text-sm text-gray-700">
                      Color-coding means even inexperienced operators become instant experts
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Key Technical Advantages</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• The split in the scoring ribs ensures score insertion into the male hub is fast & simple</li>
                  <li>• Takes away any operator guess work</li>
                  <li>• Saves time and improves productivity</li>
                  <li>• Folding is always 100% consistent with the score</li>
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
                      <td className="px-6 py-4 font-semibold bg-gray-50">Score Depth</td>
                      <td className="px-6 py-4">3 times deeper than OEM scoring tools</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Score Settings</td>
                      <td className="px-6 py-4">6 in-built settings (varying widths & depths)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Material</td>
                      <td className="px-6 py-4">Hard plastic compound scoring ribs</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Setup System</td>
                      <td className="px-6 py-4">Male/Female colour-coding for easy selection</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Installation</td>
                      <td className="px-6 py-4">Split ribs for fast & simple insertion</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Guarantee</td>
                      <td className="px-6 py-4">3-month 100% money back guarantee</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* COMPATIBLE MACHINES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Universal Equipment Compatibility</h2>
              <p className="text-lg text-gray-700 mb-6">
                Pharma-Score is engineered for ALL pharmaceutical folding and converting equipment
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
                Compatible with all major folding machine brands
              </p>
            </section>

            {/* PROBLEM-SOLVING METRICS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Quantified Improvements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">3x</p>
                  <p className="text-sm text-gray-700">Deeper Score</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">6</p>
                  <p className="text-sm text-gray-700">Score Settings</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">100%</p>
                  <p className="text-sm text-gray-700">Fold Consistency</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">3-mo</p>
                  <p className="text-sm text-gray-700">Money Back</p>
                </div>
              </div>
            </section>

            {/* ROI SECTION */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Production & Cost Analysis</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Factor</th>
                      <th className="px-6 py-4 text-right">Before</th>
                      <th className="px-6 py-4 text-right">After</th>
                      <th className="px-6 py-4 text-right">Weekly Savings</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">Setup & Adjustment Time</td>
                      <td className="px-6 py-4 text-right">£450</td>
                      <td className="px-6 py-4 text-right">£90</td>
                      <td className="px-6 py-4 text-right font-semibold">£360</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Tearing/Rework Costs</td>
                      <td className="px-6 py-4 text-right">£680</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£680</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Productivity Loss</td>
                      <td className="px-6 py-4 text-right">£320</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£320</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold">Total Weekly Impact</td>
                      <td className="px-6 py-4 text-right">£1,450</td>
                      <td className="px-6 py-4 text-right">£90</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">£1,360</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center mt-6 text-lg font-semibold text-gray-700">
                Based on typical pharmaceutical leaflet production. Savings increase with volume.
              </p>
            </section>

            {/* PHARMA SCORE COMPONENTS IMAGE */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Pharma Score Components</h2>
              <div className="bg-gray-50 rounded-lg p-8">
                <img 
                  src="/images/products/pharma-score-components.JPG" 
                  alt="Pharma Score components showing 6 female channels and 3 colour-coded scoring ribs"
                  className="w-full rounded-lg shadow-lg"
                />
              </div>
            </section>

            {/* INSTALLATION OVERVIEW */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Quick Installation Process</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Remove OEM Scoring Device</h3>
                    <p className="text-gray-700">Quick removal of existing steel scoring tool</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Select Score Setting</h3>
                    <p className="text-gray-700">Choose from 6 settings using colour-coded system</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Install Pharma Score</h3>
                    <p className="text-gray-700">Split ribs make insertion fast and simple</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Test & Produce</h3>
                    <p className="text-gray-700">Immediate production with 3x deeper scoring</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-gray-700">
                <strong>Installation time:</strong> Under 10 minutes for experienced operators
              </p>
            </section>

            {/* CUSTOMER SUCCESS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Real-World Results</h2>
              <blockquote className="bg-gray-50 rounded-lg p-6 italic text-lg text-gray-700 mb-6">
                "The Pharma Score transformed our leaflet production. With multiple folds required for pharmaceutical 
                inserts, the 3x deeper scoring eliminated all our folding issues. The 6 different settings mean we can 
                handle any substrate thickness, and the colour-coding system made training new operators incredibly simple."
              </blockquote>
              <p className="text-gray-600 mb-4">- Production Manager, Leading Pharmaceutical Printer</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Before:</p>
                  <p className="text-gray-700">Tearing, crow's feet, slow setup</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">After:</p>
                  <p className="text-gray-700">Perfect folds, instant setup</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Result:</p>
                  <p className="text-gray-700">50% productivity increase</p>
                </div>
              </div>
            </section>

            {/* 3-MONTH GUARANTEE */}
            <section className="mb-12 bg-green-50 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">3-Month 100% Money Back Guarantee</h2>
              <p className="text-lg text-gray-700 mb-4">
                We're so confident the Pharma Score will revolutionize your pharmaceutical leaflet production 
                that we offer a full 3-month money-back guarantee. If you're not completely satisfied with the 
                3x deeper scoring performance and elimination of folding problems, we'll refund your investment.
              </p>
              <p className="text-gray-600">No risk. No hassle. Just superior scoring results.</p>
            </section>

            {/* WHAT'S INCLUDED */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What's Included</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>✓ Pharma Score device with 6 score settings</li>
                  <li>✓ 3 split colour-coded scoring ribs</li>
                  <li>✓ 6 female channel options</li>
                  <li>✓ Quick-start installation guide</li>
                  <li>✓ Phone support during setup</li>
                  <li>✓ 3-month 100% money back guarantee</li>
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
                <ToolQuoteForm toolName="Pharma-Score" />
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