/**
 * Client wrapper for machine page - handles CaptureModal state
 */

'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CaptureModal from './CaptureModal';
import MediaImage from '@/components/shared/MediaImage';

interface Problem {
  problem_solution_id: string;
  solution_name: string;
  title: string;
  resolved_card_copy: string;
  resolved_cta: string;
  resolved_image_url?: string;
}

interface MachinePageClientProps {
  machineData: {
    machine_id: string;
    brand: string;
    model: string;
    display_name: string;
  };
  problemCards: Problem[];
}

export default function MachinePageClient({
  machineData,
  problemCards
}: MachinePageClientProps) {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <div className="grid gap-6 mb-16">
        {problemCards.map((card: any) => {
          const imageUrl = card.resolved_image_url || '/placeholder-machine.jpg';

          return (
            <div key={card.problem_solution_id} className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden hover:border-blue-500 hover:shadow-xl transition-all">
              {/* Image */}
              <div className="relative h-64 w-full bg-gray-100">
                <MediaImage
                  src={imageUrl}
                  alt={`${card.solution_name} - ${card.title}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
              </div>

              {/* Content */}
              <div className="p-8">
                {/* Solution Badge */}
                <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {card.solution_name}
                </div>

                {/* Copy */}
                <div className="prose prose-lg max-w-none mb-6">
                  <ReactMarkdown>{card.resolved_card_copy}</ReactMarkdown>
                </div>

                {/* CTA Button */}
                <button
                  onClick={() => setModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors"
                >
                  {card.resolved_cta || `See how this works on your ${machineData.brand} ${machineData.model}`}
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
