/**
 * Campaign Content Configuration
 * Select brand → model → solution → problems for mass campaigns
 * Same workflow as company marketing page
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface Machine {
  machine_id: string;
  slug: string;
  brand: string;
  model: string;
  display_name: string;
}

interface Solution {
  solution_id: string;
  name: string;
}

interface ProblemCard {
  problem_solution_id: string;
  problem_name: string;
  solution_name: string;
  title: string;
  card_copy: string;
}

export default function ConfigureCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Data
  const [allMachines, setAllMachines] = useState<Machine[]>([]);
  const [machinesFiltered, setMachinesFiltered] = useState<Machine[]>([]);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [problemCards, setProblemCards] = useState<ProblemCard[]>([]);

  // Cascading selections
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedSolution, setSelectedSolution] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());

  // Campaign details
  const [campaignKey, setCampaignKey] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');

  // Load machines on mount
  useEffect(() => {
    loadMachines();
  }, []);

  // Filter machines by brand
  useEffect(() => {
    if (selectedBrand) {
      setMachinesFiltered(allMachines.filter(m => m.brand === selectedBrand));
    } else {
      setMachinesFiltered([]);
    }
    setSelectedMachine('');
    setSelectedSolution('');
  }, [selectedBrand, allMachines]);

  // Load solutions when machine selected
  useEffect(() => {
    if (selectedMachine) {
      loadSolutions(selectedMachine);
    } else {
      setSolutions([]);
      setSelectedSolution('');
    }
  }, [selectedMachine]);

  // Load problem cards when solution selected
  useEffect(() => {
    if (!selectedSolution || !selectedMachine) {
      setProblemCards([]);
      return;
    }
    loadProblemsForSolution();
  }, [selectedSolution, selectedMachine]);

  const loadMachines = async () => {
    try {
      const res = await fetch('/api/machines/all');
      const data = await res.json();
      setAllMachines(data.machines || []);
    } catch (err) {
      console.error('Error loading machines:', err);
    }
  };

  const loadSolutions = async (machineId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/copy/solutions?machine_id=${machineId}`);
      const data = await res.json();
      setSolutions(data.solutions || []);
    } catch (err) {
      console.error('Error loading solutions:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadProblemsForSolution = async () => {
    setLoading(true);
    try {
      const machine = allMachines.find(m => m.machine_id === selectedMachine);
      if (!machine?.slug) return;

      // Get all problem cards for this machine
      const res = await fetch(`/api/machines/solutions?slug=${machine.slug}`);
      const data = await res.json();

      // Get solution name
      const solution = solutions.find(s => s.solution_id === selectedSolution);

      // Filter cards that match this solution
      const cardsForSolution = (data.problemCards || []).filter(
        (card: ProblemCard) => card.solution_name === solution?.name
      );

      setProblemCards(cardsForSolution);
    } catch (err) {
      console.error('Error loading problems:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleProblem = (problemId: string) => {
    const newSelected = new Set(selectedProblems);
    if (newSelected.has(problemId)) {
      newSelected.delete(problemId);
    } else {
      newSelected.add(problemId);
    }
    setSelectedProblems(newSelected);
  };

  const handleSaveAndContinue = async () => {
    if (!campaignKey || !campaignName || !selectedMachine || selectedProblems.size === 0) {
      alert('Please fill in all required fields and select at least one problem');
      return;
    }

    setSaving(true);
    try {
      const machine = allMachines.find(m => m.machine_id === selectedMachine);

      // Save campaign configuration
      const res = await fetch('/api/admin/campaigns/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_key: campaignKey,
          campaign_name: campaignName,
          subject,
          machine_slug: machine?.slug,
          problem_solution_ids: Array.from(selectedProblems),
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Redirect to send page with campaign key
        router.push(`/admin/campaigns/send?campaign_key=${campaignKey}`);
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (err) {
      console.error('Error saving campaign:', err);
      alert('Failed to save campaign');
    } finally {
      setSaving(false);
    }
  };

  // Get unique brands
  const brands = [...new Set(allMachines.map(m => m.brand))].sort();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configure Marketing Campaign</h1>
            <p className="mt-2 text-gray-600">
              Select brand → model → solution → problems to send the SAME content to thousands
            </p>
          </div>
          <Link
            href="/admin/campaigns"
            className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-50 font-medium"
          >
            ← Cancel
          </Link>
        </div>

        {/* Campaign Details */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Campaign Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Key *
              </label>
              <input
                type="text"
                value={campaignKey}
                onChange={e => setCampaignKey(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="spring_2025_heidelberg"
                pattern="[a-z0-9_-]+"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campaign Name *
              </label>
              <input
                type="text"
                value={campaignName}
                onChange={e => setCampaignName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Spring 2025 - Heidelberg Solutions"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={e => setSubject(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Solutions for your machine"
              />
            </div>
          </div>
        </div>

        {/* Cascading Selection: Brand → Model → Solution */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Marketing Content</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1: Brand */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">1. Brand *</label>
              <select
                value={selectedBrand}
                onChange={e => setSelectedBrand(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select brand...</option>
                {brands.map(brand => (
                  <option key={brand} value={brand}>{brand}</option>
                ))}
              </select>
            </div>

            {/* Step 2: Model */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">2. Model *</label>
              <select
                value={selectedMachine}
                onChange={e => {
                  setSelectedMachine(e.target.value);
                  setSelectedProblems(new Set());
                }}
                disabled={!selectedBrand}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              >
                <option value="">Select model...</option>
                {machinesFiltered.map(m => (
                  <option key={m.machine_id} value={m.machine_id}>{m.display_name}</option>
                ))}
              </select>
            </div>

            {/* Step 3: Solution */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">3. Solution *</label>
              <select
                value={selectedSolution}
                onChange={e => setSelectedSolution(e.target.value)}
                disabled={!selectedMachine}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
              >
                <option value="">Select solution...</option>
                {solutions.map(s => (
                  <option key={s.solution_id} value={s.solution_id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Step 4: Select Problems */}
        {problemCards.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                4. Select Problems to Include ({selectedProblems.size} selected)
              </h2>
              <p className="text-sm text-gray-600">
                Products are mentioned in the copy - quote building happens after they request
              </p>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading problems...</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {problemCards.map(ps => (
                  <div
                    key={ps.problem_solution_id}
                    onClick={() => handleToggleProblem(ps.problem_solution_id)}
                    className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedProblems.has(ps.problem_solution_id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={selectedProblems.has(ps.problem_solution_id)}
                        onChange={() => {}}
                        className="mt-1 w-5 h-5 text-blue-600"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{ps.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{ps.card_copy}</p>
                        <span className="inline-block mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                          {ps.solution_name}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleSaveAndContinue}
            disabled={saving || !campaignKey || !selectedMachine || selectedProblems.size === 0}
            className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {saving ? 'Saving...' : `Save & Continue to Audience Selection →`}
          </button>
        </div>
      </div>
    </div>
  );
}
