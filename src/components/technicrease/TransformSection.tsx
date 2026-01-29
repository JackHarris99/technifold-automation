import Image from 'next/image'

export default function TransformSection() {
  const applications = [
    {
      title: "Food Packaging Sleeves",
      description: "4 parallel creases on coated board—currently sheet-fed exclusive",
      image: "/technicrease/food-sleeve-finished.JPG"
    },
    {
      title: "Greetings Cards", 
      description: "Single crease that maintains full ink structure with no damage",
      image: "/technicrease/cracked-spine-after.JPG"
    },
    {
      title: "Book Covers",
      description: "Spine creases at web speeds—currently separate bindery operations", 
      image: "/technicrease/book-cover-result-finished-2.jpg"
    },
    {
      title: "Event Tickets and Ticket Books",
      description: "Center crease + micro-perfs—currently complex offline finishing",
      image: "/technicrease/ticket-book-sample-3.jpg"
    }
  ]

  return (
    <section id="transform" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Full Width Title */}
        <div className="text-center mb-12">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 leading-tight">
            Transform web operations from basic printing to complete finishing solutions
          </h2>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Left Column - Machine Image */}
          <div className="flex justify-center">
            <div className="relative w-full max-w-md">
              <Image
                src="/technicrease/machine-2.jpg"
                alt="Technicrease Web Cassette Finishing System"
                width={400}
                height={500}
                className="w-full h-auto rounded-lg shadow-card object-contain"
                priority
              />
            </div>
          </div>

          {/* Right Column - Problem/Solution Text */}
          <div className="space-y-8">
            <div className="space-y-6 text-lg text-gray-800 leading-relaxed">
              <p>
                Web operations currently can't add machine direction features at web speeds without cracking coated substrates. They're forced to outsource or decline profitable work.
              </p>
              
              <p className="text-xl font-bold text-blue-900">
                Technicrease changes that.
              </p>
              
              <p>
                A compact cassette that drops into any web line and adds crack-free machine direction creasing, micro-perforation, kiss-cutting, and slitting at full press speed.
              </p>
            </div>
          </div>
        </div>
        
        {/* Full Width Subtitle */}
        <div className="mt-20 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center">
            Finally capture the work that goes elsewhere
          </h3>
        </div>

        {/* Application Examples Grid */}
        <div className="mt-16">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Application Examples</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {applications.map((app, index) => (
              <div key={index} className="bg-white rounded-lg shadow-card hover:shadow-card-hover transition-shadow duration-200">
                <div className="relative w-full h-48">
                  <Image
                    src={app.image}
                    alt={app.title}
                    fill
                    className="object-cover rounded-t-lg"
                  />
                </div>
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">{app.title}</h4>
                  <p className="text-sm text-gray-600 leading-tight">{app.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Page-wide Banner */}
        <div className="mt-20 bg-blue-900 text-white py-12 -mx-6">
          <div className="max-w-5xl mx-auto text-center px-6">
            <p className="text-lg lg:text-xl font-medium leading-relaxed">
              These aren't niche markets. They're billion-unit categories your customers lose to sheet-fed competitors.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
