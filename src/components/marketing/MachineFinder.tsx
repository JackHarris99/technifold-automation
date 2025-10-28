/**
 * Machine Finder Component
 * Allows users to select their machine and see solutions/problems inline
 */

'use client';

import { useState, useEffect } from 'react';

interface Machine {
  machine_id: string;
  brand: string;
  model: string;
  display_name: string;
  slug: string;
}

interface Problem {
  problem_id: string;
  problem_title: string;
  pitch_headline: string;
  pitch_detail: string;
  action_cta: string;
}

interface Solution {
  solution_id: string;
  solution_name: string;
  solution_core_benefit: string;
  problems: Problem[];
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
  const [solutions, setSolutions] = useState<Solution[]>([]);
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

    // Otherwise, fetch solutions and display inline
    setLoadingSolutions(true);
    try {
      // Fetch solutions from the view
      const response = await fetch(`/api/machines/solutions?slug=${encodeURIComponent(machine.slug)}`);
      if (!response.ok) throw new Error('Failed to fetch solutions');

      const data = await response.json();
      setSolutions(data.solutions || []);
    } catch (error) {
      console.error('Failed to fetch solutions:', error);
      setSolutions([]);
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

      {/* Solutions Display - shown inline below the finder */}
      {!loadingSolutions && solutions.length > 0 && selectedMachineData && (
        <div className="mt-12 space-y-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Solutions for {selectedMachineData.display_name}
            </h2>
            <p className="text-xl text-blue-100">
              Here's what we can fix on your machine
            </p>
          </div>

          {solutions.map((solution) => (
            <div key={solution.solution_id} className="bg-white rounded-2xl shadow-2xl overflow-hidden">
              {/* Solution Header */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                <h3 className="text-2xl font-bold mb-2">{solution.solution_name}</h3>
                <p className="text-blue-100 text-lg">{solution.solution_core_benefit}</p>
              </div>

              {/* Problems */}
              <div className="p-6 space-y-4">
                {solution.problems.map((problem) => (
                  <div key={problem.problem_id} className="border-l-4 border-blue-600 pl-6 py-4 hover:bg-blue-50 transition-colors rounded-r-lg">
                    <h4 className="text-lg font-bold text-gray-900 mb-2">
                      {problem.pitch_headline}
                    </h4>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {problem.pitch_detail}
                    </p>
                    <a
                      href="/contact"
                      className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                    >
                      {problem.action_cta || 'Get help with this'}
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
