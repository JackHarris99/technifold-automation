'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { getProductImagePath } from '@/lib/productImages';

interface TechnicalDataSheetProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tool: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  consumables: any[];
}

export function TechnicalDataSheet({ tool, consumables }: TechnicalDataSheetProps) {
  const [imageError, setImageError] = useState(false);
  const productImagePath = getProductImagePath(tool.product_code);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="mb-2">
                <Link href="/tools" className="text-blue-600 hover:text-blue-800 text-sm">
                  ← Back to Tools
                </Link>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">
                {tool.description || tool.product_code}
              </h1>
              <p className="text-gray-600 mt-1">
                Technical Data Sheet • Product Code: {tool.product_code}
              </p>
            </div>
            
            <div className="flex space-x-3">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Download PDF
              </button>
              <button className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50">
                Print
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Product Image and Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {/* Product Image */}
              <div className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative">
                {productImagePath && !imageError ? (
                  <Image
                    src={productImagePath}
                    alt={tool.description || tool.product_code}
                    fill
                    className="object-contain p-4"
                    onError={() => setImageError(true)}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="text-center">
                    <svg className="w-24 h-24 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Product Image</p>
                    <p className="text-xs text-gray-400">{tool.product_code}</p>
                  </div>
                )}
              </div>

              {/* Quick Info */}
              <div className="p-6">
                <div className="space-y-3">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Category</dt>
                    <dd className="text-sm text-gray-900">{tool.category}</dd>
                  </div>
                  
                  {tool.price && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500">List Price</dt>
                      <dd className="text-sm text-gray-900">£{tool.price} ex VAT</dd>
                    </div>
                  )}
                  
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                    <dd>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        In Production
                      </span>
                    </dd>
                  </div>
                </div>

                {/* Contact CTA */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <Link
                    href="/contact"
                    className="w-full bg-blue-600 text-white px-4 py-3 rounded-md font-medium hover:bg-blue-700 transition-colors text-center block"
                  >
                    Request Quote
                  </Link>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Technical consultation available
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Technical Specifications */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Description */}
            {tool.description && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Product Overview</h2>
                <p className="text-gray-700 leading-relaxed">{tool.description}</p>
              </div>
            )}

            {/* Technical Specifications Table */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Technical Specifications</h2>
              
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <tbody className="divide-y divide-gray-200">
                    <tr>
                      <td className="py-3 pr-6 text-sm font-medium text-gray-500">Product Code</td>
                      <td className="py-3 text-sm text-gray-900 font-mono">{tool.product_code}</td>
                    </tr>
                    
                    <tr>
                      <td className="py-3 pr-6 text-sm font-medium text-gray-500">Category</td>
                      <td className="py-3 text-sm text-gray-900">{tool.category}</td>
                    </tr>

                    {tool.specifications && (
                      <tr>
                        <td className="py-3 pr-6 text-sm font-medium text-gray-500">Specifications</td>
                        <td className="py-3 text-sm text-gray-900">{tool.specifications}</td>
                      </tr>
                    )}

                    {tool.dimensions && (
                      <tr>
                        <td className="py-3 pr-6 text-sm font-medium text-gray-500">Dimensions</td>
                        <td className="py-3 text-sm text-gray-900">{tool.dimensions}</td>
                      </tr>
                    )}

                    {tool.weight && (
                      <tr>
                        <td className="py-3 pr-6 text-sm font-medium text-gray-500">Weight</td>
                        <td className="py-3 text-sm text-gray-900">{tool.weight}</td>
                      </tr>
                    )}

                    {tool.material && (
                      <tr>
                        <td className="py-3 pr-6 text-sm font-medium text-gray-500">Material</td>
                        <td className="py-3 text-sm text-gray-900">{tool.material}</td>
                      </tr>
                    )}

                    {tool.compatibility && (
                      <tr>
                        <td className="py-3 pr-6 text-sm font-medium text-gray-500">Compatibility</td>
                        <td className="py-3 text-sm text-gray-900">{tool.compatibility}</td>
                      </tr>
                    )}

                    {tool.features && (
                      <tr>
                        <td className="py-3 pr-6 text-sm font-medium text-gray-500">Features</td>
                        <td className="py-3 text-sm text-gray-900">{tool.features}</td>
                      </tr>
                    )}

                    {tool.applications && (
                      <tr>
                        <td className="py-3 pr-6 text-sm font-medium text-gray-500">Applications</td>
                        <td className="py-3 text-sm text-gray-900">{tool.applications}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Compatible Consumables */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Compatible Consumables</h2>
              
              {consumables.length === 0 ? (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <p className="text-gray-500">Compatible consumables will be listed here</p>
                  <p className="text-xs text-gray-400 mt-1">Consumable relationships being configured</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {consumables.map((consumable, index) => (
                    <div key={consumable.product_code || index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-gray-900 text-sm">
                          {consumable.product_name || consumable.name || consumable.description}
                        </h3>
                        {consumable.price && (
                          <span className="text-sm font-medium text-gray-900">£{consumable.price}</span>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-500 font-mono mb-2">
                        {consumable.product_code}
                      </p>
                      
                      {consumable.description && (
                        <p className="text-xs text-gray-600">
                          {consumable.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Technical Notes */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-blue-900 mb-3">Technical Support</h3>
              <p className="text-blue-800 text-sm mb-4">
                For detailed technical consultation, installation guidance, or compatibility questions, 
                contact our technical support team.
              </p>
              <div className="flex space-x-4">
                <Link
                  href="/contact"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                >
                  Technical Consultation
                </Link>
                <button className="border border-blue-300 text-blue-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-100">
                  Download Installation Guide
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-12 bg-gray-900 rounded-lg p-8 text-white text-center">
          <h3 className="text-xl font-bold mb-2">Need This Product?</h3>
          <p className="text-gray-300 mb-4">
            Contact our sales team for pricing, availability, and technical consultation
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
            >
              Request Quote
            </Link>
            <button className="border border-gray-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-gray-800">
              Technical Support
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-4">
            Technical data sheet generated from product database • {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
    </div>
  );
}