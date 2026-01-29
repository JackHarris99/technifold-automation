import Image from 'next/image'

export default function ProductShowcase() {
  const finishTypes = [
    {
      name: 'Creasing',
      image: '/images/single-yellow-crease.jpg'
    },
    {
      name: 'Micro-Perforation',
      image: '/images/micro-perforation-2.jpg'
    },
    {
      name: 'Slitting',
      image: '/images/double-cut.jpg'
    },
    {
      name: 'Kiss-Cutting',
      image: '/images/double-kiss-cut.JPG'
    },
    {
      name: 'Scoring',
      image: '/images/single-orange-crease.jpg'
    }
  ]

  return (
    <section id="product-showcase" className="bg-gray-50 py-18">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 leading-tight">
            Technicrease Web Cassette Finishing System
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
            Machine Direction Creasing, Micro-Perforation, Slitting, Kiss-Cutting and Scoring at full web speed
          </p>
        </div>

        {/* Finish Types Grid */}
        <div>
          <h3 className="text-xl font-semibold text-gray-900 mb-12 text-center">Complete Finishing Capabilities</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 max-w-5xl mx-auto">
            {finishTypes.map((finish, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-50 rounded-lg p-4 shadow-card hover:shadow-card-hover transition-shadow duration-200">
                  <div className="relative w-full h-24 mb-4">
                    <Image
                      src={finish.image}
                      alt={finish.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 leading-tight">{finish.name}</h4>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}