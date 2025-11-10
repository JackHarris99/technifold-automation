/**
 * Marketing Tab - Create machine-specific marketing for ANY machine (not just owned)
 * Cascading: Brand → Model → Solution → Problem
 * Shows preview, select contacts, send
 */

'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import SetupGuide from '../../marketing/SetupGuide';
import MediaImage from '../../shared/MediaImage';
import { replacePlaceholders } from '@/lib/textUtils';

interface MarketingTabProps {
  companyId: string;
  companyName: string;
  machines: any[];
  contacts: any[];
}

export default function MarketingTab({
  companyId,
  companyName,
  machines,
  contacts
}: MarketingTabProps) {
  // Cascading state
  const [allMachines, setAllMachines] = useState<any[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedMachine, setSelectedMachine] = useState('');
  const [selectedSolution, setSelectedSolution] = useState('');

  // Data
  const [machinesFiltered, setMachinesFiltered] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [problemCards, setProblemCards] = useState<any[]>([]);

  // Contact selection
  const [selectedContacts, setSelectedContacts] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);

  // Fetch all machines on mount
  useEffect(() => {
    async function fetchMachines() {
      const response = await fetch('/api/machines/all');
      const data = await response.json();
      setAllMachines(data.machines || []);
    }
    fetchMachines();
  }, []);

  // Get unique brands
  const brands = [...new Set(allMachines.map(m => m.brand))].sort();

  // Filter machines by brand
  useEffect(() => {
    if (selectedBrand) {
      setMachinesFiltered(allMachines.filter(m => m.brand === selectedBrand));
    } else {
      setMachinesFiltered([]);
    }
    setSelectedMachine('');
  }, [selectedBrand, allMachines]);

  // Fetch solutions for machine
  useEffect(() => {
    if (!selectedMachine) {
      setSolutions([]);
      setSelectedSolution('');
      return;
    }

    async function fetchSolutions() {
      const response = await fetch(`/api/admin/copy/solutions?machine_id=${selectedMachine}`);
      const data = await response.json();
      setSolutions(data.solutions || []);
    }
    fetchSolutions();
  }, [selectedMachine]);

  // Load ALL problem cards when solution selected
  useEffect(() => {
    if (!selectedSolution || !selectedMachine) {
      setProblemCards([]);
      return;
    }

    async function loadProblemsForSolution() {
      const machine = allMachines.find(m => m.machine_id === selectedMachine);
      if (!machine?.slug) return;

      // Get all problem cards for this machine
      const response = await fetch(`/api/machines/solutions?slug=${machine.slug}`);
      const data = await response.json();

      // Get solution name from the solutions list
      const solution = solutions.find(s => s.solution_id === selectedSolution);

      // Filter cards that match this solution
      const cardsForSolution = (data.problemCards || []).filter(
        (card: any) => card.solution_name === solution?.name
      );

      setProblemCards(cardsForSolution);
    }
    loadProblemsForSolution();
  }, [selectedSolution, selectedMachine, allMachines, solutions]);

  const handleSend = async () => {
    if (selectedContacts.size === 0) {
      alert('Please select at least one contact');
      return;
    }

    if (!selectedMachine || !selectedSolution || problemCards.length === 0) {
      alert('Please select a machine and solution first');
      return;
    }

    const machine = allMachines.find(m => m.machine_id === selectedMachine);

    // Collect all problem IDs and curated SKUs from all cards
    const allProblemIds = problemCards.map(card => card.problem_solution_id);
    const allCuratedSkus = [...new Set(problemCards.flatMap(card => card.curated_skus || []))];

    setSending(true);
    try {
      const response = await fetch('/api/admin/marketing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_ids: Array.from(selectedContacts),
          machine_slug: machine.slug,
          selected_problem_ids: allProblemIds,
          curated_skus: allCuratedSkus,
          campaign_key: `manual_${new Date().toISOString().split('T')[0]}`,
          offer_key: `solution_${selectedSolution?.substring(0, 15)}`
        })
      });

      if (!response.ok) throw new Error('Failed');

      const result = await response.json();
      alert(`Marketing email queued!\nJob ID: ${result.job_id}`);
    } catch (error) {
      alert('Failed to send');
    } finally {
      setSending(false);
    }
  };

  const toggleContact = (contactId: string) => {
    setSelectedContacts(prev => {
      const next = new Set(prev);
      if (next.has(contactId)) {
        next.delete(contactId);
      } else {
        next.add(contactId);
      }
      return next;
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Marketing Builder</h2>
        <p className="text-gray-600">Create machine-specific marketing for {companyName}</p>
      </div>

      {/* Cascading Selects */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h3 className="font-bold text-gray-900 mb-4">Select What to Market</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Brand</label>
            <select
              value={selectedBrand}
              onChange={(e) => setSelectedBrand(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg"
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
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
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
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
            >
              <option value="">Select solution...</option>
              {solutions.map(s => (
                <option key={s.solution_id} value={s.solution_id}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preview */}
      {problemCards.length > 0 && (() => {
        const selectedMachineData = allMachines.find(m => m.machine_id === selectedMachine);
        const solution = solutions.find(s => s.solution_id === selectedSolution);
        const primaryCard = problemCards.find((c: any) => c.is_primary_pitch) || problemCards[0];

        // Replace placeholders in primary card
        const personalizedCopy = replacePlaceholders(
          primaryCard.resolved_full_copy || primaryCard.resolved_card_copy || '',
          {
            brand: selectedMachineData?.brand,
            model: selectedMachineData?.model,
            display_name: selectedMachineData?.display_name,
            type: selectedMachineData?.type
          },
          companyName
        );

        return (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="font-bold text-gray-900 mb-6">Marketing Preview - What Customer Will See</h3>

            {/* Hero Preview */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8 mb-6 text-center">
              <h4 className="text-3xl font-bold mb-2">
                Solutions for {companyName}
              </h4>
              <p className="text-blue-100 text-lg">
                Personalized for {selectedMachineData?.display_name}
              </p>
            </div>

            {/* Solution Card Preview */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              <div className="p-8">
                {/* Solution Badge */}
                <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                  {solution?.name}
                </div>

                {/* Problems this solution solves */}
                {problemCards.length > 1 && (
                  <div className="mb-6 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
                    <h4 className="font-bold text-green-900 mb-3">
                      Solves {problemCards.length} Problems:
                    </h4>
                    <ul className="space-y-2">
                      {problemCards.map((card: any) => (
                        <li key={card.problem_solution_id} className="flex items-start gap-3">
                          <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span className="text-green-900">{card.title}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Marketing Copy */}
                <div className="prose prose-lg max-w-none mb-8">
                  <ReactMarkdown>{personalizedCopy}</ReactMarkdown>
                </div>

                {/* Before/After Images Side by Side */}
                {(primaryCard.resolved_before_image_url || primaryCard.resolved_after_image_url) && (
                  <div className="mb-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">See The Difference</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      {primaryCard.resolved_before_image_url && (
                        <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                          <div className="bg-red-50 px-4 py-2 border-b-2 border-red-200">
                            <h4 className="font-bold text-red-800 text-sm">Before</h4>
                          </div>
                          <div className="relative h-48 w-full bg-gray-50">
                            <MediaImage
                              src={primaryCard.resolved_before_image_url}
                              alt="Before"
                              fill
                              sizes="400px"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}

                      {primaryCard.resolved_after_image_url && (
                        <div className="bg-white rounded-lg border-2 border-green-200 overflow-hidden">
                          <div className="bg-green-50 px-4 py-2 border-b-2 border-green-200">
                            <h4 className="font-bold text-green-800 text-sm">After</h4>
                          </div>
                          <div className="relative h-48 w-full bg-gray-50">
                            <MediaImage
                              src={primaryCard.resolved_after_image_url}
                              alt="After"
                              fill
                              sizes="400px"
                              className="object-cover"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Product Image */}
                {primaryCard.resolved_product_image_url && (
                  <div className="mb-8 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">The Solution</h3>
                    <div className="relative h-64 w-full bg-white rounded-lg p-6">
                      <MediaImage
                        src={primaryCard.resolved_product_image_url}
                        alt="Product"
                        fill
                        sizes="600px"
                        className="object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Setup Guide if curated SKUs exist */}
            {primaryCard.curated_skus && primaryCard.curated_skus.length > 0 && (
              <SetupGuide
                curatedSkus={primaryCard.curated_skus}
                machineId={selectedMachine}
                machineName={selectedMachineData?.display_name}
              />
            )}
          </div>
        );
      })()}

      {/* Contact Selection */}
      {problemCards.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Select Contacts to Send To</h3>

          {contacts.length === 0 ? (
            <p className="text-gray-500">No contacts available</p>
          ) : (
            <div className="space-y-2">
              {contacts.map((contact: any) => (
                <label
                  key={contact.contact_id}
                  className={`flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedContacts.has(contact.contact_id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedContacts.has(contact.contact_id)}
                    onChange={() => toggleContact(contact.contact_id)}
                    disabled={contact.marketing_status === 'unsubscribed'}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">
                      {contact.full_name || `${contact.first_name} ${contact.last_name}`}
                    </div>
                    <div className="text-sm text-gray-600">{contact.email}</div>
                  </div>
                  {contact.marketing_status === 'unsubscribed' && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">Unsubscribed</span>
                  )}
                </label>
              ))}
            </div>
          )}

          <div className="flex justify-end mt-6">
            <button
              onClick={handleSend}
              disabled={sending || selectedContacts.size === 0 || problemCards.length === 0}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {sending ? 'Sending...' : `Send to ${selectedContacts.size} Contact(s)`}
            </button>
          </div>
        </div>
      )}

      {problemCards.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          Select a brand, model, and solution to preview marketing content
        </div>
      )}
    </div>
  );
}
