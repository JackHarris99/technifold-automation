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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Shipping Rates</h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage shipping countries, rates, and free shipping thresholds
              </p>
            </div>
            <button
              onClick={handleAdd}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Add Country
            </button>
          </div>
        </div>
      </div>

      {/* Shipping Rates Table */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {loading ? (
          <div className="text-center py-12 text-gray-800">Loading shipping rates...</div>
        ) : rates.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <p className="text-gray-800">No shipping rates configured</p>
            <button
              onClick={handleAdd}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
            >
              Add First Country
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Order
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Country
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Zone
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Shipping Rate
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Free Shipping
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-800 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {rates.map((rate) => (
                  <tr key={rate.rate_id} className={!rate.active ? 'bg-gray-50 opacity-60' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {rate.display_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-gray-900">{rate.country_name}</div>
                      {rate.notes && (
                        <div className="text-xs text-gray-700 mt-0.5">{rate.notes}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-800">
                      {rate.country_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                      {rate.zone_name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
                      £{rate.rate_gbp.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-700">
                      {rate.free_shipping_threshold ? `£${rate.free_shipping_threshold.toFixed(2)}+` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center">
                      <button
                        onClick={() => handleToggleActive(rate)}
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          rate.active
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                        }`}
                      >
                        {rate.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(rate)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(rate)}
                        className="text-red-600 hover:text-red-900"
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
