import Image from 'next/image'

export default function ProvenResults() {
  return (
    <section id="proven-results" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            Proven results across industrial segments
          </h2>
          <p className="text-lg text-gray-700 mb-6">
            Four distinct manufacturing challenges. One integrated solution
          </p>
        </div>

        {/* Case Studies - Single Column */}
        <div className="space-y-12">
          {/* Case Study Card 1 */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-blue-900 text-white text-center py-5 px-8">
              <h3 className="text-xl font-bold mb-2">UK Commercial Printer</h3>
              <p className="text-sm font-medium opacity-90">High-volume retail packaging</p>
            </div>
            
            <div className="p-8">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column - Text Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Challenge Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-lg">1</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Challenge</h4>
                    <p className="text-gray-700 leading-relaxed mb-4">
                      Our customer won a major wallet contract with a UK retailer due to the incredible speed and competitive price they were able to offer with their web fed press.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Unfortunately after testing, their samples were rejected due fibre-cracking on the spine when the wallets were folded.
                    </p>
                  </div>
                </div>

                {/* Solution Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">2</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Solution</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Technicrease Web Cassette with 2 creasing devices retro-fitted just before the sheeter on their web press, allowing them to crease the work inline at 100% web speed and provide the UK retailer with the perfect product.
                    </p>
                  </div>
                </div>

                {/* Outcome Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">3</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Outcome</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Not only did our customer complete the job to perfection, they also secured the same multi-million run job annually. With the Technicrease Cassette installed on their press they can now quote for jobs that would typically end up with sheet-fed printers, making the whole job slower and more expensive.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Media Content */}
              <div className="lg:col-span-1 space-y-8">
                {/* Challenge Image */}
                <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-sm">
                  <Image
                    src="/technicrease/job-1-picture.jpg"
                    alt="Wallet packaging challenge"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Solution Video */}
                <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-sm bg-gray-900">
                  <video
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    <source src="/technicrease/job-1-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Case Study Card 2 */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-blue-900 text-white text-center py-5 px-8">
              <h3 className="text-xl font-bold mb-2">Hunkeler Line Integration</h3>
              <p className="text-sm font-medium opacity-90">Converting Operation</p>
            </div>
            
            <div className="p-8">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column - Text Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Challenge Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-lg">1</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Challenge</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Our customer needed machine direction microperforation to maintain sheet strength and flatness for continued processing whilst also allowing for smooth and easy tear later in the process.
                    </p>
                  </div>
                </div>

                {/* Solution Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">2</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Solution</h4>
                    <p className="text-gray-700 leading-relaxed">
                      We installed a Technicrease Web Cassette with 2 of our fine, flat micro-perforation devices allowing them to keep the whole process inline with zero loss of speed and eliminating the worry of huge capital expenditure and a significant length of time before ROI.
                    </p>
                  </div>
                </div>

                {/* Outcome Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">3</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Outcome</h4>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      Before discovering Technicrease our customer thought that the only solution available to them would be a 6 figure OEM finishing system which would be overkill for a machine direction finish like this.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Smart capital allocation, full web speed capacity and jobs they can now win instead of decline.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Media Content */}
              <div className="lg:col-span-1 space-y-8">
                {/* Challenge Image */}
                <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-sm">
                  <Image
                    src="/technicrease/job-4-picture.jpg"
                    alt="Hunkeler line microperforation challenge"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Solution Video */}
                <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-sm bg-gray-900">
                  <video
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    <source src="/technicrease/job-4-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Case Study Card 3 */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-blue-900 text-white text-center py-5 px-8">
              <h3 className="text-xl font-bold mb-2">Deep Scoring Specialist</h3>
              <p className="text-sm font-medium opacity-90">Precision Folding</p>
            </div>
            
            <div className="p-8">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column - Text Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Challenge Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-lg">1</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Challenge</h4>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      Our customer needed flatter folds on plain stock that simply could not be achieved on their web line. Machine direction web scoring solutions lack precision, control and flexibility.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Deep, wide scores can't be achieved without cutting through the paper.
                    </p>
                  </div>
                </div>

                {/* Solution Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">2</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Solution</h4>
                    <p className="text-gray-700 leading-relaxed">
                      We installed our Technicrease Web Cassette with 2 Scoring devices allowing the customer to achieve deep wide scoring without damaging their material. Technicrease's calliper settings allowed them to set the cassette to the exact sheet thickness before choosing a width and depth of score perfect for the fold they wanted.
                    </p>
                  </div>
                </div>

                {/* Outcome Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">3</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Outcome</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Perfect scores achieved without ever damaging their stock by having to put too much pressure on the sheet, enabling the flattest possible fold of their signature work without ever having to slow down their web because of harsh metal scoring system or waste thousands of metres of print because of damage.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Media Content */}
              <div className="lg:col-span-1 space-y-8">
                {/* Challenge Image */}
                <div className="relative w-full h-64 rounded-lg overflow-hidden shadow-sm">
                  <Image
                    src="/technicrease/deep-score.JPG"
                    alt="Deep scoring precision folding challenge"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Solution Video */}
                <div className="relative w-full h-80 rounded-lg overflow-hidden shadow-sm bg-gray-900">
                  <video
                    controls
                    className="w-full h-full object-cover"
                    preload="metadata"
                  >
                    <source src="/technicrease/job-2-video.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Case Study Card 4 */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden max-w-5xl mx-auto">
            {/* Header */}
            <div className="bg-blue-900 text-white text-center py-5 px-8">
              <h3 className="text-xl font-bold mb-2">UK Food Packaging Converter</h3>
              <p className="text-sm font-medium opacity-90">Carton Production</p>
            </div>
            
            <div className="p-8">
            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              {/* Left Column - Text Content */}
              <div className="lg:col-span-2 space-y-12">
                {/* Challenge Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 font-bold text-lg">1</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Challenge</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Our customer had problems with machine direction creasing as their rotary die registration was failing catastrophically, creating hundreds of meters of waste daily on thick, brittle carton stock.
                    </p>
                  </div>
                </div>

                {/* Solution Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">2</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Solution</h4>
                    <p className="text-gray-700 leading-relaxed mb-2">
                      The Technicrease Web Cassette fitted with 4 of our speciality digital creasing devices designed to be more forgiving on digital and brittle stock whilst maintaining the width, depth and flexibility of our other creasing cassettes.
                    </p>
                    <p className="text-gray-700 leading-relaxed">
                      Delicate, forgiving digital creasing bands handle difficult stock with precision and consistency.
                    </p>
                  </div>
                </div>

                {/* Outcome Section */}
                <div className="flex items-start gap-6">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">3</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">The Outcome</h4>
                    <p className="text-gray-700 leading-relaxed">
                      Perfect crack-free finishing. Zero waste production runs. Smooth, uninterrupted operation. Our delicate, forgiving digital creasing bands handle difficult stock with precision and consistency.
                    </p>
                  </div>
                </div>
              </div>

              {/* Right Column - Media Content */}
              <div className="lg:col-span-1 flex flex-col justify-between space-y-4 h-full">
                {/* Image 1 - Flat sleeve */}
                <div className="relative w-full h-40 rounded-lg overflow-hidden shadow-sm">
                  <Image
                    src="/technicrease/food-sleeve-flat.JPG"
                    alt="Food packaging sleeve before processing"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Image 2 - 4 creases */}
                <div className="relative w-full h-40 rounded-lg overflow-hidden shadow-sm">
                  <Image
                    src="/technicrease/4-creases-black.jpg"
                    alt="Four parallel creases on carton stock"
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Image 3 - Finished sleeve */}
                <div className="relative w-full h-40 rounded-lg overflow-hidden shadow-sm">
                  <Image
                    src="/technicrease/food-sleeve-finished.JPG"
                    alt="Finished food packaging sleeve"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}