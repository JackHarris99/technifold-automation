/**
 * Machine Finder Component
 * Allows users to select their machine and see solutions/problems inline
 */

'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import SetupGuide from './SetupGuide';

interface Machine {
  machine_id: string;
  brand: string;
  model: string;
  display_name: string;
  slug: string;
}

interface ProblemCard {
  machine_id: string;
  solution_id: string;
  solution_name: string;
  solution_core_benefit: string;
  solution_long_description: string;
  problem_id: string;
  problem_title: string;
  pitch_headline: string;
  pitch_detail: string;
  action_cta: string;
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
                setSolutions([]);
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

      {/* Problem Cards - ONE CARD PER PROBLEM - shown inline below the finder */}
      {!loadingSolutions && problemCards.length > 0 && selectedMachineData && (
        <div className="mt-12 space-y-6">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Problems We Fix on {selectedMachineData.display_name}
            </h2>
            <p className="text-xl text-blue-100">
              Each of these is a proven retrofit solution
            </p>
          </div>

          {problemCards.map((card) => (
            <div key={`${card.solution_id}-${card.problem_id}`} className="bg-white rounded-2xl shadow-2xl p-8 hover:shadow-3xl transition-all">
              {/* Solution Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {card.solution_name}
              </div>

              {/* Resolved Copy (Markdown) */}
              <div className="prose prose-lg max-w-none mb-6 text-gray-900">
                <ReactMarkdown>{card.resolved_copy}</ReactMarkdown>
              </div>

              {/* CTA */}
              <a
                href="/contact"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center"
              >
                {card.action_cta || `See how this works on your ${selectedMachineData.brand} ${selectedMachineData.model}`}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>
          ))}

          {/* Setup Guide - Once per page */}
          <div className="mt-8">
            <SetupGuide
              curatedSkus={problemCards[0]?.curated_skus}
              machineId={selectedMachineData.machine_id}
              solutionId={problemCards[0]?.solution_id}
              machineName={selectedMachineData.display_name}
            />
          </div>

          {/* Link to full machine page */}
          <div className="text-center mt-8">
            <a
              href={`/machines/${selectedMachineData.slug}`}
              className="inline-flex items-center gap-2 text-white hover:text-blue-100 font-semibold"
            >
              See full details page for {selectedMachineData.display_name}
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
