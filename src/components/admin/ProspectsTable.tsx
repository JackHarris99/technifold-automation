/**
 * Prospects Table Component
 * Shows companies with machines, engagement, and action buttons - Sales-friendly UI
 */

'use client';

import { useState } from 'react';

// Helper to format relative time
function timeAgo(dateString: string): string {
  const now = new Date();
  const past = new Date(dateString);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 86400)}d ago`;
  return past.toLocaleDateString();
}

// Helper to format event names
function formatEventName(eventName: string): string {
  const formatted = eventName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return formatted;
}

interface Machine {
  company_machine_id: string;
  machine_id: string;
  source: string;
  confirmed: boolean;
  confidence_score: number;
  notes?: string;
  machines: {
    machine_id: string;
    brand: string;
    model: string;
    display_name: string;
    slug: string;
  };
}

interface EngagementEvent {
  event_name: string;
  created_at: string;
  url?: string;
}

interface Prospect {
  company_id: string;
  company_name: string;
  account_owner?: string | null;
  type?: string;
  created_at: string;
  machines: Machine[];
  engagement: EngagementEvent[];
}

interface ProspectsTableProps {
  prospects: Prospect[];
}

export default function ProspectsTable({ prospects: initialProspects }: ProspectsTableProps) {
  const [prospects, setProspects] = useState(initialProspects);
  const [filter, setFilter] = useState<'all' | 'unconfirmed' | 'with_machines'>('all');
  const [repFilter, setRepFilter] = useState<string>('all');
  const [loading, setLoading] = useState<string | null>(null);

  const filteredProspects = prospects.filter(p => {
    if (filter === 'unconfirmed') {
      return p.machines.some(m => !m.confirmed);
    }
    if (filter === 'with_machines') {
      return p.machines.length > 0;
    }
    if (repFilter !== 'all') {
      return p.account_owner === repFilter;
    }
    return true;
  });

  const handleConfirmMachine = async (companyMachineId: string, companyId: string) => {
    setLoading(companyMachineId);
    try {
      const response = await fetch('/api/admin/machines/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_machine_id: companyMachineId })
      });

      if (!response.ok) throw new Error('Failed to confirm machine');

      // Update local state
      setProspects(prev => prev.map(p => {
        if (p.company_id !== companyId) return p;

        return {
          ...p,
          machines: p.machines.map(m =>
            m.company_machine_id === companyMachineId
              ? { ...m, confirmed: true, source: 'sales_confirmed', confidence_score: 5 }
              : m
          )
        };
      }));

      alert('Machine confirmed successfully!');
    } catch (err) {
      console.error('Error confirming machine:', err);
      alert('Failed to confirm machine');
    } finally {
      setLoading(null);
    }
  };

  const handleAssignRep = async (companyId: string) => {
    const rep = prompt('Enter rep (rep_a, rep_b, rep_c):');
    if (!rep) return;

    setLoading(companyId);
    try {
      const response = await fetch('/api/admin/companies/assign-rep', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, account_owner: rep })
      });

      if (!response.ok) throw new Error('Failed to assign rep');

      // Update local state
      setProspects(prev => prev.map(p =>
        p.company_id === companyId ? { ...p, account_owner: rep } : p
      ));

      alert('Rep assigned successfully!');
    } catch (err) {
      console.error('Error assigning rep:', err);
      alert('Failed to assign rep');
    } finally {
      setLoading(null);
    }
  };

  const handleSendOffer = (companyId: string) => {
    // Redirect to system-check with pre-filled company
    window.location.href = `/admin/system-check?company_id=${companyId}`;
  };

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 flex gap-4 items-center">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Companies</option>
          <option value="unconfirmed">Unconfirmed Machines</option>
          <option value="with_machines">Has Machines</option>
        </select>

        <select
          value={repFilter}
          onChange={(e) => setRepFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg"
        >
          <option value="all">All Reps</option>
          <option value="rep_a">Rep A</option>
          <option value="rep_b">Rep B</option>
          <option value="rep_c">Rep C</option>
          <option value="">Unassigned</option>
        </select>

        <div className="text-sm text-gray-600">
          Showing {filteredProspects.length} of {prospects.length} companies
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Company</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Rep</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Machines</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Recent Activity</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredProspects.map((prospect) => (
              <tr key={prospect.company_id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div>
                    <div className="font-semibold text-gray-900">{prospect.company_name}</div>
                    <div className="text-xs text-gray-500">{prospect.company_id}</div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-block px-2 py-1 text-xs rounded ${
                    prospect.account_owner
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {prospect.account_owner || 'Unassigned'}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {prospect.machines.length === 0 ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="text-sm">Unknown machine</span>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {prospect.machines.map((machine) => (
                        <div key={machine.company_machine_id} className="flex items-start gap-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-gray-900 text-sm">
                                {machine.machines.display_name}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {machine.confirmed ? (
                                <span
                                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold"
                                  title="Sales confirmed this machine"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Confirmed
                                </span>
                              ) : (
                                <>
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full"
                                    title={`Source: ${machine.source} | Confidence: ${machine.confidence_score}/5`}
                                  >
                                    {machine.source === 'self_report' && '🤚 Self-reported'}
                                    {machine.source === 'inferred' && '🔍 Inferred'}
                                    {machine.source === 'zoho_import' && '📋 Zoho'}
                                  </span>
                                  <button
                                    onClick={() => handleConfirmMachine(machine.company_machine_id, prospect.company_id)}
                                    disabled={loading === machine.company_machine_id}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold disabled:opacity-50"
                                    title="Mark as sales-confirmed"
                                  >
                                    {loading === machine.company_machine_id ? '...' : '✓ Confirm'}
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {prospect.engagement.length === 0 ? (
                    <div className="flex items-center gap-2 text-gray-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                      <span className="text-sm">No recent activity</span>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {prospect.engagement.slice(0, 3).map((event, idx) => (
                        <div key={idx} className="flex items-center gap-2 text-xs">
                          <span className="inline-block w-2 h-2 bg-blue-400 rounded-full"></span>
                          <span className="text-gray-700 font-medium">{formatEventName(event.event_name)}</span>
                          <span className="text-gray-400">·</span>
                          <span className="text-gray-500">{timeAgo(event.created_at)}</span>
                        </div>
                      ))}
                      {prospect.engagement.length > 3 && (
                        <div className="text-xs text-gray-400 pl-4">
                          +{prospect.engagement.length - 3} more events
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleAssignRep(prospect.company_id)}
                      disabled={loading === prospect.company_id}
                      className="text-xs text-blue-600 hover:text-blue-800 underline text-left disabled:opacity-50"
                    >
                      Assign Rep
                    </button>
                    <button
                      onClick={() => handleSendOffer(prospect.company_id)}
                      className="text-xs text-blue-600 hover:text-blue-800 underline text-left"
                    >
                      Send Offer
                    </button>
                    <a
                      href={`/admin/customer/${prospect.company_id}`}
                      className="text-xs text-gray-600 hover:text-gray-800 underline"
                    >
                      View Details
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filteredProspects.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No companies found matching the current filters
          </div>
        )}
      </div>
    </div>
  );
}
