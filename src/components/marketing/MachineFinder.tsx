/**
 * Machine Finder Component
 * Allows users to select their machine and see solutions/problems
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

interface MachineFinderProps {
  onMachineSelect?: (slug: string) => void;
}

export default function MachineFinder({ onMachineSelect }: MachineFinderProps) {
  const [brands, setBrands] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [machines, setMachines] = useState<Machine[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string>('');
  const [loading, setLoading] = useState(false);

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

  // Handle machine selection
  const handleMachineSelect = (machineId: string) => {
    const machine = machines.find(m => m.machine_id === machineId);
    if (machine) {
      setSelectedMachine(machineId);
      if (onMachineSelect) {
        onMachineSelect(machine.slug);
      } else {
        // Default behavior: navigate to machine page
        window.location.href = `/machines/${machine.slug}`;
      }
    }
  };

  return (
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

        {selectedMachine && (
          <div className="bg-green-500/20 border border-green-400/50 rounded-xl p-4 text-center">
            <p className="text-white font-semibold">
              ✓ Redirecting to solutions for your machine...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
