'use client';

import { useState, useEffect } from 'react';
import { isEUCountry, type VATVerificationResult } from '@/lib/vat-helpers';

interface EditVATNumberModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  token?: string; // Optional - if not provided, uses JWT auth (for distributors)
  onSuccess: () => void;
}

export default function EditVATNumberModal({
  isOpen,
  onClose,
  companyId,
  token,
  onSuccess,
}: EditVATNumberModalProps) {
  const [vatNumber, setVatNumber] = useState('');
  const [billingCountry, setBillingCountry] = useState('GB');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoadingExisting, setIsLoadingExisting] = useState(true);
  const [vatVerificationResult, setVatVerificationResult] = useState<VATVerificationResult | null>(null);
  const [isVerifyingVAT, setIsVerifyingVAT] = useState(false);

  const isEU = isEUCountry(billingCountry);

  // Load existing VAT number when modal opens
  useEffect(() => {
    if (!isOpen) return;

    async function loadExistingData() {
      setIsLoadingExisting(true);
      try {
        const useDistributorEndpoints = !token;

        // Fetch company details
        const endpoint = useDistributorEndpoints
          ? `/api/distributor/company-details`
          : `/api/portal/company-details?token=${encodeURIComponent(token!)}`;

        const response = await fetch(endpoint);
        const data = await response.json();

        if (data.success && data.company) {
          const company = data.company;
          setVatNumber(company.vat_number || '');
          setBillingCountry(company.billing_country || 'GB');
        }
      } catch (err) {
        console.error('[EditVATNumberModal] Failed to load existing data:', err);
      } finally {
        setIsLoadingExisting(false);
      }
    }

    loadExistingData();
  }, [isOpen, token]);

  // Auto-verify VAT when user finishes typing
  useEffect(() => {
    if (!isEU || !vatNumber.trim()) {
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
            countryCode: billingCountry,
            vatNumber: vatNumber,
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
  }, [vatNumber, billingCountry, isEU]);

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
        ? { vat_number: vatNumber || null }
        : { token, vat_number: vatNumber || null };

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save VAT number');
      }

      // Success!
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error('[EditVATNumberModal] Error:', err);
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
      <div className="bg-white rounded-lg shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
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

          <h2 className="text-2xl font-semibold">Edit VAT Number</h2>
          <p className="text-sm text-gray-600 mt-2">
            {isEU ? 'Optional but recommended for EU companies' : 'Not applicable for non-EU companies'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Loading existing data */}
          {isLoadingExisting && (
            <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 text-center">
              <div className="inline-block animate-spin h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full mr-2"></div>
              <span className="text-sm font-semibold text-blue-900">Loading VAT details...</span>
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
                  <p className="text-sm font-bold text-green-900">Saving VAT number...</p>
                  <p className="text-xs text-green-700 mt-1">Please wait.</p>
                </div>
              </div>
            </div>
          )}

          {/* VAT Information */}
          {!isLoadingExisting && (
            <>
              {isEU ? (
                <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-blue-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">💡</span> VAT Number Benefits
                  </h4>
                  <p className="text-sm text-blue-800 font-medium">
                    With a valid VAT number: <span className="text-green-700 font-bold">0% VAT</span> (reverse charge)
                  </p>
                  <p className="text-sm text-blue-800 font-medium">
                    Without VAT number: <span className="text-orange-700 font-bold">20% UK VAT</span> will be charged
                  </p>
                </div>
              ) : (
                <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4">
                  <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <span className="text-xl">ℹ️</span> Non-EU Company
                  </h4>
                  <p className="text-sm text-gray-700">
                    VAT numbers are only applicable for EU companies. As a {billingCountry} company, VAT may not apply to your orders.
                  </p>
                </div>
              )}

              {/* Country display (read-only) */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Billing Country (from billing address)
                </label>
                <input
                  type="text"
                  value={billingCountry}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                />
                <p className="text-xs text-gray-600 mt-1">
                  To change country, edit your billing address
                </p>
              </div>

              {/* VAT Number input */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  VAT Number {isEU && <span className="text-gray-500 font-normal">(Optional)</span>}
                </label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder={isEU ? `${billingCountry}123456789` : 'Not applicable'}
                  disabled={isLoadingExisting || isSubmitting || !isEU}
                />
                {isEU && (
                  <p className="text-xs text-gray-600 mt-1">
                    Format: {billingCountry}123456789 (we'll verify it automatically)
                  </p>
                )}
              </div>

              {/* VAT Verification Status */}
              {isEU && vatNumber && (
                <>
                  {isVerifyingVAT && (
                    <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                      <p className="text-sm text-blue-700 flex items-center gap-2">
                        <div className="inline-block animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                        Verifying VAT number...
                      </p>
                    </div>
                  )}

                  {!isVerifyingVAT && vatVerificationResult && (
                    <div
                      className={`p-4 rounded-lg border-2 ${
                        vatVerificationResult.valid
                          ? 'bg-green-50 border-green-500'
                          : 'bg-blue-50 border-blue-400'
                      }`}
                    >
                      {vatVerificationResult.valid ? (
                        <div>
                          <p className="text-base font-bold text-green-700 flex items-center gap-2">
                            <span className="text-xl">✓</span> VAT Number Verified Successfully
                          </p>
                          {vatVerificationResult.companyName && (
                            <p className="text-sm text-green-600 mt-1 font-medium">
                              Company: {vatVerificationResult.companyName}
                            </p>
                          )}
                          <p className="text-sm text-green-700 mt-2 font-semibold">
                            ✓ 0% VAT will be applied (EU Reverse Charge)
                          </p>
                        </div>
                      ) : (
                        <div>
                          <p className="text-base font-bold text-blue-800 flex items-center gap-2">
                            <span className="text-xl">ℹ️</span> Verification Temporarily Unavailable
                          </p>
                          <p className="text-sm text-blue-700 mt-2">
                            The EU VIES system couldn't verify your VAT number right now (this is common).
                          </p>
                          <p className="text-sm text-blue-800 mt-2 font-medium bg-blue-100 p-3 rounded border border-blue-300">
                            ✓ You can proceed - your VAT number will be verified manually within 24 hours. If valid,
                            0% reverse charge VAT will apply.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </>
          )}

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
              {isLoadingExisting ? 'Loading...' : isSubmitting ? 'Saving...' : 'Save VAT Number'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
