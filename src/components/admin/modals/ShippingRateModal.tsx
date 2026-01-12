/**
 * Shipping Rate Add/Edit Modal
 * For managing shipping countries and rates
 */

'use client';

import { useState, useEffect } from 'react';

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
}

interface ShippingRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingRate: ShippingRate | null;
}

export default function ShippingRateModal({
  isOpen,
  onClose,
  onSuccess,
  editingRate,
}: ShippingRateModalProps) {
  const [formData, setFormData] = useState({
    country_code: '',
    country_name: '',
    rate_gbp: '',
    zone_name: '',
    free_shipping_threshold: '',
    min_order_value: '0',
    display_order: '999',
    active: true,
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingRate) {
      setFormData({
        country_code: editingRate.country_code,
        country_name: editingRate.country_name,
        rate_gbp: editingRate.rate_gbp.toString(),
        zone_name: editingRate.zone_name || '',
        free_shipping_threshold: editingRate.free_shipping_threshold?.toString() || '',
        min_order_value: editingRate.min_order_value.toString(),
        display_order: editingRate.display_order.toString(),
        active: editingRate.active,
        notes: editingRate.notes || '',
      });
    } else {
      setFormData({
        country_code: '',
        country_name: '',
        rate_gbp: '',
        zone_name: '',
        free_shipping_threshold: '500',
        min_order_value: '0',
        display_order: '999',
        active: true,
        notes: '',
      });
    }
  }, [editingRate, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        country_code: formData.country_code.toUpperCase(),
        country_name: formData.country_name,
        rate_gbp: parseFloat(formData.rate_gbp) || 0,
        zone_name: formData.zone_name || null,
        free_shipping_threshold: formData.free_shipping_threshold ? parseFloat(formData.free_shipping_threshold) : null,
        min_order_value: parseFloat(formData.min_order_value) || 0,
        display_order: parseInt(formData.display_order) || 999,
        active: formData.active,
        notes: formData.notes || null,
      };

      const url = editingRate
        ? `/api/admin/shipping-rates/${editingRate.rate_id}`
        : '/api/admin/shipping-rates';

      const method = editingRate ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save shipping rate');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {editingRate ? 'Edit Shipping Rate' : 'Add Shipping Rate'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-700 hover:text-gray-900 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Country Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.country_code}
                onChange={(e) => setFormData({ ...formData, country_code: e.target.value.toUpperCase() })}
                maxLength={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent uppercase"
                placeholder="GB"
                required
                disabled={!!editingRate}
              />
              <p className="text-xs text-gray-700 mt-1">2-letter ISO country code (e.g., GB, US, FR)</p>
            </div>

            {/* Country Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.country_name}
                onChange={(e) => setFormData({ ...formData, country_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="United Kingdom"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Shipping Rate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Rate (£) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.rate_gbp}
                  onChange={(e) => setFormData({ ...formData, rate_gbp: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="15.00"
                  required
                />
              </div>

              {/* Free Shipping Threshold */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Free Shipping Above (£)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.free_shipping_threshold}
                  onChange={(e) => setFormData({ ...formData, free_shipping_threshold: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="500.00"
                />
                <p className="text-xs text-gray-700 mt-1">Leave empty for no free shipping</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Zone Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Zone Name
                </label>
                <input
                  type="text"
                  value={formData.zone_name}
                  onChange={(e) => setFormData({ ...formData, zone_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="EU Zone 1"
                />
              </div>

              {/* Display Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="999"
                />
                <p className="text-xs text-gray-700 mt-1">Lower numbers appear first in dropdowns</p>
              </div>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <label htmlFor="active" className="text-sm font-medium text-gray-700">
                Active (visible in country dropdowns)
              </label>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Internal notes about this shipping rate..."
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : editingRate ? 'Update Rate' : 'Add Rate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
