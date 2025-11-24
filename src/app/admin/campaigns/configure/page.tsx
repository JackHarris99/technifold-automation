/**
 * Campaign Content Configuration
 * Select machine, problems/solutions, and products for mass campaigns
 * Then send to thousands with the SAME curated content
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

interface ProblemSolution {
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
  const [machines, setMachines] = useState<Machine[]>([]);
  const [problemSolutions, setProblemSolutions] = useState<ProblemSolution[]>([]);

  // Selections
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedProblems, setSelectedProblems] = useState<Set<string>>(new Set());

  // Campaign details
  const [campaignKey, setCampaignKey] = useState('');
  const [campaignName, setCampaignName] = useState('');
  const [subject, setSubject] = useState('');

  // Load machines
  useEffect(() => {
    loadMachines();
  }, []);

  // Load problems when machine selected
  useEffect(() => {
    if (selectedMachine) {
      loadProblemSolutions(selectedMachine);
    }
  }, [selectedMachine]);

  const loadMachines = async () => {
    try {
      const res = await fetch('/api/machines/all');
      const data = await res.json();
      setMachines(data.machines || []);
    } catch (err) {
      console.error('Error loading machines:', err);
    }
  };

  const loadProblemSolutions = async (machineSlug: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/machines/solutions?slug=${machineSlug}`);
      const data = await res.json();
      setProblemSolutions(data.solutions || []);
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
      alert('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // Save campaign configuration
      const res = await fetch('/api/admin/campaigns/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaign_key: campaignKey,
          campaign_name: campaignName,
          subject,
          machine_slug: selectedMachine,
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

  const handlePreview = () => {
    // Generate preview token and open in new tab
    if (!selectedMachine) {
      alert('Please select a machine first');
      return;
    }
    // For now, just show alert - we'll implement preview later
    alert('Preview will open a sample /m/[token] page with your configured content');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Configure Marketing Campaign</h1>
            <p className="mt-2 text-gray-600">
              Select machine, problems, and products - send the SAME content to thousands
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
          <h2 className="text-xl font-bold text-gray-900 mb-4">📋 Campaign Details</h2>

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
                placeholder="Solutions for your Heidelberg"
              />
            </div>
          </div>
        </div>

        {/* Step 1: Select Machine */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🔧 Step 1: Select Machine *</h2>

          <select
            value={selectedMachine}
            onChange={e => {
              setSelectedMachine(e.target.value);
              setSelectedProblems(new Set());
              setSelectedProducts(new Set());
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="">Choose a machine...</option>
            {machines.map(m => (
              <option key={m.machine_id} value={m.slug}>
                {m.brand} {m.model}
              </option>
            ))}
          </select>
        </div>

        {/* Step 2: Select Problems/Solutions */}
        {selectedMachine && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                ⚠️ Step 2: Select Problems/Solutions * ({selectedProblems.size} selected)
              </h2>
              <p className="text-sm text-gray-600">
                Products are mentioned in the copy - quote building happens after they request
              </p>
            </div>

            {loading ? (
              <p className="text-gray-500">Loading problems...</p>
            ) : problemSolutions.length === 0 ? (
              <p className="text-gray-500">No problems found for this machine</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {problemSolutions.map(ps => (
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
            onClick={handlePreview}
            disabled={!selectedMachine}
            className="border-2 border-blue-600 text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            👀 Preview Marketing Page
          </button>

          <button
            onClick={handleSaveAndContinue}
            disabled={saving || !campaignKey || !selectedMachine || selectedProblems.size === 0}
            className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {saving ? 'Saving...' : `✅ Save & Continue to Audience Selection →`}
          </button>
        </div>
      </div>
    </div>
  );
}
