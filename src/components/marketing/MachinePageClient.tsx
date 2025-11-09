/**
 * Client wrapper for machine page - handles CaptureModal state
 */

'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CaptureModal from './CaptureModal';
import MediaImage from '@/components/shared/MediaImage';
import { replacePlaceholders } from '@/lib/textUtils';

interface Problem {
  problem_solution_id: string;
  solution_name: string;
  title: string;
  resolved_card_copy: string;
  resolved_cta: string;
  resolved_image_url?: string;
  curated_skus?: string[];
}

interface Product {
  product_code: string;
  description: string;
  image_url?: string;
  category?: string;
}

interface MachinePageClientProps {
  machineData: {
    machine_id: string;
    brand: string;
    model: string;
    display_name: string;
  };
  problemCards: Problem[];
  products: Product[];
}

export default function MachinePageClient({
  machineData,
  problemCards,
  products
}: MachinePageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  // Create product map for quick lookups
  const productMap = new Map(
    products.map(p => [p.product_code, p])
  );

  return (
    <>
      <div className="space-y-12 mb-16">
        {problemCards.map((card: any) => {
          const imageUrl = card.resolved_image_url || '/placeholder-machine.jpg';

          // Replace placeholders in card copy and CTA
          const cardCopy = replacePlaceholders(card.resolved_card_copy, {
            brand: machineData.brand,
            model: machineData.model,
            display_name: machineData.display_name,
            type: undefined
          });

          const ctaText = replacePlaceholders(
            card.resolved_cta || `See how this works on your ${machineData.brand} ${machineData.model}`,
            {
              brand: machineData.brand,
              model: machineData.model,
              display_name: machineData.display_name,
              type: undefined
            }
          );

          // Get curated products for this solution
          const curatedProducts = (card.curated_skus || [])
            .map((sku: string) => productMap.get(sku))
            .filter((p): p is Product => p !== undefined);

          return (
            <div key={card.problem_solution_id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all">
              {/* 2-Column Grid */}
              <div className="grid lg:grid-cols-2 gap-0">
                {/* LEFT COLUMN: Solution Marketing Content */}
                <div className="p-8 lg:p-12 flex flex-col">
                  {/* Solution Badge */}
                  <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-6 self-start">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {card.solution_name}
                  </div>

                  {/* Solution Image (if available) */}
                  {imageUrl && imageUrl !== '/placeholder-machine.jpg' && (
                    <div className="relative h-48 w-full bg-gray-100 rounded-xl overflow-hidden mb-6">
                      <MediaImage
                        src={imageUrl}
                        alt={`${card.solution_name} - ${card.title}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />
                    </div>
                  )}

                  {/* Marketing Copy */}
                  <div className="prose prose-lg max-w-none mb-8 flex-1">
                    <ReactMarkdown>{cardCopy}</ReactMarkdown>
                  </div>

                  {/* CTA Button */}
                  <button
                    onClick={() => setModalOpen(true)}
                    className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors self-start"
                  >
                    {ctaText}
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* RIGHT COLUMN: Product Showcase */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12 border-l-2 border-gray-200">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    Recommended Tools
                  </h3>
                  <p className="text-sm text-gray-600 mb-6">
                    Precision-engineered for your {machineData.brand}
                  </p>

                  {curatedProducts.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {curatedProducts.map((product) => (
                        <div key={product.product_code} className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-blue-400 hover:shadow-lg transition-all">
                          {/* Product Image */}
                          <div className="relative h-32 w-full bg-gray-100 rounded-lg overflow-hidden mb-3">
                            <MediaImage
                              src={product.image_url || '/placeholder.svg'}
                              alt={product.description}
                              fill
                              sizes="200px"
                              className="object-contain p-2"
                            />
                          </div>

                          {/* Product Info */}
                          <div className="text-center">
                            <p className="text-xs font-bold text-blue-600 mb-1">
                              {product.product_code}
                            </p>
                            <p className="text-xs text-gray-700 line-clamp-2">
                              {product.description}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                      <p className="text-sm">
                        Contact us for product recommendations
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Capture Modal */}
      <CaptureModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        initialMachineId={machineData.machine_id}
        initialMachineName={machineData.display_name}
        initialProblems={problemCards.map(card => ({
          problem_solution_id: card.problem_solution_id,
          solution_name: card.solution_name,
          title: card.title
        }))}
      />
    </>
  );
}
