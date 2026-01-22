/**
 * PlantListTab Component
 * Simple internal interface for sales reps to manually track company machines
 */

'use client';

import { useState, useEffect } from 'react';

interface Machine {
  machine_id: string;
  brand: string;
  model: string;
  display_name: string;
  type: string;
}

interface CompanyMachine {
  id: string;
  machine_id: string;
  quantity: number;
  location: string | null;
  verified: boolean;
  source: string;
  notes: string | null;
  created_at: string;
  machine?: Machine;
}

interface PlantListTabProps {
  companyId: string;
  companyMachines: CompanyMachine[];
}

export default function PlantListTab({ companyId, companyMachines: initialMachines }: PlantListTabProps) {
  const [machines, setMachines] = useState<CompanyMachine[]>(initialMachines);
  const [allMachines, setAllMachines] = useState<Machine[]>([]);
  const [selectedMachineId, setSelectedMachineId] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    quantity: 1,
    location: '',
    notes: '',
    verified: false,
  });

  // Fetch all available machines for the dropdown
  useEffect(() => {
    async function fetchMachines() {
      try {
        const response = await fetch('/api/machines/all');
        if (response.ok) {
          const data = await response.json();
          setAllMachines(data.machines || []);
        }
      } catch (error) {
        console.error('Failed to fetch machines:', error);
      }
    }
    fetchMachines();
  }, []);

  const handleAddMachine = async () => {
    if (!selectedMachineId) {
      alert('Please select a machine');
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/machines`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          machine_id: selectedMachineId,
          quantity: 1,
          source: 'manual',
          verified: false,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMachines([data.machine, ...machines]);
        setSelectedMachineId('');
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to add machine');
      }
    } catch (error) {
      alert('Network error: Failed to add machine');
    } finally {
      setIsAdding(false);
    }
  };

  const handleStartEdit = (machine: CompanyMachine) => {
    setEditingId(machine.id);
    setEditForm({
      quantity: machine.quantity,
      location: machine.location || '',
      notes: machine.notes || '',
      verified: machine.verified,
    });
  };

  const handleSaveEdit = async (machineId: string) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/machines/${machineId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        const data = await response.json();
        setMachines(machines.map(m => m.id === machineId ? data.machine : m));
        setEditingId(null);
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to update machine');
      }
    } catch (error) {
      alert('Network error: Failed to update machine');
    }
  };

  const handleDelete = async (machineId: string) => {
    if (!confirm('Remove this machine from the plant list?')) return;

    try {
      const response = await fetch(`/api/admin/companies/${companyId}/machines/${machineId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setMachines(machines.filter(m => m.id !== machineId));
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete machine');
      }
    } catch (error) {
      alert('Network error: Failed to delete machine');
    }
  };

  const handleToggleVerified = async (machine: CompanyMachine) => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/machines/${machine.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verified: !machine.verified }),
      });

      if (response.ok) {
        const data = await response.json();
        setMachines(machines.map(m => m.id === machine.id ? data.machine : m));
      }
    } catch (error) {
      console.error('Failed to toggle verified status:', error);
    }
  };

  // Group machines by brand/type for easier dropdown navigation
  const groupedMachines = allMachines.reduce((acc, machine) => {
    const key = `${machine.brand} - ${machine.type}`;
    if (!acc[key]) acc[key] = [];
    acc[key].push(machine);
    return acc;
  }, {} as Record<string, Machine[]>);

  return (
    <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8]">
      {/* Header with Add Machine Dropdown */}
      <div className="px-6 py-4 border-b border-[#e8e8e8]">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[18px] font-[600] text-[#0a0a0a]">Plant List</h2>
            <p className="text-[13px] text-[#64748b] mt-1">
              {machines.length} machine{machines.length !== 1 ? 's' : ''} on record
            </p>
          </div>

          {/* Simple Add Machine Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={selectedMachineId}
              onChange={(e) => setSelectedMachineId(e.target.value)}
              className="px-3 py-2 text-[13px] border border-[#e8e8e8] rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={isAdding}
            >
              <option value="">Select machine to add...</option>
              {Object.entries(groupedMachines).map(([group, machines]) => (
                <optgroup key={group} label={group}>
                  {machines.map((machine) => (
                    <option key={machine.machine_id} value={machine.machine_id}>
                      {machine.display_name}
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
            <button
              onClick={handleAddMachine}
              disabled={!selectedMachineId || isAdding}
              className="px-4 py-2 bg-blue-600 text-white text-[13px] font-[500] rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? 'Adding...' : 'Add'}
            </button>
          </div>
        </div>
      </div>

      {/* Machines Table */}
      <div className="p-6">
        {machines.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto text-[#cbd5e1] mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
            <p className="text-[#64748b] text-[14px] font-[500]">No machines recorded yet</p>
            <p className="text-[#94a3b8] text-[13px] mt-1">Use the dropdown above to add machines to this company's plant list</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[13px]">
              <thead>
                <tr className="border-b border-[#e8e8e8]">
                  <th className="text-left py-3 px-3 font-[600] text-[#64748b]">Machine</th>
                  <th className="text-left py-3 px-3 font-[600] text-[#64748b]">Qty</th>
                  <th className="text-left py-3 px-3 font-[600] text-[#64748b]">Location</th>
                  <th className="text-left py-3 px-3 font-[600] text-[#64748b]">Notes</th>
                  <th className="text-left py-3 px-3 font-[600] text-[#64748b]">Source</th>
                  <th className="text-center py-3 px-3 font-[600] text-[#64748b]">Verified</th>
                  <th className="text-right py-3 px-3 font-[600] text-[#64748b]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {machines.map((machine) => (
                  <tr key={machine.id} className="border-b border-[#f1f5f9] hover:bg-[#f8fafc]">
                    {editingId === machine.id ? (
                      // Edit Mode
                      <>
                        <td className="py-3 px-3">
                          <div className="font-[500] text-[#0a0a0a]">{machine.machine?.display_name}</div>
                          <div className="text-[12px] text-[#64748b]">{machine.machine?.type.replace(/_/g, ' ')}</div>
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="1"
                            value={editForm.quantity}
                            onChange={(e) => setEditForm({ ...editForm, quantity: parseInt(e.target.value) || 1 })}
                            className="w-16 px-2 py-1 border border-[#e8e8e8] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={editForm.location}
                            onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                            placeholder="e.g., Building A"
                            className="w-full px-2 py-1 border border-[#e8e8e8] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="text"
                            value={editForm.notes}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            placeholder="Add notes..."
                            className="w-full px-2 py-1 border border-[#e8e8e8] rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-[500] bg-gray-100 text-gray-700">
                            {machine.source}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={editForm.verified}
                            onChange={(e) => setEditForm({ ...editForm, verified: e.target.checked })}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleSaveEdit(machine.id)}
                            className="text-blue-600 hover:text-blue-700 font-[500] mr-3"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="text-[#64748b] hover:text-[#475569]"
                          >
                            Cancel
                          </button>
                        </td>
                      </>
                    ) : (
                      // View Mode
                      <>
                        <td className="py-3 px-3">
                          <div className="font-[500] text-[#0a0a0a]">{machine.machine?.display_name}</div>
                          <div className="text-[12px] text-[#64748b] capitalize">{machine.machine?.type.replace(/_/g, ' ')}</div>
                        </td>
                        <td className="py-3 px-3 text-[#0a0a0a]">{machine.quantity}</td>
                        <td className="py-3 px-3 text-[#64748b]">
                          {machine.location || <span className="text-[#cbd5e1]">—</span>}
                        </td>
                        <td className="py-3 px-3 text-[#64748b]">
                          {machine.notes || <span className="text-[#cbd5e1]">—</span>}
                        </td>
                        <td className="py-3 px-3">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-[500] ${
                            machine.source === 'manual'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-purple-100 text-purple-700'
                          }`}>
                            {machine.source}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="checkbox"
                            checked={machine.verified}
                            onChange={() => handleToggleVerified(machine)}
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                          />
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleStartEdit(machine)}
                            className="text-blue-600 hover:text-blue-700 font-[500] mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(machine.id)}
                            className="text-red-600 hover:text-red-700 font-[500]"
                          >
                            Delete
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
