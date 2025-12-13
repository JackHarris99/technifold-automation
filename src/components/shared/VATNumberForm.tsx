/**
 * VAT Number Collection Form
 * For EU customers without a stored VAT number
 * Saves permanently to companies.vat_number
 */

'use client';

import { useState } from 'react';

interface VATNumberFormProps {
  companyId: string;
  companyName: string;
  country: string;
  onSaved: (vatNumber: string) => void;
  onSkip?: () => void;
}

export default function VATNumberForm({
  companyId,
  companyName,
  country,
  onSaved,
  onSkip,
}: VATNumberFormProps) {
  const [vatNumber, setVatNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Basic format validation
      const cleanedVAT = vatNumber.trim().toUpperCase();

      if (cleanedVAT.length < 4) {
        throw new Error('VAT number is too short');
      }

      // Save VAT number
      const response = await fetch('/api/companies/update-vat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          vat_number: cleanedVAT,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save VAT number');
      }

      onSaved(cleanedVAT);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    if (onSkip) {
      onSkip();
    }
  };

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
      <div className="flex items-start gap-3 mb-4">
        <div className="flex-shrink-0 w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
          <span className="text-amber-600 text-lg">⚠</span>
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            VAT Number Required
          </h3>
          <p className="text-sm text-gray-700 mb-3">
            <strong>{companyName}</strong> is located in the EU ({country}).
            To apply the <strong>0% VAT reverse charge</strong>, we need their VAT number.
          </p>
          <p className="text-xs text-gray-600 mb-4">
            This will be saved permanently - you'll only need to enter it once.
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            EU VAT Number
          </label>
          <input
            type="text"
            value={vatNumber}
            onChange={(e) => setVatNumber(e.target.value)}
            placeholder={`e.g., ${country}123456789`}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            Format: Country code + number (e.g., DE123456789, FR12345678901)
          </p>
        </div>

        <div className="flex justify-end gap-3">
          {onSkip && (
            <button
              type="button"
              onClick={handleSkip}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Skip for Now
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !vatNumber.trim()}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save VAT Number'}
          </button>
        </div>
      </form>

      <div className="mt-4 pt-4 border-t border-amber-200">
        <p className="text-xs text-gray-600">
          <strong>Why do we need this?</strong>
          <br />
          EU B2B sales with a valid VAT number qualify for 0% VAT under the reverse charge mechanism.
          Without it, VAT may need to be collected.
        </p>
      </div>
    </div>
  );
}
