'use client';

import { useState, useEffect } from 'react';

interface EditBillingAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  currentBillingAddress: {
    billing_address_line_1?: string;
    billing_address_line_2?: string;
    billing_city?: string;
    billing_state_province?: string;
    billing_postal_code?: string;
    billing_country?: string;
  };
}

export default function EditBillingAddressModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  currentBillingAddress,
}: EditBillingAddressModalProps) {
  const [formData, setFormData] = useState({
    billing_address_line_1: '',
    billing_address_line_2: '',
    billing_city: '',
    billing_state_province: '',
    billing_postal_code: '',
    billing_country: 'GB', // Default to UK
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && currentBillingAddress) {
      setFormData({
        billing_address_line_1: currentBillingAddress.billing_address_line_1 || '',
        billing_address_line_2: currentBillingAddress.billing_address_line_2 || '',
        billing_city: currentBillingAddress.billing_city || '',
        billing_state_province: currentBillingAddress.billing_state_province || '',
        billing_postal_code: currentBillingAddress.billing_postal_code || '',
        billing_country: currentBillingAddress.billing_country || 'GB',
      });
    }
  }, [isOpen, currentBillingAddress]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/companies/${companyId}/update-billing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update billing address');
      }

      alert('Billing address updated successfully!');
      window.location.reload();
      onClose();
    } catch (err: any) {
      console.error('[EditBillingAddress] Error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Edit Billing Address</h2>
          <p className="text-sm text-gray-500 mt-1">{companyName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Address Line 1 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.billing_address_line_1}
              onChange={(e) => handleChange('billing_address_line_1', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="123 Main Street"
              required
            />
          </div>

          {/* Address Line 2 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Line 2
            </label>
            <input
              type="text"
              value={formData.billing_address_line_2}
              onChange={(e) => handleChange('billing_address_line_2', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Suite 100 (optional)"
            />
          </div>

          {/* City and County */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.billing_city}
                onChange={(e) => handleChange('billing_city', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="London"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                County/State
              </label>
              <input
                type="text"
                value={formData.billing_state_province}
                onChange={(e) => handleChange('billing_state_province', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Greater London (optional)"
              />
            </div>
          </div>

          {/* Postcode and Country */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Postcode <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.billing_postal_code}
                onChange={(e) => handleChange('billing_postal_code', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="SW1A 1AA"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.billing_country}
                onChange={(e) => handleChange('billing_country', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="GB">United Kingdom</option>
                <option value="IE">Ireland</option>
                <option value="FR">France</option>
                <option value="DE">Germany</option>
                <option value="ES">Spain</option>
                <option value="IT">Italy</option>
                <option value="NL">Netherlands</option>
                <option value="BE">Belgium</option>
                <option value="US">United States</option>
                <option value="CA">Canada</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
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
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Billing Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
