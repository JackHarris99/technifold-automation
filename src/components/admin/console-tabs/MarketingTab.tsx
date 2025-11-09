/**
 * Marketing Tab - Create machine-specific marketing for ANY machine (not just owned)
 * Cascading: Brand → Model → Solution → Problem
 * Shows preview, select contacts, send
 */

'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import SetupGuide from '../../marketing/SetupGuide';

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
  const [selectedProblem, setSelectedProblem] = useState('');

  // Data
  const [machinesFiltered, setMachinesFiltered] = useState<any[]>([]);
  const [solutions, setSolutions] = useState<any[]>([]);
  const [problems, setProblems] = useState<any[]>([]);
  const [previewCard, setPreviewCard] = useState<any>(null);

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

  // Fetch problems for solution
  useEffect(() => {
    if (!selectedSolution || !selectedMachine) {
      setProblems([]);
      setSelectedProblem('');
      return;
    }

    async function fetchProblems() {
      const response = await fetch(`/api/admin/copy/problems?machine_id=${selectedMachine}&solution_id=${selectedSolution}`);
      const data = await response.json();
      setProblems(data.problems || []);
    }
    fetchProblems();
  }, [selectedSolution, selectedMachine]);

  // Load preview when problem selected
  useEffect(() => {
    if (!selectedProblem || !selectedMachine) {
      setPreviewCard(null);
      return;
    }

    async function loadPreview() {
      const machine = allMachines.find(m => m.machine_id === selectedMachine);
      if (!machine?.slug) return;

      const response = await fetch(`/api/machines/solutions?slug=${machine.slug}`);
      const data = await response.json();

      const card = (data.problemCards || []).find((c: any) => c.problem_id === selectedProblem);
      setPreviewCard(card);
    }
    loadPreview();
  }, [selectedProblem, selectedMachine, allMachines]);

  const handleSend = async () => {
    if (selectedContacts.size === 0) {
      alert('Please select at least one contact');
      return;
    }

    if (!selectedMachine || !selectedProblem) {
      alert('Please select a machine and problem first');
      return;
    }

    const machine = allMachines.find(m => m.machine_id === selectedMachine);

    setSending(true);
    try {
      const response = await fetch('/api/admin/marketing/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_ids: Array.from(selectedContacts),
          machine_slug: machine.slug,
          selected_problem_ids: [selectedProblem],
          curated_skus: previewCard?.curated_skus || [],
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
        <div className="grid md:grid-cols-4 gap-4">
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

          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">Problem</label>
            <select
              value={selectedProblem}
              onChange={(e) => setSelectedProblem(e.target.value)}
              disabled={!selectedSolution}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg disabled:bg-gray-100"
            >
              <option value="">Select problem...</option>
              {problems.map(p => (
                <option key={p.problem_id} value={p.problem_id}>{p.title}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Preview */}
      {previewCard && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h3 className="font-bold text-gray-900 mb-4">Marketing Preview - What Customer Will See</h3>

          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-8 rounded-xl mb-6">
            <h4 className="text-2xl font-bold text-gray-900 mb-2">
              Exclusive Offer for {companyName}
            </h4>
            <p className="text-gray-700">
              {previewCard.resolved_copy?.split('\n\n')[0].substring(0, 150)}...
            </p>
          </div>

          <div className="border-2 border-gray-200 rounded-xl p-6 mb-6">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-bold mb-4">
              {previewCard.solution_name}
            </div>
            <div className="prose max-w-none">
              <ReactMarkdown>{previewCard.resolved_copy}</ReactMarkdown>
            </div>
          </div>

          {previewCard.curated_skus && previewCard.curated_skus.length > 0 && (
            <SetupGuide
              curatedSkus={previewCard.curated_skus}
              machineId={selectedMachine}
              machineName={allMachines.find(m => m.machine_id === selectedMachine)?.display_name}
            />
          )}
        </div>
      )}

      {/* Contact Selection */}
      {previewCard && (
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
              disabled={sending || selectedContacts.size === 0 || !previewCard}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 disabled:bg-gray-400"
            >
              {sending ? 'Sending...' : `Send to ${selectedContacts.size} Contact(s)`}
            </button>
          </div>
        </div>
      )}

      {!previewCard && (
        <div className="bg-white border border-gray-200 rounded-xl p-12 text-center text-gray-500">
          Select a machine, solution, and problem to preview marketing content
        </div>
      )}
    </div>
  );
}
