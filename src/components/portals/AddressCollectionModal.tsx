'use client';

import { useState, useEffect } from 'react';
import { verifyVATNumber, isEUCountry, type VATVerificationResult } from '@/lib/vat-helpers';

interface AddressCollectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  companyName: string;
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

export default function AddressCollectionModal({
  isOpen,
  onClose,
  companyId,
  companyName,
  onSuccess,
}: AddressCollectionModalProps) {
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
    }, 1000); // Verify 1 second after user stops typing

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
      if (requiresVAT && formData.vat_number.trim()) {
        if (!vatVerificationResult || !vatVerificationResult.valid) {
          // User can proceed but show warning
          const proceedAnyway = confirm(
            'VAT number could not be verified. If you proceed, UK VAT (20%) will be applied. Do you want to continue?'
          );
          if (!proceedAnyway) {
            setIsSubmitting(false);
            return;
          }
        }
      }

      // 1. Update company billing address and VAT number
      const billingResponse = await fetch(`/api/admin/companies/${companyId}/update-billing`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          billing_address_line_1: formData.billing_address_line_1,
          billing_address_line_2: formData.billing_address_line_2,
          billing_city: formData.billing_city,
          billing_state_province: formData.billing_state_province,
          billing_postal_code: formData.billing_postal_code,
          billing_country: formData.billing_country,
          vat_number: formData.vat_number || null,
        }),
      });

      if (!billingResponse.ok) {
        const data = await billingResponse.json();
        throw new Error(data.error || 'Failed to save billing address');
      }

      // 2. Create shipping address (if different from billing)
      if (!formData.use_billing_for_shipping) {
        const shippingResponse = await fetch(`/api/admin/shipping-addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: companyId,
            address_line_1: formData.shipping_address_line_1,
            address_line_2: formData.shipping_address_line_2,
            city: formData.shipping_city,
            state_province: formData.shipping_state_province,
            postal_code: formData.shipping_postal_code,
            country: formData.shipping_country,
            is_default: true,
          }),
        });

        if (!shippingResponse.ok) {
          const data = await shippingResponse.json();
          throw new Error(data.error || 'Failed to save shipping address');
        }
      } else {
        // Use billing address as shipping address
        const shippingResponse = await fetch(`/api/admin/shipping-addresses`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            company_id: companyId,
            address_line_1: formData.billing_address_line_1,
            address_line_2: formData.billing_address_line_2,
            city: formData.billing_city,
            state_province: formData.billing_state_province,
            postal_code: formData.billing_postal_code,
            country: formData.billing_country,
            is_default: true,
          }),
        });

        if (!shippingResponse.ok) {
          const data = await shippingResponse.json();
          throw new Error(data.error || 'Failed to save shipping address');
        }
      }

      // Success!
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[AddressCollection] Error:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-semibold">Company Address Required</h2>
          <p className="text-sm text-gray-600 mt-2">
            Before creating your invoice, we need your company's billing address to calculate tax and shipping correctly.
          </p>
          <p className="text-sm text-gray-500 mt-1">{companyName}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Billing Address Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span className="bg-blue-600 text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
              Billing Address (Company Registered Address)
            </h3>
            <p className="text-sm text-gray-600">
              This is your company's official registered address, used for tax and invoicing purposes.
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
                    <option value="AT">Austria</option>
                    <option value="PL">Poland</option>
                    <option value="SE">Sweden</option>
                    <option value="DK">Denmark</option>
                    <option value="FI">Finland</option>
                    <option value="US">United States</option>
                    <option value="CA">Canada</option>
                    <option value="AU">Australia</option>
                  </select>
                </div>
              </div>

              {/* VAT Number (EU only) */}
              {requiresVAT && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    VAT Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.vat_number}
                    onChange={(e) => handleChange('vat_number', e.target.value.toUpperCase())}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder={`${formData.billing_country}123456789`}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Required for EU companies to apply 0% reverse charge. Format: {formData.billing_country}123456789
                  </p>

                  {isVerifyingVAT && (
                    <p className="text-sm text-blue-600 mt-2">⏳ Verifying VAT number...</p>
                  )}

                  {vatVerificationResult && !isVerifyingVAT && (
                    <div className={`mt-2 p-3 rounded-lg ${vatVerificationResult.valid ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
                      {vatVerificationResult.valid ? (
                        <div>
                          <p className="text-sm font-medium text-green-700">✓ VAT Number Verified</p>
                          {vatVerificationResult.companyName && (
                            <p className="text-xs text-green-600 mt-1">Company: {vatVerificationResult.companyName}</p>
                          )}
                          <p className="text-xs text-green-600 mt-1">0% VAT will be applied (EU Reverse Charge)</p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-sm font-medium text-yellow-700">⚠ VAT Number Not Verified</p>
                          <p className="text-xs text-yellow-600 mt-1">{vatVerificationResult.error}</p>
                          <p className="text-xs text-yellow-600 mt-1">
                            If you proceed, UK VAT (20%) will be applied to your invoice.
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

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="use_billing"
                checked={formData.use_billing_for_shipping}
                onChange={(e) => handleChange('use_billing_for_shipping', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="use_billing" className="text-sm font-medium text-gray-700">
                Ship to billing address (same as above)
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
                    <select
                      value={formData.shipping_country}
                      onChange={(e) => handleChange('shipping_country', e.target.value)}
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
                      <option value="AT">Austria</option>
                      <option value="PL">Poland</option>
                      <option value="SE">Sweden</option>
                      <option value="DK">Denmark</option>
                      <option value="FI">Finland</option>
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="AU">Australia</option>
                    </select>
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
              className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium"
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
