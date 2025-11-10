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
  resolved_before_image_url?: string;
  resolved_after_image_url?: string;
  resolved_product_image_url?: string;
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

                {/* RIGHT COLUMN: Solution Showcase (Before/After/Product Images) */}
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-8 lg:p-12 border-l-2 border-gray-200 flex flex-col gap-6">
                  {/* Before Image */}
                  {card.resolved_before_image_url && (
                    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                      <div className="bg-red-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-sm font-bold text-red-800">Before</h4>
                      </div>
                      <div className="relative h-48 w-full bg-gray-100">
                        <MediaImage
                          src={card.resolved_before_image_url}
                          alt="Before using solution"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* After Image */}
                  {card.resolved_after_image_url && (
                    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                      <div className="bg-green-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-sm font-bold text-green-800">After</h4>
                      </div>
                      <div className="relative h-48 w-full bg-gray-100">
                        <MediaImage
                          src={card.resolved_after_image_url}
                          alt="After using solution"
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    </div>
                  )}

                  {/* Product Image */}
                  {card.resolved_product_image_url && (
                    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                      <div className="bg-blue-50 px-4 py-2 border-b border-gray-200">
                        <h4 className="text-sm font-bold text-blue-800">Solution Tool</h4>
                      </div>
                      <div className="relative h-64 w-full bg-white p-4">
                        <MediaImage
                          src={card.resolved_product_image_url}
                          alt={`${card.solution_name} product`}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}

                  {/* Fallback if no images available */}
                  {!card.resolved_before_image_url && !card.resolved_after_image_url && !card.resolved_product_image_url && (
                    <div className="flex-1 flex items-center justify-center text-center py-8 text-gray-500">
                      <div>
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-sm">
                          Images coming soon
                        </p>
                      </div>
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
