export default function TechnicalCapabilities() {
  return (
    <section id="capabilities" className="bg-gray-50 py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
            Capabilities & Integration
          </h2>
        </div>

        {/* Technical Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left Column - Core Capabilities */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-10">Core Capabilities</h3>
            <div className="space-y-6">
              
              {/* Quality Control */}
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-blue-600">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Quality Control</h4>
                <p className="text-gray-700 leading-relaxed">
                  Features form under controlled web tension using proven 25+ year Technifold geometry
                </p>
              </div>

              {/* Consumable Economics */}
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-600">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Consumable Economics</h4>
                <p className="text-gray-700 leading-relaxed">
                  No custom dies. Matched band/channel sets. Setup changes in minutes, not days
                </p>
              </div>

              {/* Universal Integration */}
              <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-purple-600">
                <h4 className="text-xl font-bold text-gray-900 mb-4">Universal Integration</h4>
                <p className="text-gray-700 leading-relaxed">
                  Drop-in installation on any web line. No workflow disruption or press modifications
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Integration Flexibility */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-10">Integration Flexibility</h3>
            
            <div className="space-y-6">
              {/* Web Press */}
              <div className="bg-white p-6 rounded-lg shadow-card border border-gray-200">
                <h4 className="text-xl font-bold text-blue-900 mb-4">Web Press</h4>
                <div className="flex items-center justify-center space-x-4 text-gray-700">
                  <span className="bg-gray-100 px-3 py-2 rounded font-medium">Print</span>
                  <span className="text-blue-600 font-bold">→</span>
                  <span className="bg-blue-100 px-3 py-2 rounded font-medium text-blue-800">Technicrease</span>
                  <span className="text-blue-600 font-bold">→</span>
                  <span className="bg-gray-100 px-3 py-2 rounded font-medium">Sheeter</span>
                </div>
              </div>

              {/* Converting Line */}
              <div className="bg-white p-6 rounded-lg shadow-card border border-gray-200">
                <h4 className="text-xl font-bold text-green-900 mb-4">Converting Line</h4>
                <div className="flex items-center justify-center space-x-4 text-gray-700">
                  <span className="bg-gray-100 px-3 py-2 rounded font-medium">Unwind</span>
                  <span className="text-green-600 font-bold">→</span>
                  <span className="bg-green-100 px-3 py-2 rounded font-medium text-green-800">Technicrease</span>
                  <span className="text-green-600 font-bold">→</span>
                  <span className="bg-gray-100 px-3 py-2 rounded font-medium">Converting</span>
                </div>
              </div>

              {/* Retrofit */}
              <div className="bg-white p-6 rounded-lg shadow-card border border-gray-200">
                <h4 className="text-xl font-bold text-orange-900 mb-4">Retrofit</h4>
                <div className="text-center">
                  <span className="bg-orange-100 px-4 py-3 rounded font-medium text-orange-800 inline-block">
                    Add to any existing web press or converting line in any position
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}