/**
 * Smart Offer Modal
 * Intelligent modal for requesting personalized offers
 * Pre-fills based on context (page, tags, email click)
 * Used across website, emails, and admin
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Machine {
  machine_id: string;
  slug: string;
  display_name: string;
  brand: string;
  model: string;
  type: string;
}

interface Problem {
  problem_slug: string;
  problem_name: string;
  machine_types: string[];
}

interface SmartOfferModalProps {
  isOpen: boolean;
  onClose: () => void;

  // Pre-fill context
  suggestedMachineId?: string;
  suggestedProblem?: string;
  source?: 'website' | 'email' | 'admin' | 'sales_rep';
  sourceUrl?: string;
  sourceCampaignId?: string;
  sourceTemplateId?: string;
  token?: string;

  // Pre-filled contact info (if known)
  prefillEmail?: string;
  prefillName?: string;
  prefillCompany?: string;
  prefillPhone?: string;

  // Callbacks
  onSuccess?: (data: { offer_intent_id: string; offer_url: string }) => void;
}

export default function SmartOfferModal({
  isOpen,
  onClose,
  suggestedMachineId,
  suggestedProblem,
  source = 'website',
  sourceUrl,
  sourceCampaignId,
  sourceTemplateId,
  token,
  prefillEmail,
  prefillName,
  prefillCompany,
  prefillPhone,
  onSuccess,
}: SmartOfferModalProps) {
  const router = useRouter();

  // Form state
  const [email, setEmail] = useState(prefillEmail || '');
  const [fullName, setFullName] = useState(prefillName || '');
  const [companyName, setCompanyName] = useState(prefillCompany || '');
  const [phone, setPhone] = useState(prefillPhone || '');

  const [selectedMachines, setSelectedMachines] = useState<Machine[]>([]);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(suggestedProblem || null);

  const [machineSearchQuery, setMachineSearchQuery] = useState('');
  const [machineSearchResults, setMachineSearchResults] = useState<Machine[]>([]);
  const [isSearchingMachines, setIsSearchingMachines] = useState(false);

  const [availableProblems, setAvailableProblems] = useState<Problem[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  // Load suggested machine on open
  useEffect(() => {
    if (isOpen && suggestedMachineId && selectedMachines.length === 0) {
      loadSuggestedMachine(suggestedMachineId);
    }
  }, [isOpen, suggestedMachineId]);

  // Load suggested machine details
  const loadSuggestedMachine = async (machineId: string) => {
    try {
      const response = await fetch(`/api/machines/${machineId}`);
      if (response.ok) {
        const machine = await response.json();
        setSelectedMachines([machine]);
      }
    } catch (err) {
      console.error('Failed to load suggested machine:', err);
    }
  };

  // Search machines as user types
  useEffect(() => {
    if (machineSearchQuery.length < 2) {
      setMachineSearchResults([]);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsSearchingMachines(true);
      try {
        const response = await fetch(`/api/machines/search?q=${encodeURIComponent(machineSearchQuery)}`);
        if (response.ok) {
          const data = await response.json();
          setMachineSearchResults(data.results || []);
        }
      } catch (err) {
        console.error('Machine search error:', err);
      } finally {
        setIsSearchingMachines(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [machineSearchQuery]);

  // Load available problems when machines selected
  useEffect(() => {
    if (selectedMachines.length > 0) {
      loadAvailableProblems();
    }
  }, [selectedMachines]);

  const loadAvailableProblems = async () => {
    // Get machine types from selected machines
    const machineTypes = [...new Set(selectedMachines.map(m => m.type))];

    try {
      const response = await fetch(`/api/marketing/problems?types=${machineTypes.join(',')}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableProblems(data.problems || []);
      }
    } catch (err) {
      console.error('Failed to load problems:', err);
    }
  };

  const handleAddMachine = (machine: Machine) => {
    if (!selectedMachines.find(m => m.machine_id === machine.machine_id)) {
      setSelectedMachines([...selectedMachines, machine]);
      setMachineSearchQuery('');
      setMachineSearchResults([]);
    }
  };

  const handleRemoveMachine = (machineId: string) => {
    setSelectedMachines(selectedMachines.filter(m => m.machine_id !== machineId));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validation
      if (!email || !fullName) {
        throw new Error('Email and name are required');
      }

      if (selectedMachines.length === 0) {
        throw new Error('Please select at least one machine');
      }

      // Submit request
      const response = await fetch('/api/offers/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          full_name: fullName,
          company_name: companyName,
          phone,
          machine_ids: selectedMachines.map(m => m.machine_id),
          problem_slug: selectedProblem,
          source,
          source_url: sourceUrl,
          source_campaign_id: sourceCampaignId,
          source_template_id: sourceTemplateId,
          token,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit request');
      }

      // Success!
      setShowSuccess(true);

      if (onSuccess) {
        onSuccess({
          offer_intent_id: data.offer_intent_id,
          offer_url: data.offer_url,
        });
      }

      // Close modal after 2 seconds
      setTimeout(() => {
        onClose();
        // Optionally redirect to offer page
        // router.push(data.offer_url);
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-teal-600 text-white p-6 rounded-t-xl relative">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 text-white hover:text-gray-200 transition-colors disabled:opacity-50"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-bold mb-2">Get Your Custom Offer</h2>
          <p className="text-blue-100 text-sm">We'll send you a personalized solution for your machine</p>
        </div>

        {/* Success State */}
        {showSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Success!</h3>
            <p className="text-gray-700 mb-4">Check your email for your personalized offer.</p>
            <p className="text-sm text-gray-600">We'll send it within the next few minutes.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Error Display */}
            {error && (
              <div className="bg-red-50 border-2 border-red-300 text-red-700 px-4 py-3 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>{error}</p>
              </div>
            )}

            {/* Machine Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Select Your Machine(s) <span className="text-red-600">*</span>
              </label>

              {/* Selected Machines */}
              {selectedMachines.length > 0 && (
                <div className="mb-3 space-y-2">
                  {selectedMachines.map((machine) => (
                    <div
                      key={machine.machine_id}
                      className="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg px-4 py-2"
                    >
                      <div>
                        <div className="font-semibold text-gray-900">{machine.display_name}</div>
                        <div className="text-xs text-gray-600">{machine.brand} • {machine.type}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveMachine(machine.machine_id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Machine Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for your machine (brand or model)..."
                  value={machineSearchQuery}
                  onChange={(e) => setMachineSearchQuery(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />

                {/* Search Results */}
                {machineSearchResults.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {machineSearchResults.map((machine) => (
                      <button
                        key={machine.machine_id}
                        type="button"
                        onClick={() => handleAddMachine(machine)}
                        className="w-full text-left px-4 py-3 hover:bg-gray-50 border-b border-gray-100 last:border-0"
                      >
                        <div className="font-semibold text-gray-900">{machine.display_name}</div>
                        <div className="text-xs text-gray-600">{machine.brand} {machine.model}</div>
                      </button>
                    ))}
                  </div>
                )}

                {isSearchingMachines && (
                  <div className="absolute right-3 top-3">
                    <div className="animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>

              <p className="text-xs text-gray-600 mt-2">Type at least 2 characters to search</p>
            </div>

            {/* Problem Selection */}
            {availableProblems.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  What problem do you want to solve?
                </label>
                <select
                  value={selectedProblem || ''}
                  onChange={(e) => setSelectedProblem(e.target.value || null)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">General solution</option>
                  {availableProblems.map((problem) => (
                    <option key={problem.problem_slug} value={problem.problem_slug}>
                      {problem.problem_name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Contact Information */}
            <div className="space-y-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">Your Contact Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="john@printshop.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ABC Printing Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+44 123 456 7890"
                  />
                </div>
              </div>
            </div>

            {/* Offer Preview */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-green-900 mb-2">Your offer will include:</h4>
              <ul className="space-y-1 text-sm text-green-800">
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  30-day free trial - risk free
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  Money-back guarantee
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  Proven case studies & video demos
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-600 font-bold">✓</span>
                  Machine-specific pricing
                </li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || selectedMachines.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-600 text-white rounded-lg hover:from-blue-700 hover:to-teal-700 font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                    Sending...
                  </span>
                ) : (
                  'Send My Offer →'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
