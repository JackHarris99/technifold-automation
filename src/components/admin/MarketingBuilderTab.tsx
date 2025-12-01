/**
 * Marketing Builder Tab
 * Pick machine, select cards, curate SKUs, preview, send
 */

'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import SetupGuide from '../marketing/SetupGuide';

interface Contact {
  contact_id?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  marketing_status?: string;
}

interface MarketingBuilderTabProps {
  companyId: string;
  companyName: string;
  contacts: Contact[];
}

export default function MarketingBuilderTab({
  companyId,
  companyName,
  contacts
}: MarketingBuilderTabProps) {
  const [machines, setMachines] = useState<any[]>([]);
  const [selectedMachine, setSelectedMachine] = useState('');
  const [problemCards, setProblemCards] = useState<any[]>([]);
  const [selectedCards, setSelectedCards] = useState<Set<string>>(new Set());
  const [curatedSkus, setCuratedSkus] = useState<string[]>([]);
  const [availableSkus, setAvailableSkus] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Fetch company machines
  useEffect(() => {
    async function fetchMachines() {
      try {
        const response = await fetch(`/api/admin/companies/${companyId}/machines`);
        const data = await response.json();
        setMachines(data.machines || []);
      } catch (error) {
        console.error('Failed to fetch machines:', error);
      }
    }

    fetchMachines();
  }, [companyId]);

  // Fetch cards when machine selected
  useEffect(() => {
    if (!selectedMachine) {
      setProblemCards([]);
      setSelectedCards(new Set());
      return;
    }

    async function fetchCards() {
      setLoading(true);
      try {
        const machine = machines.find(m => m.machine_id === selectedMachine);
        if (!machine?.slug) return;

        const response = await fetch(`/api/machines/solutions?slug=${machine.slug}`);
        const data = await response.json();

        setProblemCards(data.problemCards || []);
        // Select all by default
        setSelectedCards(new Set((data.problemCards || []).map((c: any) => c.problem_id)));

        // Collect curated SKUs from first card
        if (data.problemCards && data.problemCards.length > 0) {
          setCuratedSkus(data.problemCards[0].curated_skus || []);
        }
      } catch (error) {
        console.error('Failed to fetch cards:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchCards();
  }, [selectedMachine, machines]);

  // Fetch available SKUs
  useEffect(() => {
    async function fetchSkus() {
      try {
        const response = await fetch('/api/admin/products?limit=500');
        const data = await response.json();
        setAvailableSkus(data.products || []);
      } catch (error) {
        console.error('Failed to fetch SKUs:', error);
      }
    }

    fetchSkus();
  }, []);

  const toggleCard = (problemId: string) => {
    setSelectedCards(prev => {
      const next = new Set(prev);
      if (next.has(problemId)) {
        next.delete(problemId);
      } else {
        next.add(problemId);
      }
      return next;
    });
  };

  const toggleSku = (skuCode: string) => {
    setCuratedSkus(prev =>
      prev.includes(skuCode) ? prev.filter(s => s !== skuCode) : [...prev, skuCode]
    );
  };

  const handleSend = async () => {
    const selectedContacts = contacts.filter(c => c.marketing_status !== 'unsubscribed');

    if (selectedContacts.length === 0) {
      alert('No opted-in contacts available');
      return;
    }

    if (selectedCards.size === 0) {
      alert('Please select at least one card to include');
      return;
    }

    const machine = machines.find(m => m.machine_id === selectedMachine);
    if (!machine) return;

    const confirmed = confirm(
      `Send to ${selectedContacts.length} contact(s) for ${companyName}?\n\n` +
      `${selectedCards.size} card(s) will be included.`
    );

    if (!confirmed) return;

    setSending(true);
    try {
      const response = await fetch('/api/admin/marketing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_ids: selectedContacts.map(c => c.contact_id),
          machine_slug: machine.slug,
          selected_problem_ids: Array.from(selectedCards),
          curated_skus: curatedSkus,
          campaign_key: `manual_${new Date().toISOString().split('T')[0]}`,
          offer_key: `machine_solutions_${machine.slug.substring(0, 20)}`
        })
      });

      if (!response.ok) throw new Error('Failed to send');

      const result = await response.json();
      alert(`Marketing email queued!\nJob ID: ${result.job_id}`);
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to queue email');
    } finally {
      setSending(false);
    }
  };

  const selectedCardsArray = problemCards.filter(c => selectedCards.has(c.problem_id));

  return (
    <div className="space-y-6">
      {/* Machine Selector */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <label className="block text-sm font-bold text-gray-900 mb-3">
          Select Machine
        </label>
        <select
          value={selectedMachine}
          onChange={(e) => setSelectedMachine(e.target.value)}
          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg"
        >
          <option value="">Choose a machine...</option>
          {machines.map(m => (
            <option key={m.machine_id} value={m.machine_id}>
              {m.display_name} {m.confirmed ? '✓' : '(unconfirmed)'}
            </option>
          ))}
        </select>
      </div>

      {loading && <div className="text-center py-12 text-gray-500">Loading cards...</div>}

      {!loading && selectedMachine && (
        <>
          {/* Card Selection */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Include in this Send
            </h3>
            <div className="space-y-3">
              {problemCards.map((card) => (
                <label
                  key={card.problem_id}
                  className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-colors ${
                    selectedCards.has(card.problem_id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedCards.has(card.problem_id)}
                    onChange={() => toggleCard(card.problem_id)}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{card.solution_name}</div>
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {card.resolved_copy?.substring(0, 150)}...
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* SKU Curation */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Curate Setup Guide SKUs
            </h3>
            <div className="grid md:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
              {availableSkus.slice(0, 100).map((sku) => (
                <label
                  key={sku.product_code}
                  className={`flex items-start gap-2 p-2 border rounded cursor-pointer text-xs ${
                    curatedSkus.includes(sku.product_code)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={curatedSkus.includes(sku.product_code)}
                    onChange={() => toggleSku(sku.product_code)}
                    className="mt-0.5"
                  />
                  <div className="font-mono font-bold">{sku.product_code}</div>
                </label>
              ))}
            </div>
            <div className="mt-3 text-sm text-gray-600">
              {curatedSkus.length} SKU(s) selected for Setup Guide
            </div>
          </div>

          {/* Preview */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6">Preview</h3>

            {/* Hero Preview */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8 mb-6 text-center">
              <h4 className="text-3xl font-bold mb-2">
                Solutions for {companyName}
              </h4>
              <p className="text-blue-100 text-lg">
                Personalized recommendations for your equipment
              </p>
            </div>

            {/* Grouped Cards Preview */}
            <div className="space-y-8 mb-6">
              {(() => {
                // Group cards by solution_name
                const solutionGroups = selectedCardsArray.reduce((acc: Record<string, any[]>, card: any) => {
                  const key = card.solution_name;
                  if (!acc[key]) {
                    acc[key] = [];
                  }
                  acc[key].push(card);
                  return acc;
                }, {});

                return Object.entries(solutionGroups).slice(0, 2).map(([solutionName, cards]) => {
                  const primaryCard = (cards as any[]).find((c: any) => c.is_primary_pitch) || cards[0];

                  return (
                    <div key={solutionName} className="bg-white rounded-xl shadow-sm overflow-hidden">
                      <div className="p-6">
                        {/* Solution Badge */}
                        <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
                          {solutionName}
                        </div>

                        {/* Problems this solution solves */}
                        {(cards as any[]).length > 1 && (
                          <div className="mb-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-4">
                            <h4 className="font-bold text-green-900 mb-2 text-sm">
                              Solves {(cards as any[]).length} Problems:
                            </h4>
                            <ul className="space-y-1">
                              {(cards as any[]).map((card: any) => (
                                <li key={card.problem_id} className="flex items-start gap-2">
                                  <svg className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="text-sm text-green-900">{card.title}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Marketing Copy Preview */}
                        <div className="prose prose-sm max-w-none text-gray-700">
                          <ReactMarkdown>{primaryCard.resolved_copy?.substring(0, 400)}...</ReactMarkdown>
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}

              {Object.keys(selectedCardsArray.reduce((acc: Record<string, any[]>, card: any) => {
                const key = card.solution_name;
                if (!acc[key]) acc[key] = [];
                acc[key].push(card);
                return acc;
              }, {})).length > 2 && (
                <div className="text-sm text-gray-500 text-center bg-white rounded-lg p-4">
                  +{Object.keys(selectedCardsArray.reduce((acc: Record<string, any[]>, card: any) => {
                    const key = card.solution_name;
                    if (!acc[key]) acc[key] = [];
                    acc[key].push(card);
                    return acc;
                  }, {})).length - 2} more solution(s) (shown on landing page)
                </div>
              )}
            </div>

            <SetupGuide
              curatedSkus={curatedSkus}
              machineId={selectedMachine}
              machineName={machines.find(m => m.machine_id === selectedMachine)?.display_name}
            />
          </div>

          {/* Send Button */}
          <div className="flex justify-end gap-3">
            <div className="text-right text-sm text-gray-600">
              Sending to {contacts.filter(c => c.marketing_status !== 'unsubscribed').length} contact(s)
            </div>
            <button
              onClick={handleSend}
              disabled={sending || selectedCards.size === 0}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {sending ? 'Sending...' : 'Send Marketing Email'}
            </button>
          </div>
        </>
      )}

      {!selectedMachine && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center">
          <p className="text-gray-500">Select a machine to build marketing content</p>
        </div>
      )}
    </div>
  );
}
