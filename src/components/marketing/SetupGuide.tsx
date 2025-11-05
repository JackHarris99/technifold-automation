/**
 * Setup Guide Component
 * Shows curated SKUs or all compatible SKUs for a machine/solution
 * Appears ONCE at bottom of page
 */

'use client';

import { useEffect, useState } from 'react';
import MediaImage from '@/components/shared/MediaImage';

interface Sku {
  code: string;
  name: string;
  description: string | null;
  price: number | null;
  image_url?: string | null;
}

interface SetupGuideProps {
  curatedSkus?: string[] | null;
  machineId?: string;
  problemSolutionId?: string;
  machineName?: string;
  title?: string;
}

export default function SetupGuide({
  curatedSkus,
  machineId,
  problemSolutionId,
  machineName,
  title
}: SetupGuideProps) {
  const [skus, setSkus] = useState<Sku[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSkus() {
      try {
        const params = new URLSearchParams();

        if (curatedSkus && curatedSkus.length > 0) {
          params.set('curated_skus', curatedSkus.join(','));
        } else if (machineId && problemSolutionId) {
          params.set('machine_id', machineId);
          params.set('problem_solution_id', problemSolutionId);
        } else {
          setLoading(false);
          return;
        }

        const response = await fetch(`/api/setup-guide?${params.toString()}`);
        if (!response.ok) throw new Error('Failed to fetch SKUs');

        const data = await response.json();
        setSkus(data.skus || []);
      } catch (error) {
        console.error('Failed to fetch setup guide SKUs:', error);
        setSkus([]);
      } finally {
        setLoading(false);
      }
    }

    fetchSkus();
  }, [curatedSkus, machineId, problemSolutionId]);

  if (loading) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center">
        <p className="text-gray-500">Loading setup guide...</p>
      </div>
    );
  }

  if (skus.length === 0) {
    return null;
  }

  const defaultTitle = machineName
    ? `Setup Guide: Fix this on your ${machineName}`
    : 'Setup Guide';

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-200 rounded-2xl p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            {title || defaultTitle}
          </h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {skus.map((sku) => (
            <div key={sku.code} className="bg-white border border-indigo-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
              {/* Product Image */}
              <div className="relative h-32 w-full bg-gray-100">
                <MediaImage
                  src={sku.image_url}
                  alt={sku.name || sku.code}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                />
              </div>

              {/* Product Details */}
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="font-mono text-sm text-indigo-600 font-bold">{sku.code}</div>
                    <div className="font-semibold text-gray-900">{sku.name}</div>
                  </div>
                  {sku.price && (
                    <div className="text-lg font-bold text-gray-900">
                      £{sku.price.toFixed(2)}
                    </div>
                  )}
                </div>
                {sku.description && (
                  <p className="text-sm text-gray-600 leading-relaxed">
                    {sku.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {curatedSkus && curatedSkus.length > 0 ? (
          <p className="text-sm text-gray-600 mt-6 text-center">
            These are the recommended SKUs for this specific fix
          </p>
        ) : (
          <p className="text-sm text-gray-600 mt-6 text-center">
            All compatible SKUs for this solution
          </p>
        )}
      </div>
    </div>
  );
}
