/**
 * Prospects Table Component
 * Shows companies with machines, engagement, and action buttons
 */

'use client';

import { useState } from 'react';

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
                    <span className="text-sm text-gray-400">No machines</span>
                  ) : (
                    <div className="space-y-1">
                      {prospect.machines.map((machine) => (
                        <div key={machine.company_machine_id} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900">
                              {machine.machines.display_name}
                            </span>
                            {machine.confirmed ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                                Confirmed
                              </span>
                            ) : (
                              <button
                                onClick={() => handleConfirmMachine(machine.company_machine_id, prospect.company_id)}
                                disabled={loading === machine.company_machine_id}
                                className="text-xs text-blue-600 hover:text-blue-800 underline disabled:opacity-50"
                              >
                                {loading === machine.company_machine_id ? 'Confirming...' : 'Confirm'}
                              </button>
                            )}
                          </div>
                          <div className="text-xs text-gray-500">
                            {machine.source} · confidence: {machine.confidence_score}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4">
                  {prospect.engagement.length === 0 ? (
                    <span className="text-sm text-gray-400">No activity</span>
                  ) : (
                    <div className="text-xs text-gray-600 space-y-1">
                      {prospect.engagement.slice(0, 3).map((event, idx) => (
                        <div key={idx}>
                          • {event.event_name} ({new Date(event.created_at).toLocaleDateString()})
                        </div>
                      ))}
                      {prospect.engagement.length > 3 && (
                        <div className="text-gray-400">+{prospect.engagement.length - 3} more</div>
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
