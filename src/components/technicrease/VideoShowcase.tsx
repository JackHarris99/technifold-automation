export default function VideoShowcase() {
  return (
    <section className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            See TechniCrease in Action
          </h2>
          <p className="text-lg text-gray-700 max-w-3xl mx-auto">
            Watch how TechniCrease transforms web operations with machine direction finishing at full press speed
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="relative rounded-xl overflow-hidden shadow-2xl border-4 border-gray-200">
            <video
              controls
              className="w-full h-auto"
              preload="metadata"
            >
              <source src="/technicrease/hunkeler-technicrease.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      </div>
    </section>
  )
}
