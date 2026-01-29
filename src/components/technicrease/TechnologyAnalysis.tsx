'use client'

import { useState } from 'react'

export default function TechnologyAnalysis() {
  const [activeTab, setActiveTab] = useState(0)

  const technologies = [
    {
      id: 'knife-scoring',
      title: 'Knife Scoring and Perforation Systems',
      badge: { text: 'Cost Effective', color: 'bg-green-100 text-green-800' },
      companies: 'DIENES USA • Baucor • Sauer System',
      excelsAt: {
        title: 'What They Excel At:',
        content: [
          'Fast, simple scoring operations on uncoated materials. Cost-effective for basic applications where substrate cracking isn\'t a concern.',
          'Easy integration into existing web lines with minimal setup.'
        ]
      },
      problems: {
        title: 'Why Wrong for MD Finishing:',
        points: [
          { text: 'Cause "crush cutting" that cracks coated substrates - exactly what premium packaging and publication work cannot tolerate' },
          { text: 'Quality problems like "flat spots on knife tip" and "excessive wobble" create inconsistent results across web width' },
          { text: 'Maintenance-intensive with precise hardness requirements (60-62 Rockwell C)' }
        ]
      },
      technicrease: {
        sections: [
          {
            title: 'Coating Protection:',
            color: 'text-blue-700',
            content: 'Proven 25+ year geometry prevents fiber cracking • Perfect for premium coated stocks'
          },
          {
            title: 'Consistent Quality:',
            color: 'text-green-700',
            points: [
              'No knife wear variations',
              'Uniform results across entire web width'
            ]
          },
          {
            title: 'Low Maintenance:',
            color: 'text-blue-700',
            points: [
              'Standard band/channel system',
              'No precision hardness requirements'
            ]
          }
        ]
      }
    },
    {
      id: 'flatbed-die',
      title: 'Flatbed Die-Cutting Systems',
      badge: { text: 'Heavy Duty', color: 'bg-orange-100 text-orange-800' },
      companies: 'Heidelberg • Bobst • Asahi',
      excelsAt: {
        title: 'What They Excel At:',
        content: [
          'Thick materials and large-format work that rotary systems cannot handle. Process materials up to 4 inches thick with precise cuts.',
          'The standard for corrugated packaging and heavy cardboard conversion.'
        ]
      },
      problems: {
        title: 'Why Wrong for MD Finishing:',
        points: [
          { text: '"Downright slow" compared to rotary systems - maximum 9,000 sheets/hour destroys web speed advantages' },
          { text: 'Sheet-fed only operation breaks continuous web workflow' },
          { text: 'Cannot process roll materials at web speeds' }
        ]
      },
      technicrease: {
        sections: [
          {
            title: 'Web Speed Processing:',
            color: 'text-green-700',
            points: [
              'Full press speeds maintained',
              'No production bottleneck',
              '180,000+ sheets/hour capability'
            ]
          },
          {
            title: 'Continuous Web Integration:',
            color: 'text-blue-700',
            points: [
              'Direct roll processing',
              'Seamless line integration',
              'No workflow interruption'
            ]
          },
          {
            title: 'Format Flexibility:',
            color: 'text-green-700',
            content: 'Handles standard web substrates at full speed • Perfect for Machine Direction applications'
          }
        ]
      }
    },
    {
      id: 'laser-cutting',
      title: 'Laser Cutting Systems',
      badge: { text: 'Ultimate Flexibility', color: 'bg-purple-100 text-purple-800' },
      companies: 'Trotec • Boss Laser • Sei Spa • AB Graphic',
      excelsAt: {
        title: 'What They Excel At:',
        content: [
          'Ultimate flexibility for prototyping and complex variable patterns. Can cut any shape, change patterns instantly between jobs, handle materials that dies cannot process.',
          'Perfect for short runs requiring multiple different patterns.'
        ]
      },
      problems: {
        title: 'Why Wrong for MD Finishing:',
        points: [
          { text: 'Capital costs of $500K-2M economically absurd for simple straight-line features' },
          { text: 'High operating costs including nitrogen generation and frequent consumable replacement destroy web economics' },
          { text: 'Speed limitations when processing long linear features • Heat-affected zones on sensitive substrates' }
        ]
      },
      technicrease: {
        sections: [
          {
            title: 'Right-Sized Investment:',
            color: 'text-green-700',
            content: 'Fraction of laser cost • Purpose-built for Machine Direction applications'
          },
          {
            title: 'Web Economics:',
            color: 'text-blue-700',
            points: [
              'Low operating costs',
              'No special utilities or consumables',
              'Maintains web speed advantages'
            ]
          },
          {
            title: 'Clean Processing:',
            color: 'text-green-700',
            points: [
              'No heat effects',
              'Maintains substrate integrity',
              'Ideal for sensitive coated materials'
            ]
          }
        ]
      }
    },
    {
      id: 'rotary-die',
      title: 'Rotary Die Systems',
      badge: { text: 'Industry Standard', color: 'bg-blue-100 text-blue-800' },
      companies: 'RotoMetrics • Kocher & Beck • Wink • Markem-Imaje',
      excelsAt: {
        title: 'What They Excel At:',
        content: [
          'Complex shaped cutting at high speeds. Gold standard for intricate label shapes, packaging contours, and curved geometry.',
          'Deliver consistent, precise cuts on thin materials at web speeds.'
        ]
      },
      problems: {
        title: 'Why Wrong for MD Finishing:',
        points: [
          { text: 'Massive overkill for straight lines - paying $5,000+ for custom tooling and 3-week lead times' },
          { text: 'Registration drift across web width affects quality over long runs' },
          { text: 'Setup complexity makes job variations economically prohibitive' }
        ]
      },
      technicrease: {
        sections: [
          {
            title: 'Purpose-Built Solution:',
            color: 'text-blue-700',
            content: 'Designed specifically for straight machine direction lines • No overkill complexity'
          },
          {
            title: 'Consumable Economics:',
            color: 'text-green-700',
            points: [
              'Standard bands under $100',
              'Setup in minutes',
              'Immediate job variations'
            ]
          },
          {
            title: 'Consistent Quality:',
            color: 'text-blue-700',
            points: [
              'No registration drift',
              'Uniform results across web width'
            ]
          }
        ]
      }
    }
  ]

  const currentTech = technologies[activeTab]

  return (
    <section id="technology-analysis" className="bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">
            Technology Analysis
          </h2>
          <p className="text-lg text-gray-700 max-w-4xl mx-auto">
            Current Solutions vs. Technicrease Technology
          </p>
          <p className="text-base text-gray-600 mt-6 mb-4 max-w-4xl mx-auto">
            Comparative analysis of existing web finishing approaches and integrated Technicrease solution
          </p>
        </div>

        {/* Technology Navigation Tabs */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {technologies.map((tech, index) => (
              <button
                key={tech.id}
                onClick={() => setActiveTab(index)}
                className={`px-5 py-3 text-sm font-semibold rounded border transition-all duration-200 ${
                  activeTab === index
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-900'
                }`}
              >
                {tech.title}
              </button>
            ))}
          </div>
        </div>

        {/* Active Technology Comparison Card */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden max-w-6xl mx-auto">
          {/* Card Header */}
          <div className="bg-gray-100 px-8 py-4 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900 text-center">{currentTech.title}</h3>
          </div>
          
          {/* Split Content */}
          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[400px]">
            
            {/* Left Side - Existing Solution */}
            <div className="p-8 border-r border-gray-200">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">{currentTech.title}</h4>
                  <div className="text-sm text-gray-600 mb-4">
                    <span className="font-medium">{currentTech.companies}</span>
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${currentTech.badge.color}`}>
                    {currentTech.badge.text}
                  </div>
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold text-green-700 mb-3">{currentTech.excelsAt.title}</h5>
                  {currentTech.excelsAt.content.map((text, index) => (
                    <p key={index} className="text-gray-700 leading-relaxed mb-4 last:mb-0">
                      {text}
                    </p>
                  ))}
                </div>
                
                <div>
                  <h5 className="text-lg font-semibold text-red-700 mb-3">{currentTech.problems.title}</h5>
                  <div className="space-y-3">
                    {currentTech.problems.points.map((point, index) => (
                      <div key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0"></div>
                        <p className="text-gray-700">
                          {point.text.includes('$') || point.text.includes('"') ? (
                            <span dangerouslySetInnerHTML={{
                              __html: point.text
                                .replace(/\$([0-9K-M]+)/g, '<span class="font-medium">$$$1</span>')
                                .replace(/"([^"]+)"/g, '<span class="font-medium">"$1"</span>')
                                .replace(/(\b\w+\s+overkill\b|\bmassive overkill\b|\bregistration drift\b|\bsetup complexity\b|\bcrush cutting\b|\bflat spots on knife tip\b|\bexcessive wobble\b|\bmaintenance-intensive\b|\bcapital costs\b|\bhigh operating costs\b|\bspeed limitations\b|\bdownright slow\b|\bsheet-fed only operation\b|\bcannot process roll materials\b)/gi, '<span class="font-medium">$1</span>')
                            }}
                          />
                          ) : (
                            point.text
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right Side - Technicrease Solution */}
            <div className="p-8 bg-blue-50">
              <div className="space-y-6">
                <div>
                  <h4 className="text-xl font-bold text-blue-900 mb-3">Technicrease for MD Finishing</h4>
                </div>
                
                {currentTech.technicrease.sections.map((section, index) => (
                  <div key={index}>
                    <h5 className={`text-lg font-semibold ${section.color} mb-3`}>{section.title}</h5>
                    {section.content ? (
                      <p className="text-gray-800 leading-relaxed">{section.content}</p>
                    ) : (
                      <div className="space-y-2">
                        {section.points?.map((point, pointIndex) => (
                          <div key={pointIndex} className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${
                              section.color.includes('green') ? 'bg-green-500' : 'bg-blue-500'
                            }`}></div>
                            <p className="text-gray-800">
                              <span className="font-medium">{point}</span>
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}