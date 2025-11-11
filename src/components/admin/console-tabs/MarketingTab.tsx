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
          <div className="bg-white border border-gray-200 rounded-xl p-8">
            <h3 className="text-sm font-semibold text-gray-500 mb-6 uppercase tracking-wide">Marketing Preview</h3>

            {/* Clean editorial-style layout */}
            <div className="max-w-4xl mx-auto">
              {/* Title */}
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                {solution?.name}
              </h1>

              {/* Product Image - hero style */}
              {primaryCard.resolved_product_image_url && (
                <div className="my-12 bg-gray-50 rounded-lg p-8">
                  <div className="relative h-96 w-full">
                    <MediaImage
                      src={primaryCard.resolved_product_image_url}
                      alt="Product"
                      fill
                      sizes="800px"
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

              {/* Marketing Copy - ALL problems shown */}
              {problemCards.map((card: any) => {
                const cardCopy = replacePlaceholders(
                  card.resolved_full_copy || card.resolved_card_copy || '',
                  {
                    brand: selectedMachineData?.brand,
                    model: selectedMachineData?.model,
                    display_name: selectedMachineData?.display_name,
                    type: selectedMachineData?.type
                  },
                  companyName
                );

                return (
                  <div key={card.problem_solution_id} className="mb-12">
                    {problemCards.length > 1 && (
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">{card.title}</h2>
                    )}
                    <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
                      <ReactMarkdown>{cardCopy}</ReactMarkdown>
                    </div>
                  </div>
                );
              })}

              {/* Before/After Comparison - clean side by side */}
              {(primaryCard.resolved_before_image_url || primaryCard.resolved_after_image_url) && (
                <div className="my-12">
                  <div className="grid md:grid-cols-2 gap-8">
                    {primaryCard.resolved_before_image_url && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">Before</h3>
                        <div className="relative h-64 w-full bg-gray-100 rounded-lg overflow-hidden">
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
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3">After</h3>
                        <div className="relative h-64 w-full bg-gray-100 rounded-lg overflow-hidden">
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

              {/* Setup Guide */}
              {primaryCard.curated_skus && primaryCard.curated_skus.length > 0 && (
                <div className="mt-12 pt-12 border-t border-gray-200">
                  <SetupGuide
                    curatedSkus={primaryCard.curated_skus}
                    machineId={selectedMachine}
                    machineName={selectedMachineData?.display_name}
                  />
                </div>
              )}
            </div>
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
