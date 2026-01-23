/**
 * Shipping Rates Tab
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

export default function RatesTab() {
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
    <div>
      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Shipping Configuration</h3>
        <p className="text-sm text-blue-800">
          Configure shipping rates, free shipping thresholds, and minimum order values for each country.
          Display order determines the sequence in checkout dropdowns.
        </p>
      </div>

      {/* Header Actions */}
      <div className="flex items-center justify-between mb-6">
        <div className="text-sm text-gray-700">
          {rates.length} {rates.length === 1 ? 'country' : 'countries'} configured
        </div>
        <button
          onClick={handleAdd}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          Add Country
        </button>
      </div>

      {/* Shipping Rates Table */}
      {loading ? (
        <div className="text-center py-16">
          <div className="text-sm text-gray-600">Loading shipping rates...</div>
        </div>
      ) : rates.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-16 text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Shipping Rates Configured</h3>
          <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
            Add your first shipping country to start managing rates and free shipping thresholds.
          </p>
          <button
            onClick={handleAdd}
            className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            Add First Country
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Order
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Country
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Zone
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Shipping Rate
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Free Shipping
                </th>
                <th className="px-6 py-3.5 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rates.map((rate) => (
                <tr key={rate.rate_id} className={`transition-colors hover:bg-gray-50 ${!rate.active ? 'opacity-50' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {rate.display_order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold text-gray-900">{rate.country_name}</div>
                    {rate.notes && (
                      <div className="text-xs text-gray-500 mt-0.5">{rate.notes}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-700">
                    {rate.country_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {rate.zone_name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                    £{rate.rate_gbp.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-600">
                    {rate.free_shipping_threshold ? `£${rate.free_shipping_threshold.toFixed(2)}+` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <button
                      onClick={() => handleToggleActive(rate)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                        rate.active
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {rate.active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                    <button
                      onClick={() => handleEdit(rate)}
                      className="text-blue-600 hover:text-blue-800 mr-4 transition-colors font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(rate)}
                      className="text-red-600 hover:text-red-800 transition-colors font-medium"
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
