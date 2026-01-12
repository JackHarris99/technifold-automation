/**
 * Admin Shipping Rates Management Page
 * Manage shipping countries, rates, and free shipping thresholds
 */

'use client';

import { useState, useEffect } from 'react';
import ShippingRateModal from '@/components/admin/modals/ShippingRateModal';

interface ShippingRate {
  rate_id: string;
  country_code: string;
  country_name: string;
  rate_gbp: number;
  zone_name: string | null;
  free_shipping_threshold: number | null;
  min_order_value: number;
  display_order: number;
  active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export default function ShippingRatesPage() {
  const [rates, setRates] = useState<ShippingRate[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRate, setEditingRate] = useState<ShippingRate | null>(null);

  useEffect(() => {
    loadRates();
  }, []);

  async function loadRates() {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/shipping-rates');
      const data = await response.json();
      setRates(data.rates || []);
    } catch (err) {
      console.error('Failed to load shipping rates:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    setEditingRate(null);
    setShowModal(true);
  }

  function handleEdit(rate: ShippingRate) {
    setEditingRate(rate);
    setShowModal(true);
  }

  async function handleDelete(rate: ShippingRate) {
    if (!confirm(`Delete shipping rate for ${rate.country_name}?`)) return;

    try {
      const response = await fetch(`/api/admin/shipping-rates/${rate.rate_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete');

      alert('Shipping rate deleted');
      loadRates();
    } catch (err) {
      alert('Failed to delete shipping rate');
      console.error(err);
    }
  }

  async function handleToggleActive(rate: ShippingRate) {
    try {
      const response = await fetch(`/api/admin/shipping-rates/${rate.rate_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !rate.active }),
      });

      if (!response.ok) throw new Error('Failed to update');

      loadRates();
    } catch (err) {
      alert('Failed to update shipping rate');
      console.error(err);
    }
  }

  function handleModalSuccess() {
    setShowModal(false);
    loadRates();
  }

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-6xl mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[32px] font-[700] text-[#0a0a0a] tracking-[-0.02em]">
                Shipping Rates
              </h1>
              <p className="text-[15px] text-[#475569] font-[500] mt-2">
                Manage shipping countries, rates, and free shipping thresholds
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-2.5 bg-[#1e40af] text-white rounded-lg text-[14px] font-[600] hover:bg-[#1e3a8a] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              Add Country
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Rates Table */}
      <div className="max-w-6xl mx-auto px-8 py-8">
        {loading ? (
          <div className="text-center py-16">
            <div className="text-[14px] text-[#64748b] font-[500]">Loading shipping rates...</div>
          </div>
        ) : rates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8] p-16 text-center">
            <div className="mb-2">
              <svg className="w-16 h-16 mx-auto text-[#cbd5e1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-[18px] font-[600] text-[#0a0a0a] mb-2">No Shipping Rates Configured</h3>
            <p className="text-[14px] text-[#64748b] mb-6 max-w-md mx-auto">
              Add your first shipping country to start managing rates and free shipping thresholds.
            </p>
            <button
              onClick={handleAdd}
              className="px-6 py-2.5 bg-[#1e40af] text-white rounded-lg text-[14px] font-[600] hover:bg-[#1e3a8a] transition-colors shadow-[0_1px_2px_rgba(0,0,0,0.05)]"
            >
              Add First Country
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.04)] border border-[#e8e8e8] overflow-hidden">
            <table className="w-full">
              <thead className="bg-[#f8fafc] border-b border-[#e8e8e8]">
                <tr>
                  <th className="px-6 py-3.5 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3.5 text-left text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">
                    Shipping Rate
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">
                    Free Shipping
                  </th>
                  <th className="px-6 py-3.5 text-center text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3.5 text-right text-[11px] font-[600] text-[#64748b] uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f5f9]">
                {rates.map((rate) => (
                  <tr key={rate.rate_id} className={`transition-colors hover:bg-[#f8fafc] ${!rate.active ? 'opacity-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#64748b] font-[500]">
                      {rate.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-[14px] font-[600] text-[#0a0a0a]">{rate.country_name}</div>
                      {rate.notes && (
                        <div className="text-[12px] text-[#94a3b8] mt-0.5">{rate.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] font-mono text-[#475569] font-[500]">
                      {rate.country_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-[#64748b] font-[500]">
                      {rate.zone_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[14px] text-right font-[600] text-[#0a0a0a]">
                      £{rate.rate_gbp.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-[13px] text-right text-[#64748b] font-[500]">
                      {rate.free_shipping_threshold ? `£${rate.free_shipping_threshold.toFixed(2)}+` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleActive(rate)}
                        className={`px-3 py-1 text-[11px] font-[600] rounded-full transition-colors ${
                          rate.active
                            ? 'bg-[#dcfce7] text-[#166534] hover:bg-[#bbf7d0]'
                            : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                        }`}
                      >
                        {rate.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-[13px] font-[500]">
                      <button
                        onClick={() => handleEdit(rate)}
                        className="text-[#1e40af] hover:text-[#1e3a8a] mr-4 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rate)}
                        className="text-[#dc2626] hover:text-[#b91c1c] transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <ShippingRateModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSuccess={handleModalSuccess}
          editingRate={editingRate}
        />
      )}
    </div>
  );
}
