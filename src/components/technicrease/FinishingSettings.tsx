'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function FinishingSettings() {
  const [activeTab, setActiveTab] = useState(0)

  const settings = [
    {
      id: 'crease-settings',
      title: 'Crease Settings',
      items: [
        { name: 'Orange Creasing Band', image: '/images/orange-creasing-band.jpg' },
        { name: 'Blue Creasing Band', image: '/images/blue-creasing-band.jpg' },
        { name: 'Yellow Creasing Band', image: '/images/yellow-creasing-band.jpg' },
        { name: 'Black Creasing Band', image: '/images/black-creasing-band.jpg' }
      ]
    },
    {
      id: 'digital-crease-settings',
      title: 'Digital Crease Settings',
      items: [
        { name: 'Red Creasing Band', image: '/images/red-creasing-band.jpg' },
        { name: 'Green Creasing Band', image: '/images/green-creasing-band.jpg' },
        { name: 'Pink Creasing Band', image: '/images/pink-creasing-band.jpg' },
        { name: 'Black Digital Creasing Band', image: '/images/black-creasing-band-digital.jpg' }
      ]
    },
    {
      id: 'micro-perforation-settings',
      title: 'Micro-Perforation Settings',
      items: [
        { name: '10 TPI Microperforation', image: '/images/10tpi-microperforation.jpg' },
        { name: '12 TPI Microperforation', image: '/images/12tpi-microperforation.jpg' },
        { name: '17 TPI Microperforation', image: '/images/17tpi-microperforation.jpg' },
        { name: '25 TPI Microperforation', image: '/images/25tpi-microperforation.jpg' },
        { name: '40 TPI Microperforation', image: '/images/40tpi-microperforation.jpg' },
        { name: '52 TPI Microperforation', image: '/images/52tpi-microperforation.jpg' },
        { name: '72 TPI Microperforation', image: '/images/72tpi-microperforation.jpg' }
      ]
    },
    {
      id: 'cutting-settings',
      title: 'Cutting Settings',
      items: [
        { name: 'Cutting Knife', image: '/images/cutting-knife.jpg' },
        { name: 'Long Cutting Knife', image: '/images/long-cutting-knife.jpg' },
        { name: 'Kiss Cutting Knife', image: '/images/kiss-cutting-knife.jpg' }
      ]
    },
    {
      id: 'scoring-settings',
      title: 'Scoring Settings',
      items: [
        { name: 'White Scoring Band', image: '/images/white-plastic-female.jpg' },
        { name: 'Red Scoring Band', image: '/images/red-plastic-female.jpg' },
        { name: 'Blue Scoring Band', image: '/images/blue-plastic-female.jpg' },
        { name: 'Yellow Scoring Band', image: '/images/yellow-plastic-female.jpg' }
      ]
    }
  ]

  const currentSetting = settings[activeTab]

  return (
    <section id="finishing-settings" className="bg-gray-100 py-16">
      <div className="max-w-7xl mx-auto px-6">
        {/* Subsection Header */}
        <div className="text-center mb-14">
          <h3 className="text-xl lg:text-2xl font-bold text-gray-900 mb-6">
            Our world leading machine direction finishing settings
          </h3>
          <p className="text-base text-gray-700 max-w-4xl mx-auto leading-relaxed">
            We can provide all of these finishes in the combination of your choice, depending on the job you are running and the finish you require.
          </p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="mb-12">
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            {settings.map((setting, index) => (
              <button
                key={setting.id}
                onClick={() => setActiveTab(index)}
                className={`px-5 py-3 text-sm font-semibold rounded border transition-all duration-200 ${
                  activeTab === index
                    ? 'bg-blue-900 text-white border-blue-900'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-blue-900'
                }`}
              >
                {setting.title}
              </button>
            ))}
          </div>
        </div>

        {/* Active Settings Content */}
        <div className="bg-white rounded-xl shadow-card border border-gray-200 p-8 max-w-5xl mx-auto">
          <h4 className="text-xl font-bold text-gray-900 mb-10 text-center">{currentSetting.title}</h4>
          
          {/* Settings Grid */}
          <div className={`grid gap-6 ${
            currentSetting.items.length <= 4 
              ? 'grid-cols-2 lg:grid-cols-4' 
              : currentSetting.items.length <= 5
              ? 'grid-cols-2 lg:grid-cols-5'
              : 'grid-cols-2 lg:grid-cols-4'
          }`}>
            {currentSetting.items.map((item, index) => (
              <div key={index} className="text-center">
                <div className="bg-gray-50 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 border border-gray-200">
                  <div className="relative w-full h-32 mb-3">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                  <h5 className="text-sm font-medium text-gray-900 leading-tight">{item.name}</h5>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}