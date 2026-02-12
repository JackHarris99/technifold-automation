'use client';

import { useState, useEffect } from 'react';
import CountrySelect from '@/components/shared/CountrySelect';

interface AddDeliveryAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  token?: string; // Optional - if not provided, uses JWT auth (for distributors)
  onSuccess: () => void;
}

interface DeliveryAddressForm {
  address_line_1: string;
  address_line_2: string;
  city: string;
  state_province: string;
  postal_code: string;
  country: string;
  label: string;
  is_default: boolean;
}

interface BillingAddress {
  billing_address_line_1: string | null;
  billing_address_line_2: string | null;
  billing_city: string | null;
  billing_state_province: string | null;
  billing_postal_code: string | null;
  billing_country: string | null;
}

export default function AddDeliveryAddressModal({
  isOpen,
  onClose,
  companyId,
  token,
  onSuccess,
}: AddDeliveryAddressModalProps) {
  const [formData, setFormData] = useState<DeliveryAddressForm>({
    address_line_1: '',
    address_line_2: '',
    city: '',
    state_province: '',
    postal_code: '',
    country: 'GB',
    label: '',
    is_default: false,
  });

  const [copyFromBilling, setCopyFromBilling] = useState(false);
  const [billingAddress, setBillingAddress] = useState<BillingAddress | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingBilling, setIsLoadingBilling] = useState(true);

  // Load billing address when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadBillingAddress() {
      setIsLoadingBilling(true);
      try {
        const useDistributorEndpoints = !token;

        // Fetch company billing address
        const endpoint = useDistributorEndpoints
          ? `/api/distributor/company-details`
          : `/api/portal/company-details?token=${encodeURIComponent(token!)}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.success && data.company) {
          setBillingAddress({
            billing_address_line_1: data.company.billing_address_line_1,
            billing_address_line_2: data.company.billing_address_line_2,
            billing_city: data.company.billing_city,
            billing_state_province: data.company.billing_state_province,
            billing_postal_code: data.company.billing_postal_code,
            billing_country: data.company.billing_country,
          });
        }
      } catch (err) {
        console.error('[AddDeliveryAddressModal] Failed to load billing address:', err);
      } finally {
        setIsLoadingBilling(false);
      }
    }

    loadBillingAddress();
  }, [isOpen, token]);

  // Handle "Copy from Billing" checkbox
  const handleCopyFromBilling = (checked: boolean) => {
    setCopyFromBilling(checked);

    if (checked && billingAddress) {
      // IMMEDIATELY populate fields (user sees them)
      setFormData({
        address_line_1: billingAddress.billing_address_line_1 || '',
        address_line_2: billingAddress.billing_address_line_2 || '',
        city: billingAddress.billing_city || '',
        state_province: billingAddress.billing_state_province || '',
        postal_code: billingAddress.billing_postal_code || '',
        country: billingAddress.billing_country || 'GB',
        label: 'Main Office',
        is_default: true,
      });
    } else {
      // Clear fields
      setFormData({
        address_line_1: '',
        address_line_2: '',
        city: '',
        state_province: '',
        postal_code: '',
        country: 'GB',
        label: '',
        is_default: false,
      });
    }
  };

  const handleChange = (field: keyof DeliveryAddressForm, value: string | boolean) => {
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
        ? `/api/distributor/shipping-addresses`
        : `/api/customer/addresses`;

      const payload = useDistributorEndpoints
        ? {
            address_line_1: formData.address_line_1,
            address_line_2: formData.address_line_2,
            city: formData.city,
            state_province: formData.state_province,
            postal_code: formData.postal_code,
            country: formData.country,
            label: formData.label || null,
            is_default: formData.is_default,
          }
        : {
            token,
            address_line_1: formData.address_line_1,
            address_line_2: formData.address_line_2,
            city: formData.city,
            state_province: formData.state_province,
            postal_code: formData.postal_code,
            country: formData.country,
            label: formData.label || null,
            is_default: formData.is_default,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save delivery address');
      }

      // Success!
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[AddDeliveryAddressModal] Error:', err);
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
        if (isSubmitting) return;
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

          <h2 className="text-2xl font-semibold">Add Delivery Address</h2>
          <p className="text-sm text-gray-600 mt-2">
            Create a new shipping/delivery address for your orders
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loading billing address */}
          {isLoadingBilling && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
              <div className="inline-block animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              <span className="text-sm font-semibold text-blue-900">Loading billing address...</span>
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
                  <p className="text-sm font-bold text-green-900">Saving delivery address...</p>
                  <p className="text-xs text-green-700 mt-1">Please wait.</p>
                </div>
              </div>
            </div>
          )}

          {/* Copy from Billing checkbox */}
          {!isLoadingBilling && billingAddress && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  id="copy_from_billing"
                  checked={copyFromBilling}
                  onChange={(e) => handleCopyFromBilling(e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 mt-0.5"
                  disabled={isSubmitting}
                />
                <div className="flex-1">
                  <label htmlFor="copy_from_billing" className="text-sm font-bold text-blue-900 cursor-pointer">
                    📋 Copy from Billing Address
                  </label>
                  <p className="text-xs text-blue-700 mt-1">
                    Fields will populate instantly. You can review and edit them before saving.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Address fields */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Label (optional)
              </label>
              <input
                type="text"
                value={formData.label}
                onChange={(e) => handleChange('label', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder='e.g., "Warehouse", "Head Office"'
                disabled={isLoadingBilling || isSubmitting}
              />
              <p className="text-xs text-gray-600 mt-1">Give this address a memorable name</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Address Line 1
              </label>
              <input
                type="text"
                value={formData.address_line_1}
                onChange={(e) => handleChange('address_line_1', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="123 Business Street"
                disabled={isLoadingBilling || isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Address Line 2 (optional)
              </label>
              <input
                type="text"
                value={formData.address_line_2}
                onChange={(e) => handleChange('address_line_2', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                placeholder="Suite 100"
                disabled={isLoadingBilling || isSubmitting}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => handleChange('city', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="London"
                  disabled={isLoadingBilling || isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  County/State (optional)
                </label>
                <input
                  type="text"
                  value={formData.state_province}
                  onChange={(e) => handleChange('state_province', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Greater London"
                  disabled={isLoadingBilling || isSubmitting}
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
                  value={formData.postal_code}
                  onChange={(e) => handleChange('postal_code', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="SW1A 1AA"
                  disabled={isLoadingBilling || isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Country <span className="text-red-500">*</span>
                </label>
                <CountrySelect
                  value={formData.country}
                  onChange={(value) => handleChange('country', value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                  disabled={isLoadingBilling || isSubmitting}
                />
              </div>
            </div>

            {/* Set as default */}
            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border border-gray-300">
              <input
                type="checkbox"
                id="is_default"
                checked={formData.is_default}
                onChange={(e) => handleChange('is_default', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isSubmitting}
              />
              <label htmlFor="is_default" className="text-sm text-gray-900">
                Set as default delivery address
              </label>
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
              disabled={isLoadingBilling || isSubmitting}
            >
              {isLoadingBilling ? 'Loading...' : isSubmitting ? 'Saving...' : 'Add Delivery Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
