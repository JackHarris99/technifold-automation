'use client';

import { useState, useEffect } from 'react';
import { verifyVATNumber, isEUCountry, type VATVerificationResult } from '@/lib/vat-helpers';
import CountrySelect from '@/components/shared/CountrySelect';

interface PortalAddressCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
  token?: string; // Optional - if not provided, uses JWT auth (for distributors)
  onSuccess: () => void;
}

interface AddressFormData {
  // Billing address (required)
  billing_address_line_1: string;
  billing_address_line_2: string;
  billing_city: string;
  billing_state_province: string;
  billing_postal_code: string;
  billing_country: string;
  vat_number: string;

  // Shipping address (optional - can use billing)
  use_billing_for_shipping: boolean;
  shipping_address_line_1: string;
  shipping_address_line_2: string;
  shipping_city: string;
  shipping_state_province: string;
  shipping_postal_code: string;
  shipping_country: string;
}

export default function PortalAddressCollectionModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  token,
  onSuccess,
}: PortalAddressCollectionModalProps) {
  const [formData, setFormData] = useState<AddressFormData>({
    billing_address_line_1: '',
    billing_address_line_2: '',
    billing_city: '',
    billing_state_province: '',
    billing_postal_code: '',
    billing_country: 'GB',
    vat_number: '',
    use_billing_for_shipping: true,
    shipping_address_line_1: '',
    shipping_address_line_2: '',
    shipping_city: '',
    shipping_state_province: '',
    shipping_postal_code: '',
    shipping_country: 'GB',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [vatVerificationResult, setVatVerificationResult] = useState<VATVerificationResult | null>(null);
  const [isVerifyingVAT, setIsVerifyingVAT] = useState(false);

  const isEU = isEUCountry(formData.billing_country);
  const requiresVAT = isEU;

  // Auto-verify VAT when user finishes typing
  useEffect(() => {
    if (!requiresVAT || !formData.vat_number.trim()) {
      setVatVerificationResult(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsVerifyingVAT(true);
      const result = await verifyVATNumber(formData.billing_country, formData.vat_number);
      setVatVerificationResult(result);
      setIsVerifyingVAT(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [formData.vat_number, formData.billing_country, requiresVAT]);

  const handleChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate VAT number for EU companies
      if (requiresVAT) {
        if (!formData.vat_number.trim()) {
          // No VAT number provided for EU company
          const proceedAnyway = confirm(
            'WARNING: No VAT number provided.\n\n20% UK VAT will be charged on all orders.\n\nWe strongly recommend adding your VAT number to qualify for 0% reverse charge.\n\nDo you want to continue without a VAT number?'
          );
          if (!proceedAnyway) {
            setIsSubmitting(false);
            return;
          }
        } else if (!vatVerificationResult || !vatVerificationResult.valid) {
          // VAT number provided but not verified
          const proceedAnyway = confirm(
            'VAT Verification Notice:\n\nYour VAT number could not be verified automatically (this may be due to the EU verification system being temporarily unavailable).\n\nYour VAT number will still be saved and used for orders. Our team will verify it manually.\n\nDo you want to proceed?'
          );
          if (!proceedAnyway) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Determine which endpoints to use based on token presence
      const useDistributorEndpoints = !token;

      // 1. Update company billing address and VAT number
      const billingEndpoint = useDistributorEndpoints
        ? `/api/distributor/company-details`
        : `/api/portal/update-billing`;

      const billingPayload = useDistributorEndpoints
        ? {
            billing_address_line_1: formData.billing_address_line_1,
            billing_address_line_2: formData.billing_address_line_2,
            billing_city: formData.billing_city,
            billing_state_province: formData.billing_state_province,
            billing_postal_code: formData.billing_postal_code,
            billing_country: formData.billing_country,
            vat_number: formData.vat_number || null,
          }
        : {
            token,
            billing_address_line_1: formData.billing_address_line_1,
            billing_address_line_2: formData.billing_address_line_2,
            billing_city: formData.billing_city,
            billing_state_province: formData.billing_state_province,
            billing_postal_code: formData.billing_postal_code,
            billing_country: formData.billing_country,
            vat_number: formData.vat_number || null,
          };

      const billingResponse = await fetch(billingEndpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(billingPayload),
      });

      if (!billingResponse.ok) {
        const data = await billingResponse.json();
        throw new Error(data.error || 'Failed to save billing address');
      }

      // 2. Create shipping address
      const shippingEndpoint = useDistributorEndpoints
        ? `/api/distributor/shipping-addresses`
        : `/api/portal/create-shipping-address`;

      const shippingData = formData.use_billing_for_shipping
        ? {
            address_line_1: formData.billing_address_line_1,
            address_line_2: formData.billing_address_line_2,
            city: formData.billing_city,
            state_province: formData.billing_state_province,
            postal_code: formData.billing_postal_code,
            country: formData.billing_country,
          }
        : {
            address_line_1: formData.shipping_address_line_1,
            address_line_2: formData.shipping_address_line_2,
            city: formData.shipping_city,
            state_province: formData.shipping_state_province,
            postal_code: formData.shipping_postal_code,
            country: formData.shipping_country,
          };

      const shippingPayload = useDistributorEndpoints
        ? { ...shippingData, is_default: true }
        : { token, ...shippingData };

      const shippingResponse = await fetch(shippingEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shippingPayload),
      });

      if (!shippingResponse.ok) {
        const data = await shippingResponse.json();
        throw new Error(data.error || 'Failed to save shipping address');
      }

      // Success!
      onSuccess();
    } catch (err: any) {
      console.error('[PortalAddressCollection] Error:', err);
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
        // Close if clicking the backdrop
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* PROMINENT WARNING: Why this modal appeared */}
          <div className="bg-red-50 border-2 border-red-400 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-red-900 flex items-center gap-2 mb-2">
              <span className="text-2xl">🚫</span> Action Required to Place Orders
            </h3>
            <p className="text-sm text-red-800 font-semibold">
              You cannot place orders until you complete BOTH your billing address and shipping address below.
            </p>
            <p className="text-sm text-red-700 mt-1">
              This information is required for tax calculation and delivery of your products.
            </p>
          </div>

          <h2 className="text-2xl font-semibold">Complete Your Addresses</h2>
          <p className="text-sm text-gray-800 mt-2">
            Fill in your company's billing and delivery addresses to enable order placement.
          </p>
          <p className="text-sm text-gray-700 mt-1 font-medium">{companyName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Important Notice */}
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
              <span className="text-xl">ℹ️</span> Required Information
            </h4>
            <p className="text-sm text-blue-800">
              All fields marked with <span className="text-red-600 font-bold text-lg">*</span> are <strong>required</strong> before you can place orders.
            </p>
            <p className="text-sm text-blue-800 mt-1">
              Complete billing and shipping addresses are needed for tax calculation and delivery.
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border-2 border-red-400 text-red-700 px-4 py-3 rounded-lg">
              <p className="font-bold">Error:</p>
              <p>{error}</p>
            </div>
          )}

          {/* Billing Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Billing Address
            </h3>
            <p className="text-sm text-gray-800">
              Your company's official registered address for invoicing.
            </p>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.billing_address_line_1}
                  onChange={(e) => handleChange('billing_address_line_1', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="123 Business Street"
                  required
                />
              </div>

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
                  <CountrySelect
                    value={formData.billing_country}
                    onChange={(value) => handleChange('billing_country', value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* VAT Number (EU only) - PROMINENT SECTION */}
              {requiresVAT && (
                <div className="bg-amber-50 border-2 border-amber-300 rounded-lg p-4">
                  <label className="block text-base font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-amber-600">⚠</span>
                    VAT Number <span className="text-red-600 text-lg">*</span>
                    <span className="text-xs font-normal text-amber-700 ml-2">(Required for EU companies)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.vat_number}
                    onChange={(e) => handleChange('vat_number', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border-2 border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-base"
                    placeholder={`${formData.billing_country}123456789`}
                  />
                  <p className="text-sm text-amber-900 mt-2 font-medium">
                    💡 Without a valid VAT number, 20% UK VAT will be charged on your orders.
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    Format: {formData.billing_country}123456789
                  </p>

                  {isVerifyingVAT && (
                    <p className="text-sm text-blue-600 mt-2">⏳ Verifying VAT number...</p>
                  )}

                  {vatVerificationResult && !isVerifyingVAT && (
                    <div className={`mt-3 p-4 rounded-lg border-2 ${vatVerificationResult.valid ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-400'}`}>
                      {vatVerificationResult.valid ? (
                        <div>
                          <p className="text-base font-bold text-green-700 flex items-center gap-2">
                            <span className="text-xl">✓</span> VAT Number Verified Successfully
                          </p>
                          {vatVerificationResult.companyName && (
                            <p className="text-sm text-green-600 mt-1 font-medium">Company: {vatVerificationResult.companyName}</p>
                          )}
                          <p className="text-sm text-green-700 mt-2 font-semibold">
                            ✓ 0% VAT will be applied (EU Reverse Charge)
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-base font-bold text-amber-700 flex items-center gap-2">
                            <span className="text-xl">⚠</span> Automatic Verification Unavailable
                          </p>
                          <p className="text-sm text-amber-600 mt-2 font-medium">{vatVerificationResult.error}</p>
                          <p className="text-sm text-amber-800 mt-3 font-semibold bg-amber-100 p-3 rounded border border-amber-300">
                            ℹ️ The EU VAT verification system is temporarily unavailable. Your VAT number will be saved and verified manually by our team. If valid, 0% reverse charge VAT will apply to your orders.
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
                            If your VAT number is incorrect, you can update it later in your account settings.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Shipping Address Section */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
              Delivery Address <span className="text-red-600 text-lg ml-2">*</span>
            </h3>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
              <p className="text-sm text-blue-900 font-semibold">
                📦 You must provide a delivery address (or check the box below to use your billing address)
              </p>
            </div>

            <div className="flex items-center gap-2 bg-gray-50 p-3 rounded-lg border-2 border-gray-300">
              <input
                type="checkbox"
                id="use_billing"
                checked={formData.use_billing_for_shipping}
                onChange={(e) => handleChange('use_billing_for_shipping', e.target.checked)}
                className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="use_billing" className="text-sm font-semibold text-gray-900">
                ✓ Ship to billing address (same as above)
              </label>
            </div>

            {!formData.use_billing_for_shipping && (
              <div className="grid grid-cols-1 gap-4 pl-6 border-l-2 border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 1 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.shipping_address_line_1}
                    onChange={(e) => handleChange('shipping_address_line_1', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Delivery address"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Address Line 2
                  </label>
                  <input
                    type="text"
                    value={formData.shipping_address_line_2}
                    onChange={(e) => handleChange('shipping_address_line_2', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Optional"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.shipping_city}
                      onChange={(e) => handleChange('shipping_city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      County/State
                    </label>
                    <input
                      type="text"
                      value={formData.shipping_state_province}
                      onChange={(e) => handleChange('shipping_state_province', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postcode <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.shipping_postal_code}
                      onChange={(e) => handleChange('shipping_postal_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country <span className="text-red-500">*</span>
                    </label>
                    <CountrySelect
                      value={formData.shipping_country}
                      onChange={(value) => handleChange('shipping_country', value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
