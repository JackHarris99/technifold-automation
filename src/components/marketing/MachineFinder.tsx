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
    if (machine && onMachineSelect) {
      setSelectedMachine(machineId);
      onMachineSelect(machine.slug);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Find fixes for your machine
      </h2>

      <div className="space-y-4">
        {/* Brand dropdown */}
        <div>
          <label htmlFor="brand" className="block text-sm font-semibold text-gray-700 mb-2">
            Machine Brand
          </label>
          <select
            id="brand"
            value={selectedBrand}
            onChange={(e) => {
              setSelectedBrand(e.target.value);
              setSelectedMachine('');
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
          >
            <option value="">Select a brand...</option>
            {brands.map((brand) => (
              <option key={brand} value={brand}>
                {brand}
              </option>
            ))}
          </select>
        </div>

        {/* Model dropdown */}
        <div>
          <label htmlFor="model" className="block text-sm font-semibold text-gray-700 mb-2">
            Machine Model
          </label>
          <select
            id="model"
            value={selectedMachine}
            onChange={(e) => handleMachineSelect(e.target.value)}
            disabled={!selectedBrand || loading}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">
              {loading ? 'Loading models...' : selectedBrand ? 'Select a model...' : 'Select a brand first'}
            </option>
            {machines.map((machine) => (
              <option key={machine.machine_id} value={machine.machine_id}>
                {machine.display_name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
