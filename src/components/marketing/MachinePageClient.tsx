/**
 * Client wrapper for machine page - handles CaptureModal state
 */

'use client';

import { useState } from 'react';
import CaptureModal from './CaptureModal';
import MediaImage from '@/components/shared/MediaImage';
import SmartCopyRenderer from './SmartCopyRenderer';
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

  // Group problem cards by solution_name
  const solutionGroups = problemCards.reduce((acc, card) => {
    const key = card.solution_name;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(card);
    return acc;
  }, {} as Record<string, Problem[]>);

  return (
    <>
      <div className="space-y-12 mb-16">
        {Object.entries(solutionGroups).map(([solutionName, cards]) => {
          // Use the primary problem's data, or the first one
          const primaryCard = cards.find(c => (c as any).is_primary_pitch) || cards[0];
          const imageUrl = primaryCard.resolved_image_url || '/placeholder-machine.jpg';

          // Replace placeholders in primary card copy and CTA
          const cardCopy = replacePlaceholders(primaryCard.resolved_card_copy, {
            brand: machineData.brand,
            model: machineData.model,
            display_name: machineData.display_name,
            type: undefined
          });

          const ctaText = replacePlaceholders(
            primaryCard.resolved_cta || `See how this works on your ${machineData.brand} ${machineData.model}`,
            {
              brand: machineData.brand,
              model: machineData.model,
              display_name: machineData.display_name,
              type: undefined
            }
          );

          // Merge curated products from all problems in this solution
          const allSkus = new Set<string>();
          cards.forEach(card => {
            (card.curated_skus || []).forEach(sku => allSkus.add(sku));
          });
          const curatedProducts = Array.from(allSkus)
            .map((sku: string) => productMap.get(sku))
            .filter((p): p is Product => p !== undefined);

          return (
            <div key={solutionName} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all">
              {/* Solution Badge - Full Width */}
              <div className="px-8 pt-8">
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-6">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {solutionName}
                </div>
              </div>

              {/* Hero/Main Image - Prominent Display */}
              {imageUrl && imageUrl !== '/placeholder-machine.jpg' && (
                <div className="px-8 pb-6">
                  <div className="max-w-3xl mx-auto bg-gray-100 rounded-xl overflow-hidden p-4">
                    <MediaImage
                      src={imageUrl}
                      alt={`${solutionName} solution`}
                      width={800}
                      height={600}
                      sizes="(max-width: 768px) 100vw, 768px"
                      className="w-full h-auto object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Marketing Copy - Full Width Top Section */}
              <div className="px-8 pb-6">
                <div className="space-y-6">
                  {cards.map((card, index) => {
                    const problemCopy = replacePlaceholders(card.resolved_card_copy, {
                      brand: machineData.brand,
                      model: machineData.model,
                      display_name: machineData.display_name,
                      type: undefined
                    });

                    return (
                      <div
                        key={card.problem_solution_id}
                        className="bg-gradient-to-br from-white to-gray-50 rounded-xl p-6 border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
                      >
                        {cards.length > 1 && (
                          <div className="flex items-center gap-3 mb-4">
                            <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                              {index + 1}
                            </div>
                            <h3 className="text-xl font-bold text-gray-900">{card.title}</h3>
                          </div>
                        )}
                        <SmartCopyRenderer
                          content={problemCopy}
                          problemTitle={card.title}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2 Images in a Row - Before/After Only */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-8 pb-8">

                {/* Before Image */}
                {primaryCard.resolved_before_image_url && (
                  <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                    <div className="bg-red-50 px-4 py-2 border-b border-gray-200">
                      <h4 className="text-sm font-bold text-red-800">Before</h4>
                    </div>
                    <div className="w-full h-80 bg-gray-100 p-4 flex items-center justify-center">
                      <MediaImage
                        src={primaryCard.resolved_before_image_url}
                        alt="Before using solution"
                        width={800}
                        height={600}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}

                {/* After Image */}
                {primaryCard.resolved_after_image_url && (
                  <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                    <div className="bg-green-50 px-4 py-2 border-b border-gray-200">
                      <h4 className="text-sm font-bold text-green-800">After</h4>
                    </div>
                    <div className="w-full h-80 bg-gray-100 p-4 flex items-center justify-center">
                      <MediaImage
                        src={primaryCard.resolved_after_image_url}
                        alt="After using solution"
                        width={800}
                        height={600}
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* CTA Button - Full Width Bottom */}
              <div className="px-8 pb-8">
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
                >
                  {ctaText}
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
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
