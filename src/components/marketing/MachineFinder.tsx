/**
 * Machine Finder Component
 * Allows users to select their machine and see a list of problems with CTA to full page
 */

'use client';

import { useState, useEffect } from 'react';
import { replacePlaceholders } from '@/lib/textUtils';

interface Machine {
  machine_id: string;
  brand: string;
  model: string;
  display_name: string;
  slug: string;
}

interface ProblemCard {
  machine_id: string;
  problem_solution_id: string;
  solution_name: string;
  title: string;
  resolved_card_copy: string;
  resolved_cta: string;
  resolved_image_url?: string;
  curated_skus?: string[];
}

interface MachineFinderProps {
  onMachineSelect?: (slug: string) => void;
}

export default function MachineFinder({ onMachineSelect }: MachineFinderProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [selectedMachineData, setSelectedMachineData] = useState<Machine | null>(null);
  const [problemCards, setProblemCards] = useState<ProblemCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingSolutions, setLoadingSolutions] = useState(false);

  // Fetch brands on mount
  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch('/api/machines/brands');
        const data = await response.json();
        setBrands(data.brands || []);
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      }
    }
    fetchBrands();
  }, []);

  // Fetch machines when brand changes
  useEffect(() => {
    if (!selectedBrand) {
      setMachines([]);
      setSelectedMachine('');
      return;
    }

    async function fetchMachines() {
      setLoading(true);
      try {
        const response = await fetch(`/api/machines/by-brand?brand=${encodeURIComponent(selectedBrand)}`);
        const data = await response.json();
        setMachines(data.machines || []);
      } catch (error) {
        console.error('Failed to fetch machines:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchMachines();
  }, [selectedBrand]);

  // Handle machine selection - fetch and display solutions inline
  const handleMachineSelect = async (machineId: string) => {
    const machine = machines.find(m => m.machine_id === machineId);
    if (!machine) return;

    setSelectedMachine(machineId);
    setSelectedMachineData(machine);

    // If parent provided a callback, use it
    if (onMachineSelect) {
      onMachineSelect(machine.slug);
      return;
    }

    // Otherwise, fetch problem cards and display inline
    setLoadingSolutions(true);
    console.log('[MachineFinder] Fetching solutions for slug:', machine.slug);

    try {
      const response = await fetch(`/api/machines/solutions?slug=${encodeURIComponent(machine.slug)}`);
      console.log('[MachineFinder] API response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[MachineFinder] API error:', errorText);
        throw new Error('Failed to fetch solutions');
      }

      const data = await response.json();
      console.log('[MachineFinder] Received data:', data);
      console.log('[MachineFinder] Problem cards count:', data.problemCards?.length || 0);

      setProblemCards(data.problemCards || []);
    } catch (error) {
      console.error('[MachineFinder] Failed to fetch solutions:', error);
      setProblemCards([]);
    } finally {
      setLoadingSolutions(false);
    }
  };

  return (
    <div>
      <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="text-sm font-semibold text-white">Step 1 of 2</span>
          </div>
        </div>

        <div className="space-y-5">
          {/* Brand dropdown */}
          <div>
            <label htmlFor="brand" className="block text-sm font-bold text-white mb-2">
              1. Select Your Press Brand
            </label>
            <select
              id="brand"
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setSelectedMachine('');
                setProblemCards([]);
                setSelectedMachineData(null);
              }}
              className="w-full px-5 py-4 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-white focus:border-white text-gray-900 text-lg bg-white shadow-lg"
            >
              <option value="">Choose a brand...</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>
          </div>

          {/* Model dropdown */}
          <div>
            <label htmlFor="model" className="block text-sm font-bold text-white mb-2">
              2. Select Your Model
            </label>
            <select
              id="model"
              value={selectedMachine}
              onChange={(e) => handleMachineSelect(e.target.value)}
              disabled={!selectedBrand || loading}
              className="w-full px-5 py-4 border-2 border-white/30 rounded-xl focus:ring-2 focus:ring-white focus:border-white text-gray-900 text-lg bg-white shadow-lg disabled:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">
                {loading ? 'Loading models...' : selectedBrand ? 'Choose a model...' : 'Select a brand first'}
              </option>
              {machines.map((machine) => (
                <option key={machine.machine_id} value={machine.machine_id}>
                  {machine.display_name}
                </option>
              ))}
            </select>
          </div>

          {loadingSolutions && (
            <div className="bg-white/20 border border-white/30 rounded-xl p-4 text-center">
              <p className="text-white font-semibold">Loading solutions...</p>
            </div>
          )}
        </div>
      </div>

      {/* Problem List - Simple view with link to full page */}
      {!loadingSolutions && problemCards.length > 0 && selectedMachineData && (
        <div className="mt-12">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Problems We Can Fix on Your {selectedMachineData.display_name}
              </h2>
              <p className="text-lg text-blue-100">
                {problemCards.length} proven solutions available
              </p>
            </div>

            {/* Problem List */}
            <div className="space-y-3 mb-6">
              {problemCards.map((card, index) => {
                const problemTitle = replacePlaceholders(card.title, {
                  brand: selectedMachineData?.brand,
                  model: selectedMachineData?.model,
                  display_name: selectedMachineData?.display_name,
                  type: selectedMachineData?.type
                });

                return (
                  <div key={`${card.problem_solution_id}-${index}`} className="bg-white/90 rounded-lg p-4 flex items-center gap-3 hover:bg-white transition-colors">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <span className="text-sm font-semibold text-blue-600">{card.solution_name}</span>
                      <p className="text-gray-900 font-medium">{problemTitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Big CTA to machine page */}
            <div className="text-center">
              <a
                href={`/machines/${selectedMachineData.slug}`}
                className="inline-flex items-center gap-3 bg-white text-blue-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors shadow-lg"
              >
                See How We Solve These Problems on {selectedMachineData.brand} {selectedMachineData.model}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
