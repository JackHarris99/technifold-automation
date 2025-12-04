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
    row => row && row.tool && row.tool.toLowerCase() === 'tri-creaser'
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

export default function TriCreaserPage({ compatibilityList }: Props) {
  return (
    <>
      <SEOHead
        title="Tri-Creaser - Revolutionary Rubber Creasing Technology | Tech-ni-Fold"
        description="World's most proven rotary creasing solution with 140,000+ installations. Eliminate fibre cracking forever with patented rubber technology. Fast-Fit for general work, Advance add-on for digital stocks."
        keywords="Tri-Creaser, fibre cracking, rubber creasing, folding machines, Fast-Fit, Advance, digital printing"
      />
      <Layout>
        <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4">
          <div className="flex-1">
            {/* HERO SECTION */}
            <section className="mb-12">
              <h1 className="text-4xl font-bold mb-6">Tri-Creaser Complete Technology Guide</h1>
              <p className="text-xl text-gray-700 mb-8">
                Revolutionary rubber creasing technology that forever replaces destructive metal scoring
              </p>
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <img 
                    src="/images/products/tri-creaser-action.jpg" 
                    alt="Tri-Creaser eliminating fibre cracking"
                    className="w-full rounded-lg shadow-lg"
                  />
                  <p className="text-sm text-gray-600 text-center mt-2">
                    Tri-Creaser creating perfect letterpress-style creases without fibre damage
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-2xl font-semibold mb-4">Revolutionary Benefits</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>140,000+ successful installations worldwide</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Patented rubber technology stretches fibres</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Fast-Fit handles 65-350gsm stocks perfectly</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Advance add-on conquers digital challenges</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>8 pre-determined settings - zero guesswork</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Colour-coded instant setup system</span>
                    </li>
                    <li className="flex items-start">
                      <svg className="w-6 h-6 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span>Typical ROI within 1-3 jobs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </section>

            {/* VIDEO AND CTA SECTION */}
            <section className="mb-12">
              <div className="grid md:grid-cols-2 gap-8 items-center">
                <div>
                  <h3 className="text-2xl font-bold mb-4">See the Tri-Creaser Fast-Fit in Action</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/QEZVzxka01U"
                      title="Tri-Creaser Fast-Fit demonstration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg shadow-lg"
                      style={{ minHeight: '300px' }}
                    />
                  </div>
                </div>
                <div className="bg-blue-50 rounded-lg p-8">
                  <h3 className="text-2xl font-bold mb-4">Ready to Eliminate Fibre Cracking Forever?</h3>
                  <p className="text-lg text-gray-700 mb-6">
                    Join 140,000+ print shops worldwide who've transformed their folding quality with the Tri-Creaser.
                  </p>
                  <div className="text-center">
                    <button
                      onClick={() => document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth' })}
                      className="block w-full bg-blue-600 text-white text-center px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-all"
                    >
                      Get Your Custom Quote
                    </button>
                    <p className="text-sm text-gray-600 mt-2">
                      Response within 2 hours • 100% Money-Back Guarantee
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* THE METAL SCORING CRISIS */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">The Metal Scoring Crisis on Single Sheets</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4">OEM Metal Scoring Destroys Modern Stocks</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• Abrasive V-shaped compression cracks coatings</li>
                    <li>• 0.25mm shallow impressions - inadequate for modern papers</li>
                    <li>• Designed in 1850s - unchanged for 170+ years</li>
                    <li>• Forces fibres together causing brittleness</li>
                    <li>• Guaranteed failure on digital & coated stocks</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4">Your Daily Production Reality</h3>
                  <ul className="space-y-3 text-gray-700">
                    <li>• 15-20% waste from cracked folds</li>
                    <li>• Speed reductions trying to minimize damage</li>
                    <li>• Customer complaints about white crack lines</li>
                    <li>• Reprints eating into profit margins</li>
                    <li>• Turning away profitable coated stock work</li>
                  </ul>
                </div>
              </div>
              <div className="bg-white rounded-lg p-6">
                <p className="text-gray-700">
                  <strong>The Science:</strong> Modern coated papers have a clay surface layer sitting on top of paper fibres. 
                  When metal scoring compresses this coating, it shatters like glass along the fold line. The harder you press, 
                  the worse it gets. You need a completely different approach - stretching fibres instead of crushing them.
                </p>
              </div>
            </section>

            {/* VISUAL PROOF: BEFORE & AFTER */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Visual Proof: Metal vs Rubber Technology</h2>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Metal Scoring Damage</h3>
                  <img 
                    src="/images/results/cover-crease-before.JPG" 
                    alt="Fibre cracking with metal scoring"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Visible white crack lines destroy appearance</li>
                    <li>• Coating flakes off during handling</li>
                    <li>• Unprofessional quality leads to rejection</li>
                    <li>• Problem worsens with heavier stocks</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Tri-Creaser Perfection</h3>
                  <img 
                    src="/images/results/cover-crease-after.JPG" 
                    alt="Perfect folds with Tri-Creaser"
                    className="w-full rounded-lg shadow-lg mb-4"
                  />
                  <ul className="space-y-2 text-gray-700">
                    <li>• Flawless letterpress-quality creases</li>
                    <li>• Coating remains perfectly intact</li>
                    <li>• Professional finish customers expect</li>
                    <li>• Works perfectly on all stock weights</li>
                  </ul>
                </div>
              </div>
            </section>

            {/* REVOLUTIONARY RUBBER TECHNOLOGY */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Revolutionary Rubber Creasing Technology</h2>
              <div className="bg-blue-50 rounded-lg p-8 mb-8">
                <h3 className="text-2xl font-semibold mb-4">The Science of Fibre Stretching vs Compression</h3>
                <p className="text-lg text-gray-700 mb-6">
                  The Tri-Creaser uses patented rubber technology to create a three-point channel system that gently 
                  stretches paper fibres into position rather than crushing them. This fundamental difference in approach 
                  is why Tri-Creaser succeeds where metal scoring fails - every single time.
                </p>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Channel Creation</h4>
                    <p className="text-sm text-gray-700">
                      Female die creates a precise 0.6mm channel without any fibre compression
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Gentle Stretching</h4>
                    <p className="text-sm text-gray-700">
                      Rubber male rib stretches fibres into channel - no crushing or damage
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h4 className="font-semibold mb-2">Natural Folding</h4>
                    <p className="text-sm text-gray-700">
                      Paper naturally folds along the created channel with zero resistance
                    </p>
                  </div>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4">Why Rubber Succeeds Where Metal Fails</h3>
                <ul className="space-y-2 text-gray-700">
                  <li>• <strong>0.6mm deep channels</strong> vs metal's inadequate 0.25mm compression</li>
                  <li>• <strong>Zero fibre damage</strong> - stretching preserves coating integrity</li>
                  <li>• <strong>Works at full speed</strong> - no need to slow down for quality</li>
                  <li>• <strong>Universal stock compatibility</strong> - 65gsm to 350gsm without adjustment</li>
                </ul>
              </div>
            </section>

            {/* TRI-CREASER FAST-FIT SECTION */}
            <section className="mb-12 border-2 border-blue-200 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-blue-900">Tri-Creaser Fast-Fit: Your Foundation Solution</h2>
              <p className="text-lg text-gray-700 mb-6">
                The Fast-Fit is our best-selling creasing device with over 40,000 installations worldwide. 
                Designed for folding machines processing single stock materials like book covers, brochures, 
                menus, greeting cards, and leaflets - everything your OEM scoring tools damage.
              </p>
              
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Fast-Fit Core Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Handles 65-350gsm stocks perfectly</li>
                    <li>• Letterpress-style creasing quality</li>
                    <li>• Split rib design for instant setup</li>
                    <li>• 8 built-in settings cover all materials</li>
                    <li>• Colour-coded for foolproof operation</li>
                  </ul>
                </div>
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Perfect Applications</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Commercial printing - brochures, leaflets</li>
                    <li>• Book covers and dust jackets</li>
                    <li>• Greeting cards and invitations</li>
                    <li>• Restaurant menus and folders</li>
                    <li>• General offset printing work</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Fast-Fit Installation System</h3>
                <p className="text-gray-700 mb-4">
                  The Fast-Fit features our revolutionary split rib technology. Modified split creasing ribs insert 
                  into the male hub and lock in place in seconds. Multiple option letterpress-style device slides 
                  directly onto your folding machine shafts, replacing destructive OEM scoring tools instantly.
                </p>
                <p className="font-semibold text-gray-900">
                  Setup time: Under 5 minutes from box to production
                </p>
              </div>
            </section>

            {/* TRI-CREASER ADVANCE ADD-ON SECTION */}
            <section className="mb-12 border-2 border-purple-200 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6 text-purple-900">Tri-Creaser Advance: Digital Print Mastery Add-On</h2>
              <p className="text-lg text-gray-700 mb-6">
                The Advance is our premium add-on module specifically engineered for companies processing high 
                volumes of digital prints and sensitive stock materials. This advanced component transforms your 
                Fast-Fit into the ultimate creasing system, conquering even the most challenging digital applications.
              </p>
              
              <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6 mb-8">
                <p className="text-lg font-semibold text-gray-900">
                  <span className="text-yellow-700">Important:</span> The Advance is an enhancement to your Fast-Fit, 
                  not a replacement. Together they provide complete creasing capability for every possible job.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Advance Digital Features</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Deep 0.8mm+ channel scoring capability</li>
                    <li>• Dual-action: soft rubber + plastic ribs</li>
                    <li>• Prevents inner flaking on digital stocks</li>
                    <li>• Specialized underside scoring protection</li>
                    <li>• Softer grade rubber for sensitive materials</li>
                  </ul>
                </div>
                <div className="bg-pink-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Critical Digital Applications</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>• Heavy toner coverage areas</li>
                    <li>• UV coated digital prints</li>
                    <li>• Laminated stocks and covers</li>
                    <li>• Cross-grain folding challenges</li>
                    <li>• Premium digital presentation folders</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gray-100 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Why Digital Prints Need Extra Care</h3>
                <p className="text-gray-700">
                  Digital toner sits on top of the paper surface rather than absorbing into it like offset ink. 
                  This creates a brittle layer that's even more prone to cracking than traditional coated stocks. 
                  The Advance module's deeper channels and softer rubber compounds specifically address these 
                  digital print challenges, ensuring perfect results even on the most difficult substrates.
                </p>
              </div>
            </section>

            {/* SIDE-BY-SIDE COMPARISON */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">Complete Creasing Power Comparison</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {/* OEM Metal Scoring */}
                <div className="bg-red-50 rounded-lg p-6 border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-900 mb-4">OEM Metal Scoring</h3>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Creasing Depth:</p>
                    <div className="bg-white rounded p-2">
                      <div className="h-6 bg-red-500 rounded" style={{width: '25%'}}></div>
                      <p className="text-xs mt-1">0.25mm (Weak)</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">✗</span>
                      <span>Crushes & damages fibres</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">✗</span>
                      <span>Causes coating cracks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">✗</span>
                      <span>Limited to light stocks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-red-500 mr-2">✗</span>
                      <span>170-year-old technology</span>
                    </li>
                  </ul>
                </div>

                {/* Fast-Fit */}
                <div className="bg-blue-50 rounded-lg p-6 border-2 border-blue-200">
                  <h3 className="text-xl font-bold text-blue-900 mb-4">Fast-Fit Foundation</h3>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Creasing Depth:</p>
                    <div className="bg-white rounded p-2">
                      <div className="h-6 bg-blue-500 rounded" style={{width: '60%'}}></div>
                      <p className="text-xs mt-1">0.6mm (Excellent)</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Stretches fibres gently</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>65-350gsm range</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Perfect for offset</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>8 instant settings</span>
                    </li>
                  </ul>
                </div>

                {/* Fast-Fit + Advance */}
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6 border-2 border-purple-300">
                  <h3 className="text-xl font-bold text-purple-900 mb-4">Fast-Fit + Advance</h3>
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-1">Creasing Depth:</p>
                    <div className="bg-white rounded p-2">
                      <div className="h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded" style={{width: '90%'}}></div>
                      <p className="text-xs mt-1">0.8mm+ (Maximum)</p>
                    </div>
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Conquers digital stocks</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>Dual-action protection</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>UV coating specialist</span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-green-500 mr-2">✓</span>
                      <span>100% job capability</span>
                    </li>
                  </ul>
                </div>
              </div>
              <p className="text-center mt-6 text-gray-700 font-semibold">
                Fast-Fit handles 90% of jobs perfectly. Add Advance for complete digital print mastery.
              </p>
            </section>

            {/* COLOUR-CODED SYSTEM */}
            <section className="mb-12 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Colour-Coded Instant Setup System</h2>
              <p className="text-lg text-gray-700 mb-6">
                Both Fast-Fit and Advance use our revolutionary colour-coding system that turns even 
                inexperienced operators into creasing experts. No measurements, no guesswork, no complex 
                adjustments - just match the colours and start producing perfect creases.
              </p>
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-yellow-400 rounded-full mx-auto mb-3"></div>
                  <p className="font-semibold">Yellow</p>
                  <p className="text-sm text-gray-600">65-100gsm</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full mx-auto mb-3"></div>
                  <p className="font-semibold">Green</p>
                  <p className="text-sm text-gray-600">100-150gsm</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-blue-600 rounded-full mx-auto mb-3"></div>
                  <p className="font-semibold">Blue</p>
                  <p className="text-sm text-gray-600">150-250gsm</p>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="w-16 h-16 bg-red-600 rounded-full mx-auto mb-3"></div>
                  <p className="font-semibold">Red</p>
                  <p className="text-sm text-gray-600">250-350gsm</p>
                </div>
              </div>
              <p className="text-center mt-6 text-gray-700">
                <strong>Setup time:</strong> Match colours, lock in place, start creasing - under 30 seconds
              </p>
            </section>

            {/* VIDEO DEMONSTRATIONS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6 text-center">See Both Solutions In Action</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Tri-Creaser Fast-Fit Demo</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/QEZVzxka01U"
                      title="Tri-Creaser Fast-Fit demonstration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg shadow-lg"
                      style={{ minHeight: '250px' }}
                    />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-4 text-center">Tri-Creaser Advance Demo</h3>
                  <div className="aspect-w-16 aspect-h-9">
                    <iframe 
                      src="https://www.youtube.com/embed/OvG34Rb95ck"
                      title="Tri-Creaser Advance demonstration"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full rounded-lg shadow-lg"
                      style={{ minHeight: '250px' }}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* TECHNICAL SPECIFICATIONS */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Complete Technical Specifications</h2>
              <div className="grid md:grid-cols-2 gap-6">
                {/* Fast-Fit Specs */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-blue-600 text-white p-4">
                    <h3 className="text-xl font-bold">Fast-Fit Specifications</h3>
                  </div>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b">
                        <td className="px-4 py-3 font-semibold bg-gray-50 text-sm">Stock Range</td>
                        <td className="px-4 py-3 text-sm">65-350gsm</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 font-semibold bg-gray-50 text-sm">Channel Depth</td>
                        <td className="px-4 py-3 text-sm">0.6mm</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 font-semibold bg-gray-50 text-sm">Settings</td>
                        <td className="px-4 py-3 text-sm">8 pre-determined</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 font-semibold bg-gray-50 text-sm">Best For</td>
                        <td className="px-4 py-3 text-sm">General commercial</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Advance Specs */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-purple-600 text-white p-4">
                    <h3 className="text-xl font-bold">Advance Add-On Specifications</h3>
                  </div>
                  <table className="w-full">
                    <tbody>
                      <tr className="border-b">
                        <td className="px-4 py-3 font-semibold bg-gray-50 text-sm">Enhanced Depth</td>
                        <td className="px-4 py-3 text-sm">0.8mm+</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 font-semibold bg-gray-50 text-sm">Technology</td>
                        <td className="px-4 py-3 text-sm">Dual-action</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 font-semibold bg-gray-50 text-sm">Rubber Grade</td>
                        <td className="px-4 py-3 text-sm">Softer compound</td>
                      </tr>
                      <tr className="border-b">
                        <td className="px-4 py-3 font-semibold bg-gray-50 text-sm">Best For</td>
                        <td className="px-4 py-3 text-sm">Digital & UV coated</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* COMPATIBLE MACHINES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Universal Folding Machine Compatibility</h2>
              <p className="text-lg text-gray-700 mb-6">
                The Tri-Creaser system is engineered to fit ALL major folding machine brands without modification
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
              <h2 className="text-3xl font-bold mb-6">Quantified Performance Improvements</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-green-600">100%</p>
                  <p className="text-sm text-gray-700">Fibre Cracking Eliminated</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-blue-600">140,000+</p>
                  <p className="text-sm text-gray-700">Global Installations</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-purple-600">350gsm</p>
                  <p className="text-sm text-gray-700">Maximum Stock Weight</p>
                </div>
                <div className="bg-orange-50 rounded-lg p-6 text-center">
                  <p className="text-3xl font-bold text-orange-600">1-3 jobs</p>
                  <p className="text-sm text-gray-700">Typical ROI</p>
                </div>
              </div>
            </section>

            {/* ROI SECTION */}
            <section className="mb-12 bg-gray-50 rounded-lg p-8">
              <h2 className="text-3xl font-bold mb-6">Complete System Investment Analysis</h2>
              <div className="bg-white rounded-lg shadow overflow-hidden mb-6">
                <table className="w-full">
                  <thead className="bg-gray-800 text-white">
                    <tr>
                      <th className="px-6 py-4 text-left">Cost Factor</th>
                      <th className="px-6 py-4 text-right">Metal Scoring</th>
                      <th className="px-6 py-4 text-right">Fast-Fit Only</th>
                      <th className="px-6 py-4 text-right">Fast-Fit + Advance</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="px-6 py-4">Fibre Cracking Waste</td>
                      <td className="px-6 py-4 text-right text-red-600">£800/week</td>
                      <td className="px-6 py-4 text-right text-green-600">£0</td>
                      <td className="px-6 py-4 text-right text-green-600">£0</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Digital Job Capability</td>
                      <td className="px-6 py-4 text-right text-red-600">Limited</td>
                      <td className="px-6 py-4 text-right text-yellow-600">Good</td>
                      <td className="px-6 py-4 text-right text-green-600">Perfect</td>
                    </tr>
                    <tr className="border-b">
                      <td className="px-6 py-4">Customer Satisfaction</td>
                      <td className="px-6 py-4 text-right text-red-600">Poor</td>
                      <td className="px-6 py-4 text-right text-green-600">Excellent</td>
                      <td className="px-6 py-4 text-right text-green-600">Perfect</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="px-6 py-4 font-bold">Weekly Savings</td>
                      <td className="px-6 py-4 text-right">-</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">£1,850</td>
                      <td className="px-6 py-4 text-right font-bold text-green-600">£2,200+</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-center text-lg font-semibold text-gray-700">
                Start with Fast-Fit. Add Advance when digital volume justifies the enhancement.
              </p>
            </section>

            {/* CUSTOMER SUCCESS STORIES */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Real-World Success Stories</h2>
              
              {/* Fast-Fit Success */}
              <div className="bg-blue-50 rounded-lg p-6 mb-6">
                <h3 className="text-xl font-semibold mb-3">Fast-Fit Success</h3>
                <blockquote className="italic text-lg text-gray-700 mb-3">
                  "The Tri-Creaser Fast-Fit paid for itself on the first job. We had a 10,000 run of coated 
                  brochures that would have been impossible without it. Zero cracks, zero waste, happy customer. 
                  What a change the Tri-Creaser Fast Fit is making for our business!"
                </blockquote>
                <p className="text-gray-600">- Glenn Felton, FMP</p>
              </div>

              {/* Advance Success */}
              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-3">Fast-Fit + Advance Success</h3>
                <blockquote className="italic text-lg text-gray-700 mb-3">
                  "We started with the Fast-Fit and it transformed our folding quality. When digital work 
                  increased to 40% of our volume, we added the Advance module. Now we can handle anything - 
                  heavy UV coatings, cross-grain digital stocks, you name it. The combination is unstoppable."
                </blockquote>
                <p className="text-gray-600">- Digital Print Manager, London</p>
              </div>
            </section>

            {/* 3-MONTH GUARANTEE */}
            <section className="mb-12 bg-green-50 rounded-lg p-8 text-center">
              <h2 className="text-3xl font-bold mb-4">3-Month 100% Money-Back Guarantee</h2>
              <p className="text-lg text-gray-700 mb-4">
                We're so confident the Tri-Creaser will transform your folding quality that we offer a full 
                3-month money-back guarantee. Try it risk-free on your most challenging jobs. If you're not 
                completely satisfied with the results, we'll refund your investment - no questions asked.
              </p>
              <p className="text-gray-600 font-semibold">No risk. No hassle. Just perfect creases.</p>
            </section>

            {/* WHAT'S INCLUDED */}
            <section className="mb-12">
              <h2 className="text-3xl font-bold mb-6">Complete System Components</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Fast-Fit Package Includes:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Complete Fast-Fit creasing system</li>
                    <li>✓ 8 colour-coded setting options</li>
                    <li>✓ Split rib quick-change design</li>
                    <li>✓ Installation guide & video</li>
                    <li>✓ 2-year warranty</li>
                  </ul>
                </div>
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-xl font-semibold mb-4">Advance Add-On Includes:</h3>
                  <ul className="space-y-2 text-gray-700">
                    <li>✓ Advance female component</li>
                    <li>✓ Softer rubber compounds</li>
                    <li>✓ Dual-action scoring system</li>
                    <li>✓ Digital stock optimization guide</li>
                    <li>✓ Extended 2-year warranty</li>
                  </ul>
                </div>
              </div>
              <div className="bg-gray-100 rounded-lg p-6 mt-6">
                <p className="text-center text-lg font-semibold">
                  Both packages include lifetime technical support and our 3-month guarantee
                </p>
              </div>
            </section>

            {/* FINAL CTA SECTION */}
            <section id="quote-form" className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-12 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">
                Ready to Transform Your Production?
              </h2>
              <p className="text-xl text-gray-700 mb-8">
                Join thousands of successful print shops using Tri-Creaser technology
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
                <ToolQuoteForm toolName="Tri-Creaser" />
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