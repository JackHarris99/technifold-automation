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
    row => row && row.tool && row.tool.toLowerCase() === 'section-score'
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

export default function SectionScorePage({ compatibilityList }: Props) {
  return (
    <>
      <SEOHead
        title="Section Score - Revolutionary Signature Scoring Technology | Tech-ni-Fold"
        description="3x deeper scoring power than OEM tools. Eliminate front edge tearing with non-abrasive plastic technology. 8 pre-determined channels for 4-32 page signatures."
        keywords="Section Score, signature scoring, deep channel scoring, non-abrasive scoring, signature work, folding accuracy"
      />
      <Layout>
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4">
          <div className="flex-1">
            {/* HERO SECTION */}
            <section className="mb-12">
              <h1 className="text-4xl font-bold mb-6">Section Score Technical Guide</h1>
              <p className="text-xl text-gray-700 mb-8">
                Revolutionary breakthrough in signature scoring - 3x deeper scoring power with non-abrasive technology
              </p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <img 
                    src="/images/products/section-score-action.JPG" 
                    alt="Section Score creating deep channels"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Section Score delivering 3x deeper scoring than 170-year-old OEM technology
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4">Key Benefits</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>3x deeper scoring power than OEM tools</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Non-abrasive plastic scoring rings</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>8 pre-determined channels (4-32 pages)</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Eliminates front edge tearing completely</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Zero operator guesswork - colour-coded</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Split rib technology for instant setup</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>100% consistent folding guaranteed</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* VIDEO AND CTA SECTION */}
            <section className="mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">See Section Score Eliminate Signature Tears</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/UELhR1MOzwY"
                      title="Section Score demonstration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg shadow-lg"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-4">Ready for 3x Deeper Scoring Power?</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    Transform your signature quality with non-abrasive scoring technology that eliminates tears forever.
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      Get Your Custom Quote
                    </button>
                    <p className="text-sm text-gray-600 text-center">
                      Response within 2 hours • 30-Day Money-Back Guarantee
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* WHAT IS SECTION SCORE */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What is Section Score?</h2>
              <p className="text-lg text-gray-700 mb-4">
                The Section Score represents our revolutionary breakthrough in signature and section work scoring technology. 
                While folding machine innovation has evolved dramatically over 20 years with computerized auto-setup, 
                OEM scoring tools remain trapped in 1850s technology with the same destructive elements that destroy modern signature work.
              </p>
              <p className="text-lg text-gray-700 mb-4">
                The Section Score delivers scoring depths 3 times deeper than OEM versions, creating the only rotary device 
                that produces scores deep enough for products to fold perfectly by hand - guaranteeing your folding machine's 
                buckle plate or knife unit registers 100% on the score for perfect fold consistency.
              </p>
            </section>

            {/* THE PROBLEM IT SOLVES */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">The Signature Scoring Crisis</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">OEM Tools Are Destroying Your Signature Work</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Front edge tearing from abrasive steel blades</li>
                    <li>• Weak V-shaped scores cause inconsistent folding</li>
                    <li>• Complex setup turns operators into guesswork technicians</li>
                    <li>• 170-year-old technology can't handle modern stocks</li>
                    <li>• Limited to lightweight papers</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Production Impact</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• 15-20% waste from tears and reprints</li>
                    <li>• Speed reductions to minimize damage</li>
                    <li>• Lost revenue from rejected jobs</li>
                    <li>• Operator frustration with quality</li>
                    <li>• Damage to company reputation</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <p className="text-gray-700">
                  <strong>Industry Reality:</strong> Your factory scoring tools create three critical problems that 
                  devastate signature quality - front edge tearing from abrasive steel blades, weak V-shaped scores 
                  that cause inconsistent folding, and complex setup procedures that turn operators into guesswork 
                  technicians instead of precision professionals.
                </p>
              </div>
            </section>

            {/* VISUAL PROOF: BEFORE & AFTER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Visual Proof: Before & After</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Without Section Score</h3>
                  <img 
                    src="/images/results/section-score-before.JPG" 
                    alt="Signature tears with standard scoring"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Shallow 0.2mm impressions</li>
                    <li>• Signature tears and splits</li>
                    <li>• Speed reductions required</li>
                    <li>• High waste rates</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">With Section Score</h3>
                  <img 
                    src="/images/results/section-score-after.JPG" 
                    alt="Perfect deep scoring channels"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Deep 0.6mm+ channels</li>
                    <li>• Zero tears or splits</li>
                    <li>• Full speed production</li>
                    <li>• Minimal waste</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* ADVANCED DESIGN FEATURES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Revolutionary Engineering Breakthrough</h2>
              <div className="bg-blue-50 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-4">Non-Abrasive Plastic Technology</h3>
                <p className="text-lg text-gray-700 mb-6">
                  Four colour-coded plastic scoring rings of varying heights and widths replace destructive steel blades, 
                  eliminating tearing while delivering optimum score depths for all material thicknesses.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">8-Channel Precision System</h4>
                    <p className="text-sm text-gray-700">
                      Pre-engineered female component with 8 channel widths handles everything from light paper 
                      (4 pages) through heavy signature work (32 pages)
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Split Rib Innovation</h4>
                    <p className="text-sm text-gray-700">
                      Four split scoring ribs insert instantly into the male hub with fast opening/closing 
                      mechanism - no complex adjustments
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">3x Deeper Scoring Power</h4>
                    <p className="text-sm text-gray-700">
                      Creates scores deep enough for products to fold perfectly by hand - guaranteeing 
                      100% score alignment
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Operational Excellence</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>Eliminates Skilled Setup Requirements:</strong> Colour-coded male/female components ensure correct engagement within seconds</li>
                  <li>• <strong>All 8 score options are pre-determined</strong> and built-in by Tech-ni-Fold</li>
                  <li>• <strong>Instant Material Changes:</strong> Switch between different signature thicknesses in seconds</li>
                  <li>• <strong>Zero operator guesswork</strong> - no complex adjustments or long setup procedures</li>
                </ul>
              </div>
            </section>

            {/* SIGNATURE WORK TRANSFORMATION */}
            <section className="mb-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Signature Work Transformation</h2>
              <h3 className="text-xl font-semibold mb-4">Perfect for High-Volume Signature Production:</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Magazine and book signatures with consistent spine quality</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Multi-page folded sections requiring precision alignment</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Heavy stock signature work that defeats OEM tools</span>
                  </li>
                </ul>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Digital print signatures prone to cracking and tearing</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-6 h-6 text-blue-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Any signature work requiring professional finish quality</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* BUSINESS IMPACT */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Business Impact</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">Quality Transformation</h3>
                  <p className="text-gray-700">Transforms signature quality to completely new professional level</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">Zero Rejects</h3>
                  <p className="text-gray-700">Eliminates rejected signature work and costly reprints</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">Simplified Operations</h3>
                  <p className="text-gray-700">Reduces operator skill requirements to near zero</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">Increased Speed</h3>
                  <p className="text-gray-700">Increases signature production speed with reliable consistency</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">Complete Range</h3>
                  <p className="text-gray-700">Handles full range of signature applications flawlessly</p>
                </div>
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h3 className="text-lg font-semibold mb-3">Competitive Edge</h3>
                  <p className="text-gray-700">While competitors struggle with 170-year-old technology, you excel</p>
                </div>
              </div>
            </section>

            {/* TECHNICAL SPECIFICATIONS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Technical Specifications</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="w-full">
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Scoring Technology</td>
                      <td className="px-6 py-4">Non-abrasive plastic scoring rings</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Channel Options</td>
                      <td className="px-6 py-4">8 pre-determined channels (4-32 pages)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Scoring Depth</td>
                      <td className="px-6 py-4">3x deeper than OEM tools</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Setup System</td>
                      <td className="px-6 py-4">Colour-coded split rib technology</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Front Edge Tearing</td>
                      <td className="px-6 py-4">100% eliminated</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4 font-semibold bg-gray-50">Setup Time</td>
                      <td className="px-6 py-4">Instant - seconds not minutes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* COMPATIBLE MACHINES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Universal Folder Compatibility</h2>
              <p className="text-lg text-gray-700 mb-6">
                Section Score wheels are engineered as drop-in replacements for ALL major folder brands
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
                Compatible with Heidelberg, MBO, Horizon, and all other major brands
              </p>
            </section>

            {/* PROBLEM-SOLVING METRICS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Quantified Improvements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">100%</p>
                  <p className="text-sm text-gray-700">Signature Tears Eliminated</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">3x</p>
                  <p className="text-sm text-gray-700">Deeper Scoring Depth</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">50%</p>
                  <p className="text-sm text-gray-700">Speed Increase</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">2-4 wks</p>
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
                      <td className="px-6 py-4">Signature Tear Rework</td>
                      <td className="px-6 py-4 text-right">£720</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£720</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Speed Reduction Loss</td>
                      <td className="px-6 py-4 text-right">£480</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£480</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Material Waste</td>
                      <td className="px-6 py-4 text-right">£350</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-semibold">£350</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold">Total Weekly Impact</td>
                      <td className="px-6 py-4 text-right">£1,550</td>
                      <td className="px-6 py-4 text-right">£0</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">£1,550</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center mt-6 text-lg font-semibold text-gray-700">
                Based on typical single-shift operation. Your savings may be higher.
              </p>
            </section>

            {/* INSTALLATION OVERVIEW */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Simple Installation Process</h2>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</div>
                  <div>
                    <h3 className="font-semibold mb-1">Remove Standard Wheels</h3>
                    <p className="text-gray-700">Quick removal of existing OEM scoring wheels</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</div>
                  <div>
                    <h3 className="font-semibold mb-1">Install Section Score</h3>
                    <p className="text-gray-700">Drop-in replacement with existing shafts and bearings</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</div>
                  <div>
                    <h3 className="font-semibold mb-1">Set Pressure</h3>
                    <p className="text-gray-700">Simple pressure adjustment for optimal channel depth</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</div>
                  <div>
                    <h3 className="font-semibold mb-1">Test & Run</h3>
                    <p className="text-gray-700">Immediate production with zero signature tears</p>
                  </div>
                </div>
              </div>
              <p className="mt-6 text-gray-700">
                <strong>Installation support:</strong> Phone guidance included, typically 30 minutes total
              </p>
            </section>

            {/* CUSTOMER SUCCESS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Real-World Results</h2>
              <blockquote className="bg-gray-50 rounded-lg p-6 italic text-lg text-gray-700 mb-6">
                "Section Score wheels saved our heavy stock jobs. We went from 25% waste on 200gsm signatures 
                to virtually zero. Speed increased by 50% and we haven't had a signature tear since installation."
              </blockquote>
              <p className="text-gray-600 mb-4">- Folding Department Manager, Manchester Print Works</p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Before:</p>
                  <p className="text-gray-700">25% waste, constant tears</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">After:</p>
                  <p className="text-gray-700">Zero waste, perfect folds</p>
                </div>
                <div className="bg-white rounded-lg shadow p-4">
                  <p className="font-semibold">Result:</p>
                  <p className="text-gray-700">£1,550 weekly savings</p>
                </div>
              </div>
            </section>

            {/* 30-DAY GUARANTEE */}
            <section className="mb-12 bg-green-50 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">30-Day Money-Back Guarantee</h2>
              <p className="text-lg text-gray-700 mb-4">
                We're so confident Section Score will transform your heavy stock folding that we offer a full 
                30-day money-back guarantee. If you don't see immediate improvements, we'll refund your investment.
              </p>
              <p className="text-gray-600">No risk. No hassle. Just results.</p>
            </section>

            {/* WHAT'S INCLUDED */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">What's Included</h2>
              <div className="bg-gray-50 rounded-lg p-6">
                <ul className="space-y-3 text-gray-700">
                  <li>✓ Complete Section Score wheel set for your folder</li>
                  <li>✓ Installation guide with photos</li>
                  <li>✓ Phone support during installation</li>
                  <li>✓ 2-year parts and labor warranty</li>
                  <li>✓ Lifetime technical support</li>
                  <li>✓ 30-day money-back guarantee</li>
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
                <ToolQuoteForm toolName="Section-Score" />
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