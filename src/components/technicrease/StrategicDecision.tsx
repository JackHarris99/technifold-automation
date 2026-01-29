export default function StrategicDecision() {
  return (
    <section className="bg-blue-900 py-24 border-t-4 border-blue-800">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center text-white mb-18">
          <h2 className="text-3xl lg:text-4xl font-bold mb-8 leading-tight">
            The Strategic Decision
          </h2>
          <p className="text-lg lg:text-xl leading-relaxed max-w-4xl mx-auto font-light">
            Your web customers lose profitable work to sheet-fed operations while you compete on printing specifications. 
            Technicrease transforms them from print-only services to complete finishing solutions.
          </p>
        </div>

        {/* Transform Customer Relationships */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-white text-center mb-10">
            Transform Your Customer Relationships
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Current Reality */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h4 className="text-xl font-bold text-red-300 mb-6">Current Reality:</h4>
              
              <div className="bg-red-900/30 p-4 rounded-lg mb-6 border-l-4 border-red-400">
                <p className="text-white font-medium italic text-lg">
                  "We can print it, but you'll need finishing elsewhere"
                </p>
              </div>
              
              <p className="text-white/90 leading-relaxed">
                Customers decline work or pay sheet-fed premiums for machine direction finishing capability
              </p>
            </div>

            {/* With Technicrease */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
              <h4 className="text-xl font-bold text-green-300 mb-6">With Technicrease:</h4>
              
              <div className="bg-green-900/30 p-4 rounded-lg mb-6 border-l-4 border-green-400">
                <p className="text-white font-medium italic text-lg">
                  "We deliver finished product ready for your next operation"
                </p>
              </div>
              
              <p className="text-white/90 leading-relaxed">
                Customers capture premium work at web economics with integrated finishing
              </p>
            </div>
          </div>
        </div>

        {/* Market Validation Points */}
        <div className="mb-16">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="space-y-6 text-white">
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-green-400 rounded-full mt-1 flex-shrink-0"></div>
                <p className="text-lg leading-relaxed">
                  <span className="font-bold">The market need is proven.</span> Every major manufacturer is investing in web finishing, validating demand.
                </p>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-blue-400 rounded-full mt-1 flex-shrink-0"></div>
                <p className="text-lg leading-relaxed">
                  <span className="font-bold">The technology is ready.</span> 25+ years of proven geometry, adapted for web operation with consumable flexibility.
                </p>
              </div>
              
              <div className="flex items-start gap-4">
                <div className="w-3 h-3 bg-orange-400 rounded-full mt-1 flex-shrink-0"></div>
                <p className="text-lg leading-relaxed">
                  <span className="font-bold">The window is closing.</span> First to offer integrated machine direction finishing capability captures competitive advantage.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <h3 className="text-2xl font-bold text-white text-center mb-8">Next Steps</h3>
          <div className="bg-white/15 backdrop-blur-sm rounded-xl p-8 border border-white/20">
            <div className="text-white space-y-6">
              <p className="text-xl leading-relaxed">
                <span className="font-bold text-yellow-300">See the difference.</span> Install Technicrease on one customer line. Bring two jobs they currently outsource or decline. Watch web finishing deliver sheet-fed quality at web speeds.
              </p>
              
              <p className="text-lg leading-relaxed border-t border-white/20 pt-6">
                In our experience, seeing crack-free machine direction features form at web speeds makes the business case obvious.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}