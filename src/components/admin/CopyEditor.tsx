/**
 * Copy Editor Component
 * Cascading selects + dual markdown editors + SKU curation
 */

'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

interface Machine {
  machine_id: string;
  brand: string;
  model: string;
  display_name: string;
  slug: string;
}

interface CopyEditorProps {
  machines: Machine[];
}

export default function CopyEditor({ machines }: CopyEditorProps) {
  // Cascading state
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedSolution, setSelectedSolution] = useState('');
  const [selectedProblem, setSelectedProblem] = useState('');

  // Data lists
  const [machinesFiltered, setMachinesFiltered] = useState<Machine[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);

  // Copy editing
  const [baseCopy, setBaseCopy] = useState('');
  const [overrideCopy, setOverrideCopy] = useState('');
  const [curatedSkus, setCuratedSkus] = useState<string[]>([]);
  const [availableSkus, setAvailableSkus] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [mspId, setMspId] = useState<string | null>(null);

  // Get unique brands
  const brands = [...new Set(machines.map(m => m.brand))].sort();

  // Filter machines by brand
  useEffect(() => {
    if (selectedBrand) {
      setMachinesFiltered(machines.filter(m => m.brand === selectedBrand));
    } else {
      setMachinesFiltered([]);
    }
    setSelectedMachine('');
    setSelectedSolution('');
    setSelectedProblem('');
  }, [selectedBrand, machines]);

  // Fetch solutions for selected machine
  useEffect(() => {
    if (!selectedMachine) {
      setSolutions([]);
      setSelectedSolution('');
      setSelectedProblem('');
      return;
    }

    async function fetchSolutions() {
      try {
        const response = await fetch(`/api/admin/copy/solutions?machine_id=${selectedMachine}`);
        const data = await response.json();
        setSolutions(data.solutions || []);
      } catch (error) {
        console.error('Failed to fetch solutions:', error);
      }
    }

    fetchSolutions();
  }, [selectedMachine]);

  // Fetch problems for selected solution
  useEffect(() => {
    if (!selectedSolution || !selectedMachine) {
      setProblems([]);
      setSelectedProblem('');
      return;
    }

    async function fetchProblems() {
      try {
        const response = await fetch(
          `/api/admin/copy/problems?machine_id=${selectedMachine}&solution_id=${selectedSolution}`
        );
        const data = await response.json();
        setProblems(data.problems || []);
      } catch (error) {
        console.error('Failed to fetch problems:', error);
      }
    }

    fetchProblems();
  }, [selectedMachine, selectedSolution]);

  // Load copy when problem selected
  useEffect(() => {
    if (!selectedProblem || !selectedMachine || !selectedSolution) {
      setBaseCopy('');
      setOverrideCopy('');
      setCuratedSkus([]);
      setMspId(null);
      return;
    }

    async function loadCopy() {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/admin/copy/load?machine_id=${selectedMachine}&solution_id=${selectedSolution}&problem_id=${selectedProblem}`
        );
        const data = await response.json();

        setBaseCopy(data.baseCopy || '');
        setOverrideCopy(data.overrideCopy || '');
        setCuratedSkus(data.curatedSkus || []);
        setMspId(data.mspId);
        setAvailableSkus(data.availableSkus || []);
      } catch (error) {
        console.error('Failed to load copy:', error);
      } finally {
        setLoading(false);
      }
    }

    loadCopy();
  }, [selectedProblem, selectedMachine, selectedSolution]);

  const handleSave = async () => {
    if (!mspId) {
      alert('Please select a machine/solution/problem combination first');
      return;
    }

    setSaving(true);
    try {
      const response = await fetch('/api/admin/copy/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          msp_id: mspId,
          override_copy: overrideCopy,
          curated_skus: curatedSkus
        })
      });

      if (!response.ok) throw new Error('Save failed');

      alert('Copy and SKUs saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      alert('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const toggleSku = (skuCode: string) => {
    setCuratedSkus(prev =>
      prev.includes(skuCode)
        ? prev.filter(s => s !== skuCode)
        : [...prev, skuCode]
    );
  };

  const resolvedCopy = overrideCopy || baseCopy;

  return (
    <div className="space-y-6">
      {/* Cascading Selects */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            >
              <option value="">Select brand...</option>
              {brands.map(brand => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Model</label>
            <select
              value={selectedMachine}
              onChange={(e) => setSelectedMachine(e.target.value)}
              disabled={!selectedBrand}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            >
              <option value="">Select model...</option>
              {machinesFiltered.map(m => (
                <option key={m.machine_id} value={m.machine_id}>{m.display_name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Solution</label>
            <select
              value={selectedSolution}
              onChange={(e) => setSelectedSolution(e.target.value)}
              disabled={!selectedMachine}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            >
              <option value="">Select solution...</option>
              {solutions.map(s => (
                <option key={s.solution_id} value={s.solution_id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Problem</label>
            <select
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(e.target.value)}
              disabled={!selectedSolution}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
            >
              <option value="">Select problem...</option>
              {problems.map(p => (
                <option key={p.problem_id} value={p.problem_id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-12 text-gray-500">Loading copy...</div>}

      {!loading && selectedProblem && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Base Copy Editor */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Base Copy (solution_problem)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This copy applies to all machines for this solution/problem pair
            </p>
            <textarea
              value={baseCopy}
              readOnly
              rows={12}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm font-mono"
            />
            <p className="text-xs text-gray-500 mt-2">
              Read-only. Edit in database directly if needed.
            </p>
          </div>

          {/* Override Copy Editor */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Override Copy (machine_solution_problem)
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Machine-specific copy override (takes precedence)
            </p>
            <textarea
              value={overrideCopy}
              onChange={(e) => setOverrideCopy(e.target.value)}
              rows={12}
              placeholder="Leave empty to use base copy..."
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              Markdown supported. Leave empty to use base copy.
            </p>
          </div>
        </div>
      )}

      {!loading && selectedProblem && (
        <>
          {/* SKU Curation */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Curated SKUs for this Machine/Solution/Problem
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select SKUs to show in the Setup Guide. If none selected, all compatible SKUs will show.
            </p>

            <div className="grid md:grid-cols-3 gap-3 max-h-64 overflow-y-auto">
              {availableSkus.map((sku) => (
                <label
                  key={sku.code}
                  className={`flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer transition-colors ${
                    curatedSkus.includes(sku.code)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={curatedSkus.includes(sku.code)}
                    onChange={() => toggleSku(sku.code)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-sm font-bold text-gray-900">{sku.code}</div>
                    <div className="text-xs text-gray-600 truncate">{sku.name}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="mt-4 text-sm text-gray-600">
              {curatedSkus.length} SKU{curatedSkus.length !== 1 ? 's' : ''} selected
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Preview</h3>

            <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
              <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold mb-4">
                Solution Badge
              </div>
              <div className="prose max-w-none">
                <ReactMarkdown>{resolvedCopy || 'No copy to preview'}</ReactMarkdown>
              </div>
            </div>

            {curatedSkus.length > 0 && (
              <div className="mt-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                <div className="text-sm font-bold text-gray-900 mb-2">Setup Guide Will Show:</div>
                <div className="text-sm text-gray-700">
                  {curatedSkus.join(', ')}
                </div>
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {saving ? 'Saving...' : 'Save Copy & SKUs'}
            </button>
          </div>
        </>
      )}

      {!selectedProblem && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
          <p className="text-gray-500">Select a machine/solution/problem combination to edit copy</p>
        </div>
      )}
    </div>
  );
}
