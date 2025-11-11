/**
 * Marketing Tab - Create machine-specific marketing for ANY machine (not just owned)
 * Cascading: Brand → Model → Solution → Problem
 * Shows preview, select contacts, send
 */

'use client';

import { useState, useEffect } from 'react';
import MediaImage from '../../shared/MediaImage';
import SmartCopyRenderer from '../../marketing/SmartCopyRenderer';
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
  const [brandMedia, setBrandMedia] = useState<any>(null);

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

  // Fetch solutions and brand media for machine
  useEffect(() => {
    if (!selectedMachine) {
      setSolutions([]);
      setSelectedSolution('');
      setBrandMedia(null);
      return;
    }

    async function fetchSolutions() {
      const response = await fetch(`/api/admin/copy/solutions?machine_id=${selectedMachine}`);
      const data = await response.json();
      setSolutions(data.solutions || []);
    }

    async function fetchBrandMedia() {
      const machine = allMachines.find(m => m.machine_id === selectedMachine);
      if (!machine?.brand) return;

      const brandSlug = machine.brand.toLowerCase().replace(/\s+/g, '-');
      const response = await fetch(`/api/brand-media?slug=${brandSlug}`);
      const data = await response.json();
      setBrandMedia(data.brandMedia || null);
    }

    fetchSolutions();
    fetchBrandMedia();
  }, [selectedMachine, allMachines]);

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

        // Merge curated products from all problems in this solution
        const allSkus = new Set<string>();
        problemCards.forEach((card: any) => {
          (card.curated_skus || []).forEach((sku: string) => allSkus.add(sku));
        });
        // Note: In real implementation, fetch product details for these SKUs

        return (
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <h3 className="text-sm font-semibold text-gray-500 px-8 pt-8 pb-4 uppercase tracking-wide">Marketing Preview</h3>

            {/* Hero Section with Brand Logo and Background */}
            <div
              className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 text-white py-12 px-8"
              style={brandMedia?.hero_url ? {
                backgroundImage: `linear-gradient(to bottom right, rgba(37, 99, 235, 0.9), rgba(79, 70, 229, 0.9)), url(${brandMedia.hero_url})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              } : undefined}
            >
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-8 mb-4">
                  {brandMedia?.logo_url && (
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <img
                        src={brandMedia.logo_url}
                        alt={selectedMachineData?.brand}
                        className="h-16 w-auto object-contain"
                      />
                    </div>
                  )}
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                      {selectedMachineData?.display_name}
                    </h1>
                    <p className="text-xl text-blue-100">
                      Production-proven solutions for {companyName}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clean editorial-style layout */}
            <div className="max-w-4xl mx-auto p-8">
              {/* Solution Badge */}
              <div className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-8">
                {solution?.name}
              </div>

              {/* Problems this solution solves */}
              {problemCards.length > 1 && (
                <div className="mb-8 bg-green-50 border-l-4 border-green-500 rounded-r-lg p-6">
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

              {/* Hero/Main Image (if available) */}
              {primaryCard.resolved_image_url && primaryCard.resolved_image_url !== '/placeholder-machine.jpg' && (
                <div className="relative w-full aspect-video bg-gray-100 rounded-xl overflow-hidden mb-8">
                  <MediaImage
                    src={primaryCard.resolved_image_url}
                    alt={`${solution?.name} solution`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 896px"
                    className="object-contain"
                  />
                </div>
              )}

              {/* Marketing Copy - ALL problems shown in styled boxes */}
              <div className="space-y-6">
                {problemCards.map((card: any, index: number) => {
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
                    <div
                      key={card.problem_solution_id}
                      className="bg-gradient-to-br from-gray-50 to-slate-50 rounded-2xl p-8 border-2 border-gray-200 hover:border-blue-300 transition-colors shadow-sm"
                    >
                      {problemCards.length > 1 && (
                        <div className="flex items-center gap-3 mb-6">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold">
                            {index + 1}
                          </div>
                          <h2 className="text-2xl font-bold text-gray-900">{card.title}</h2>
                        </div>
                      )}
                      <SmartCopyRenderer
                        content={cardCopy}
                        problemTitle={card.title}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Before/After Comparison - Side by Side */}
              {(primaryCard.resolved_before_image_url || primaryCard.resolved_after_image_url) && (
                <div className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">See The Difference</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    {primaryCard.resolved_before_image_url && (
                      <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
                        <div className="bg-red-50 px-4 py-3 border-b-2 border-red-200">
                          <h4 className="font-bold text-red-800">Before</h4>
                        </div>
                        <div className="relative w-full aspect-square bg-gray-50">
                          <MediaImage
                            src={primaryCard.resolved_before_image_url}
                            alt="Before using solution"
                            fill
                            sizes="(max-width: 768px) 100vw, 448px"
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}

                    {primaryCard.resolved_after_image_url && (
                      <div className="bg-white rounded-xl border-2 border-green-200 overflow-hidden">
                        <div className="bg-green-50 px-4 py-3 border-b-2 border-green-200">
                          <h4 className="font-bold text-green-800">After</h4>
                        </div>
                        <div className="relative w-full aspect-square bg-gray-50">
                          <MediaImage
                            src={primaryCard.resolved_after_image_url}
                            alt="After using solution"
                            fill
                            sizes="(max-width: 768px) 100vw, 448px"
                            className="object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Product Showcase */}
              {primaryCard.resolved_product_image_url && (
                <div className="mb-12 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">The Solution</h3>
                  <div className="relative w-full aspect-square bg-white rounded-lg p-8">
                    <MediaImage
                      src={primaryCard.resolved_product_image_url}
                      alt={`${solution?.name} product`}
                      fill
                      sizes="(max-width: 1024px) 100vw, 832px"
                      className="object-contain"
                    />
                  </div>
                </div>
              )}

            </div>

            {/* Curated Products Section */}
            {allSkus.size > 0 && (
              <div className="border-t border-gray-200 bg-gray-50 p-8 lg:p-12">
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Recommended Consumables
                  </h3>
                  <p className="text-gray-600 mb-8">
                    {selectedMachineData ? `Precision-engineered for your ${selectedMachineData.brand} ${selectedMachineData.model}` : 'Professional solutions for your equipment'}
                  </p>

                  <div className="bg-white rounded-lg p-6 border border-gray-200">
                    <p className="text-sm text-gray-600 text-center">
                      {allSkus.size} curated product{allSkus.size !== 1 ? 's' : ''} will be displayed here
                    </p>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      SKUs: {Array.from(allSkus).join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* CTA Section */}
            <div className="max-w-4xl mx-auto px-8 py-12">
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-8 py-6">
                  <h2 className="text-3xl md:text-4xl font-bold text-white text-center">
                    Ready to Transform Your Production?
                  </h2>
                </div>
                <div className="p-8 md:p-12 text-center">
                  <p className="text-xl text-gray-700 mb-8 max-w-2xl mx-auto">
                    Let's discuss how these solutions can improve quality and efficiency for {companyName}
                  </p>
                  <a
                    href="/contact"
                    className="inline-block bg-blue-600 text-white px-10 py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 hover:shadow-lg transition-all"
                  >
                    Get Your Custom Quote
                  </a>
                  <p className="text-sm text-gray-500 mt-4">
                    Response within 2 hours • 100% Money-Back Guarantee
                  </p>
                </div>
              </div>
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
