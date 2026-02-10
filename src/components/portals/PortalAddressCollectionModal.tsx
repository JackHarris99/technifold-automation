'use client';

import { useState, useEffect } from 'react';
import { isEUCountry, type VATVerificationResult } from '@/lib/vat-helpers';
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
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);

  const isEU = isEUCountry(formData.billing_country);
  const requiresVAT = isEU;

  // Load existing company data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadExistingData() {
      setIsLoadingExisting(true);
      try {
        const useDistributorEndpoints = !token;

        // Fetch company details (billing address & VAT)
        const companyEndpoint = useDistributorEndpoints
          ? `/api/distributor/company-details`
          : `/api/portal/company-details?token=${encodeURIComponent(token!)}`;

        const companyResponse = await fetch(companyEndpoint);
        const companyData = await companyResponse.json();

        // Check if shipping addresses exist
        const shippingEndpoint = useDistributorEndpoints
          ? `/api/distributor/shipping-addresses`
          : `/api/portal/shipping-address?token=${encodeURIComponent(token!)}`;

        const shippingResponse = await fetch(shippingEndpoint);
        const shippingData = await shippingResponse.json();
        const hasShippingAddresses = shippingData.success && shippingData.addresses && shippingData.addresses.length > 0;

        if (companyData.success && companyData.company) {
          const company = companyData.company;

          // Pre-fill billing address if exists
          if (company.billing_address_line_1) {
            setFormData(prev => ({
              ...prev,
              billing_address_line_1: company.billing_address_line_1 || '',
              billing_address_line_2: company.billing_address_line_2 || '',
              billing_city: company.billing_city || '',
              billing_state_province: company.billing_state_province || '',
              billing_postal_code: company.billing_postal_code || '',
              billing_country: company.billing_country || 'GB',
              vat_number: company.vat_number || '',
              // Auto-copy billing to shipping if no shipping addresses exist
              use_billing_for_shipping: !hasShippingAddresses,
              shipping_address_line_1: hasShippingAddresses ? '' : (company.billing_address_line_1 || ''),
              shipping_address_line_2: hasShippingAddresses ? '' : (company.billing_address_line_2 || ''),
              shipping_city: hasShippingAddresses ? '' : (company.billing_city || ''),
              shipping_state_province: hasShippingAddresses ? '' : (company.billing_state_province || ''),
              shipping_postal_code: hasShippingAddresses ? '' : (company.billing_postal_code || ''),
              shipping_country: hasShippingAddresses ? 'GB' : (company.billing_country || 'GB'),
            }));
          }
        }
      } catch (err) {
        console.error('[PortalAddressCollectionModal] Failed to load existing data:', err);
      } finally {
        setIsLoadingExisting(false);
      }
    }

    loadExistingData();
  }, [isOpen, token]);

  // Auto-verify VAT when user finishes typing
  useEffect(() => {
    if (!requiresVAT || !formData.vat_number.trim()) {
      setVatVerificationResult(null);
      return;
    }

    const timeoutId = setTimeout(async () => {
      setIsVerifyingVAT(true);

      try {
        // Call backend API to verify VAT (avoids CORS issues)
        const response = await fetch('/api/vat/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            countryCode: formData.billing_country,
            vatNumber: formData.vat_number,
          }),
        });

        const result = await response.json();
        setVatVerificationResult(result);
      } catch (error) {
        console.error('[VAT Verification] Error:', error);
        setVatVerificationResult({
          valid: false,
          error: 'VAT verification service unavailable',
          errorCode: 'SERVICE_UNAVAILABLE',
        });
      }

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
      // VAT validation is now non-blocking - warnings are shown in the UI
      // The VAT number (if provided) will be saved and verified manually if needed

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
        // Prevent closing if submitting
        if (isSubmitting) return;
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
            disabled={isSubmitting}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            type="button"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* PROMINENT WARNING: Why this modal appeared */}
          <div className="bg-blue-50 border-2 border-blue-400 rounded-lg p-4 mb-4">
            <h3 className="text-lg font-bold text-blue-900 flex items-center gap-2 mb-2">
              <span className="text-2xl">🌍</span> Country Required for Pricing
            </h3>
            <p className="text-sm text-blue-800 font-semibold">
              We need your billing and shipping country to calculate tax and shipping costs.
            </p>
            <p className="text-sm text-blue-700 mt-1">
              Other address details are optional but appreciated for smoother delivery.
            </p>
          </div>

          <h2 className="text-2xl font-semibold">Confirm Your Country</h2>
          <p className="text-sm text-gray-800 mt-2">
            Country is required for pricing. Other fields are optional but help us deliver to you efficiently.
          </p>
          <p className="text-sm text-gray-900 mt-1 font-medium">{companyName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loading existing data */}
          {isLoadingExisting && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
              <div className="inline-block animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              <span className="text-sm font-semibold text-blue-900">Loading your existing details...</span>
            </div>
          )}

          {/* Important Notice */}
          {!isLoadingExisting && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
              <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                <span className="text-xl">ℹ️</span> What's Required
              </h4>
              <p className="text-sm text-blue-800">
                Only fields marked with <span className="text-red-600 font-bold text-lg">*</span> are required. Country is needed for tax and shipping calculations.
              </p>
              <p className="text-sm text-blue-800 mt-1">
                Other details are optional but help ensure smooth delivery.
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
                  <p className="text-sm font-bold text-green-900">Saving your details...</p>
                  <p className="text-xs text-green-700 mt-1">Please wait, do not close this window.</p>
                </div>
              </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Suite 100 (optional)"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="London (optional)"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Greater London (optional)"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="SW1A 1AA (optional)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
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
                    VAT Number (Strongly Recommended)
                  </label>
                  <input
                    type="text"
                    value={formData.vat_number}
                    onChange={(e) => handleChange('vat_number', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border-2 border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 font-mono text-base"
                    placeholder={`${formData.billing_country}123456789`}
                  />
                  <p className="text-sm text-amber-900 mt-2 font-medium">
                    💡 With a valid VAT number: 0% VAT (reverse charge). Without it: 20% UK VAT will be charged.
                  </p>
                  <p className="text-xs text-gray-900 mt-1">
                    Format: {formData.billing_country}123456789 (we'll verify it automatically)
                  </p>

                  {isVerifyingVAT && (
                    <p className="text-sm text-blue-600 mt-2">⏳ Verifying VAT number...</p>
                  )}

                  {vatVerificationResult && !isVerifyingVAT && (
                    <div className={`mt-3 p-4 rounded-lg border-2 ${vatVerificationResult.valid ? 'bg-green-50 border-green-500' : 'bg-blue-50 border-blue-400'}`}>
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
                          <p className="text-base font-bold text-blue-800 flex items-center gap-2">
                            <span className="text-xl">ℹ️</span> Automatic Verification Temporarily Unavailable
                          </p>
                          <p className="text-sm text-blue-700 mt-2">
                            The EU VIES system couldn't verify your VAT number right now (this is common and not a problem).
                          </p>
                          <p className="text-sm text-blue-800 mt-2 font-medium bg-blue-100 p-3 rounded border border-blue-300">
                            ✓ You can proceed - your VAT number will be saved and verified manually within 24 hours. If valid, 0% reverse charge VAT will apply to all your orders.
                          </p>
                          <p className="text-xs text-gray-600 mt-2">
                            Technical details: {vatVerificationResult.error}
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
              Delivery Address
            </h3>

            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-3">
              <p className="text-sm text-blue-900 font-semibold">
                📦 Delivery country is required. Other details are optional.
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
                  <label className="block text-sm font-medium text-gray-900 mb-1">
                    Address Line 1
                  </label>
                  <input
                    type="text"
                    value={formData.shipping_address_line_1}
                    onChange={(e) => handleChange('shipping_address_line_1', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Delivery address (optional)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-900 mb-1">
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
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      value={formData.shipping_city}
                      onChange={(e) => handleChange('shipping_city', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
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
                    <label className="block text-sm font-medium text-gray-900 mb-1">
                      Postcode
                    </label>
                    <input
                      type="text"
                      value={formData.shipping_postal_code}
                      onChange={(e) => handleChange('shipping_postal_code', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-900 mb-1">
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
              {isLoadingExisting ? 'Loading...' : isSubmitting ? 'Saving...' : 'Save and Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
