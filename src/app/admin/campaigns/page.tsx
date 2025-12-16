/**
 * Unified Campaign Builder - Single Page
 * Replaces: /new → /configure → /confirm → /send flow
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase-client';

export default function UnifiedCampaignPage() {
  const router = useRouter();
  const [step, setStep] = useState<'audience' | 'compose' | 'review'>('audience');

  // Audience filters
  const [territory, setTerritory] = useState('all');
  const [category, setCategory] = useState('all');
  const [targetingMode, setTargetingMode] = useState<'all' | 'reorder_opps' | 'has_tools' | 'active_subs'>('all');
  const [daysSinceOrder, setDaysSinceOrder] = useState('90');

  // Email content
  const [subject, setSubject] = useState('');
  const [preview, setPreview] = useState('');
  const [offerKey, setOfferKey] = useState('reorder_reminder');
  const [campaignKey, setCampaignKey] = useState('');

  // Audience
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanies, setSelectedCompanies] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadAudience();
  }, [territory, category, targetingMode, daysSinceOrder]);

  async function loadAudience() {
    setLoading(true);
    const supabase = createClient();
    let companyIds: string[] = [];

    try {
      // Different targeting strategies based on mode
      if (targetingMode === 'reorder_opps') {
        // Find companies with consumables not ordered in X days
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(daysSinceOrder || '90'));

        const { data: consumables } = await supabase
          .from('company_consumables')
          .select('company_id')
          .lt('last_ordered_at', daysAgo.toISOString());

        companyIds = [...new Set(consumables?.map(c => c.company_id) || [])];

      } else if (targetingMode === 'has_tools') {
        // Find companies that own tools
        const { data: tools } = await supabase
          .from('company_tools')
          .select('company_id');

        companyIds = [...new Set(tools?.map(t => t.company_id) || [])];

      } else if (targetingMode === 'active_subs') {
        // Find companies with active subscriptions
        const { data: subs } = await supabase
          .from('subscriptions')
          .select('company_id')
          .in('status', ['active', 'trial']);

        companyIds = [...new Set(subs?.map(s => s.company_id) || [])];

      } else {
        // Default: all companies
        const { data: allCompanies } = await supabase
          .from('companies')
          .select('company_id')
          .limit(200);

        companyIds = allCompanies?.map(c => c.company_id) || [];
      }

      // Now fetch company details for the filtered IDs
      if (companyIds.length === 0) {
        setCompanies([]);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('companies')
        .select('company_id, company_name, category, account_owner')
        .in('company_id', companyIds);

      if (territory !== 'all') {
        query = query.eq('account_owner', territory);
      }

      if (category !== 'all') {
        query = query.eq('category', category);
      }

      const { data } = await query.limit(200);
      setCompanies(data || []);

    } catch (error) {
      console.error('Error loading audience:', error);
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (selectedCompanies.size === 0) {
      alert('Select at least one company');
      return;
    }

    if (!subject || !campaignKey) {
      alert('Subject and campaign key required');
      return;
    }

    setSending(true);

    try {
      const supabase = createClient();

      // Create outbox jobs for each company
      for (const companyId of Array.from(selectedCompanies)) {
        // Get contacts
        const { data: contacts } = await supabase
          .from('contacts')
          .select('contact_id')
          .eq('company_id', companyId)
          .eq('marketing_status', 'subscribed');

        if (!contacts || contacts.length === 0) continue;

        // Create job
        await supabase.from('outbox').insert({
          job_type: 'send_offer_email',
          status: 'pending',
          attempts: 0,
          payload: {
            company_id: companyId,
            contact_ids: contacts.map(c => c.contact_id),
            offer_key: offerKey,
            campaign_key: campaignKey,
            subject,
            preview
          }
        });
      }

      alert(`Campaign queued! ${selectedCompanies.size} companies will receive emails when cron runs.`);
      router.push('/admin/campaigns');
    } catch (error) {
      console.error('Send error:', error);
      alert('Failed to queue campaign');
    } finally {
      setSending(false);
    }
  }

  const toggleCompany = (id: string) => {
    const newSet = new Set(selectedCompanies);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedCompanies(newSet);
  };

  const selectAll = () => {
    setSelectedCompanies(new Set(companies.map(c => c.company_id)));
  };

  const clearAll = () => {
    setSelectedCompanies(new Set());
  };

  return (
      <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Campaign</h1>
          <p className="text-gray-600">Single-page campaign builder</p>
        </div>

        {/* Step Indicator */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 flex gap-4">
          <button
            onClick={() => setStep('audience')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold ${step === 'audience' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            1. Audience ({selectedCompanies.size})
          </button>
          <button
            onClick={() => setStep('compose')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold ${step === 'compose' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            2. Compose
          </button>
          <button
            onClick={() => setStep('review')}
            className={`flex-1 py-2 px-4 rounded-lg font-semibold ${step === 'review' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
          >
            3. Review & Send
          </button>
        </div>

        {/* Step: Audience */}
        {step === 'audience' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Select Audience</h2>

            {/* Filters */}
            <div className="space-y-4 mb-6">
              {/* Targeting Strategy */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <label className="block text-sm font-semibold mb-3 text-blue-900">Targeting Strategy (Fact Tables)</label>
                <div className="grid grid-cols-4 gap-3">
                  <button
                    onClick={() => setTargetingMode('all')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${targetingMode === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  >
                    All Companies
                  </button>
                  <button
                    onClick={() => setTargetingMode('reorder_opps')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${targetingMode === 'reorder_opps' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  >
                    Reorder Opps
                  </button>
                  <button
                    onClick={() => setTargetingMode('has_tools')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${targetingMode === 'has_tools' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  >
                    Has Tools
                  </button>
                  <button
                    onClick={() => setTargetingMode('active_subs')}
                    className={`px-4 py-2 rounded-lg font-medium text-sm ${targetingMode === 'active_subs' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-300'}`}
                  >
                    Active Subscriptions
                  </button>
                </div>
                {targetingMode === 'reorder_opps' && (
                  <div className="mt-3">
                    <label className="block text-sm font-medium mb-2">Days Since Last Order</label>
                    <input
                      type="number"
                      value={daysSinceOrder}
                      onChange={e => setDaysSinceOrder(e.target.value)}
                      placeholder="e.g. 90"
                      className="w-48 border rounded-lg px-3 py-2"
                    />
                    <p className="text-xs text-gray-600 mt-1">Target companies with consumables not ordered in {daysSinceOrder || '90'} days</p>
                  </div>
                )}
              </div>

              {/* Additional Filters */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Territory</label>
                  <select value={territory} onChange={e => setTerritory(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="all">All Territories</option>
                    <option value="Lee">Lee</option>
                    <option value="Callum">Callum</option>
                    <option value="Steve">Steve</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select value={category} onChange={e => setCategory(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                    <option value="all">All Categories</option>
                    <option value="Hot VIP">Hot VIP</option>
                    <option value="Regular">Regular</option>
                    <option value="Cold">Cold</option>
                  </select>
                </div>
                <div className="flex items-end gap-2">
                  <button onClick={selectAll} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold">Select All</button>
                  <button onClick={clearAll} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-semibold">Clear</button>
                </div>
              </div>
            </div>

            {/* Company List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {loading ? (
                <p className="text-gray-500">Loading...</p>
              ) : companies.length === 0 ? (
                <p className="text-gray-500">No companies match filters</p>
              ) : (
                companies.map(company => (
                  <div key={company.company_id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={selectedCompanies.has(company.company_id)}
                      onChange={() => toggleCompany(company.company_id)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">{company.company_name}</div>
                      <div className="text-sm text-gray-600">
                        {company.category && `${company.category} • `}
                        {company.account_owner && `${company.account_owner}`}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="mt-6">
              <button onClick={() => setStep('compose')} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">
                Next: Compose Email →
              </button>
            </div>
          </div>
        )}

        {/* Step: Compose */}
        {step === 'compose' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Compose Email</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Campaign Key</label>
                <input type="text" value={campaignKey} onChange={e => setCampaignKey(e.target.value)} placeholder="e.g. reorder_dec_2025" className="w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject Line</label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="e.g. Time to Reorder Your Consumables" className="w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Preview Text</label>
                <input type="text" value={preview} onChange={e => setPreview(e.target.value)} placeholder="Appears in email preview" className="w-full border rounded-lg px-3 py-2" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Offer Type</label>
                <select value={offerKey} onChange={e => setOfferKey(e.target.value)} className="w-full border rounded-lg px-3 py-2">
                  <option value="reorder_reminder">Reorder Reminder</option>
                  <option value="new_products">New Products</option>
                  <option value="special_offer">Special Offer</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button onClick={() => setStep('audience')} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold">← Back</button>
              <button onClick={() => setStep('review')} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold">Next: Review →</button>
            </div>
          </div>
        )}

        {/* Step: Review */}
        {step === 'review' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Review & Send</h2>

            <div className="space-y-4 mb-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="font-semibold">Audience: {selectedCompanies.size} companies</div>
                <div className="text-sm text-gray-600 mt-1">Campaign: {campaignKey || '(not set)'}</div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="font-semibold mb-2">Email Preview:</div>
                <div className="text-sm"><strong>Subject:</strong> {subject || '(not set)'}</div>
                <div className="text-sm"><strong>Preview:</strong> {preview || '(not set)'}</div>
                <div className="text-sm"><strong>Type:</strong> {offerKey}</div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-sm">⚠️ Emails will be queued and sent when the outbox cron runs (12:00 UTC daily)</div>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => setStep('compose')} className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold">← Back</button>
              <button onClick={handleSend} disabled={sending} className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold disabled:bg-gray-400">
                {sending ? 'Queueing...' : `Queue Campaign (${selectedCompanies.size} companies)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
