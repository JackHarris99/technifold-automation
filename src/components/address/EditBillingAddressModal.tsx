'use client';

import { useState, useEffect } from 'react';
import CountrySelect from '@/components/shared/CountrySelect';

interface EditBillingAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  token?: string; // Optional - if not provided, uses JWT auth (for distributors)
  onSuccess: () => void;
}

interface BillingAddressForm {
  billing_address_line_1: string;
  billing_address_line_2: string;
  billing_city: string;
  billing_state_province: string;
  billing_postal_code: string;
  billing_country: string;
}

export default function EditBillingAddressModal({
  isOpen,
  onClose,
  companyId,
  token,
  onSuccess,
}: EditBillingAddressModalProps) {
  const [formData, setFormData] = useState<BillingAddressForm>({
    billing_address_line_1: '',
    billing_address_line_2: '',
    billing_city: '',
    billing_state_province: '',
    billing_postal_code: '',
    billing_country: 'GB',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  // Load existing billing address when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadExistingData() {
      setIsLoadingExisting(true);
      try {
        const useDistributorEndpoints = !token;

        // Fetch company billing address
        const endpoint = useDistributorEndpoints
          ? `/api/distributor/company-details`
          : `/api/portal/company-details?token=${encodeURIComponent(token!)}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.success && data.company) {
          const company = data.company;

          // Pre-fill billing address if exists
          setFormData({
            billing_address_line_1: company.billing_address_line_1 || '',
            billing_address_line_2: company.billing_address_line_2 || '',
            billing_city: company.billing_city || '',
            billing_state_province: company.billing_state_province || '',
            billing_postal_code: company.billing_postal_code || '',
            billing_country: company.billing_country || 'GB',
          });
        }
      } catch (err) {
        console.error('[EditBillingAddressModal] Failed to load existing data:', err);
      } finally {
        setIsLoadingExisting(false);
      }
    }

    loadExistingData();
  }, [isOpen, token]);

  const handleChange = (field: keyof BillingAddressForm, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Determine which endpoint to use based on token presence
      const useDistributorEndpoints = !token;

      const endpoint = useDistributorEndpoints
        ? `/api/distributor/company-details`
        : `/api/portal/update-billing`;

      const payload = useDistributorEndpoints
        ? {
            billing_address_line_1: formData.billing_address_line_1,
            billing_address_line_2: formData.billing_address_line_2,
            billing_city: formData.billing_city,
            billing_state_province: formData.billing_state_province,
            billing_postal_code: formData.billing_postal_code,
            billing_country: formData.billing_country,
          }
        : {
            token,
            billing_address_line_1: formData.billing_address_line_1,
            billing_address_line_2: formData.billing_address_line_2,
            billing_city: formData.billing_city,
            billing_state_province: formData.billing_state_province,
            billing_postal_code: formData.billing_postal_code,
            billing_country: formData.billing_country,
          };

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save billing address');
      }

      // Success!
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[EditBillingAddressModal] Error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4"
      onClick={(e) => {
        // Prevent closing if submitting
        if (isSubmitting) return;
        // Close if clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 relative">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <h2 className="text-2xl font-semibold">Edit Billing Address</h2>
          <p className="text-sm text-gray-600 mt-2">
            Your company's official registered address for invoicing
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loading existing data */}
          {isLoadingExisting && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
              <div className="inline-block animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              <span className="text-sm font-semibold text-blue-900">Loading your address...</span>
            </div>
          )}

          {/* Information box */}
          {!isLoadingExisting && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-xl">ℹ️</span> Country Required for Pricing
              </h4>
              <p className="text-sm text-blue-800">
                Only <span className="text-red-600 font-bold">country</span> is required for tax and shipping calculations. All other fields are optional but help ensure accurate invoicing.
              </p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Submitting indicator */}
          {isSubmitting && (
            <div className="bg-green-50 border-2 border-green-400 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="inline-block animate-spin h-6 w-6 border-3 border-green-600 border-t-transparent rounded-full"></div>
                <div>
                  <p className="text-sm font-bold text-green-900">Saving your address...</p>
                  <p className="text-xs text-green-700 mt-1">Please wait.</p>
                </div>
              </div>
            </div>
          )}

          {/* Address fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.billing_address_line_1}
                onChange={(e) => handleChange('billing_address_line_1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="123 Business Street (optional)"
                disabled={isLoadingExisting || isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Address Line 2
              </label>
              <input
                type="text"
                value={formData.billing_address_line_2}
                onChange={(e) => handleChange('billing_address_line_2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Suite 100 (optional)"
                disabled={isLoadingExisting || isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.billing_city}
                  onChange={(e) => handleChange('billing_city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="London (optional)"
                  disabled={isLoadingExisting || isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  County/State
                </label>
                <input
                  type="text"
                  value={formData.billing_state_province}
                  onChange={(e) => handleChange('billing_state_province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Greater London (optional)"
                  disabled={isLoadingExisting || isSubmitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Postcode
                </label>
                <input
                  type="text"
                  value={formData.billing_postal_code}
                  onChange={(e) => handleChange('billing_postal_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="SW1A 1AA (optional)"
                  disabled={isLoadingExisting || isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <CountrySelect
                  value={formData.billing_country}
                  onChange={(value) => handleChange('billing_country', value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={isLoadingExisting || isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoadingExisting || isSubmitting}
            >
              {isLoadingExisting ? 'Loading...' : isSubmitting ? 'Saving...' : 'Save Billing Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
