/**
 * Create Quote Modal
 * Server action to draft quote with server-resolved prices
 * With VAT number collection for EU customers
 */

'use client';

import { useState, useEffect } from 'react';
import VATNumberForm from '../shared/VATNumberForm';

interface CreateQuoteModalProps {
  companyId: string;
  companyName: string;
  onClose: () => void;
}

interface QuoteItem {
  product_code: string;
  quantity: number;
}

interface CompanyInfo {
  company_id: string;
  company_name: string;
  country: string;
  vat_number: string | null;
}

export default function CreateQuoteModal({
  companyId,
  companyName,
  onClose,
}: CreateQuoteModalProps) {
  const [items, setItems] = useState<QuoteItem[]>([
    { product_code: '', quantity: 1 },
  ]);
  const [discountRequest, setDiscountRequest] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showVATForm, setShowVATForm] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [checkingVAT, setCheckingVAT] = useState(true);

  // Check if VAT number is needed on mount
  useEffect(() => {
    checkVATStatus();
  }, [companyId]);

  const checkVATStatus = async () => {
    try {
      const response = await fetch(`/api/companies/check-vat-needed?company_id=${companyId}`);
      const data = await response.json();

      if (data.company) {
        setCompanyInfo(data.company);
      }

      // Don't show VAT form on mount, only when creating quote
      setCheckingVAT(false);
    } catch (err) {
      console.error('Failed to check VAT status:', err);
      setCheckingVAT(false);
    }
  };

  const addItem = () => {
    setItems([...items, { product_code: '', quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = (index: number, field: keyof QuoteItem, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty items
      const validItems = items.filter(item => item.product_code.trim() !== '');

      if (validItems.length === 0) {
        setError('Please add at least one product');
        setLoading(false);
        return;
      }

      // Check if VAT number is needed
      const vatCheckResponse = await fetch(`/api/companies/check-vat-needed?company_id=${companyId}`);
      const vatCheckData = await vatCheckResponse.json();

      if (vatCheckData.vat_needed) {
        // Show VAT form instead of creating quote
        setCompanyInfo(vatCheckData.company);
        setShowVATForm(true);
        setLoading(false);
        return;
      }

      // Proceed with quote creation
      await createQuote(validItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const createQuote = async (validItems: QuoteItem[]) => {
    try {
      const response = await fetch('/api/admin/quotes/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          items: validItems,
          discount_request: discountRequest || null,
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create quote');
      }

      const data = await response.json();
      alert(`Quote created successfully! Job ID: ${data.job_id}`);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleVATSaved = async (vatNumber: string) => {
    // Update company info
    if (companyInfo) {
      setCompanyInfo({ ...companyInfo, vat_number: vatNumber });
    }
    setShowVATForm(false);

    // Proceed with quote creation
    const validItems = items.filter(item => item.product_code.trim() !== '');
    setLoading(true);
    await createQuote(validItems);
  };

  const handleVATSkipped = async () => {
    setShowVATForm(false);

    // Proceed with quote creation anyway (will charge VAT or handle as needed)
    const validItems = items.filter(item => item.product_code.trim() !== '');
    setLoading(true);
    await createQuote(validItems);
  };

  if (checkingVAT) {
    return (
      <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="text-center">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Create Quote for {companyName}
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* VAT Number Form (if needed) */}
          {showVATForm && companyInfo && (
            <div className="mb-6">
              <VATNumberForm
                companyId={companyInfo.company_id}
                companyName={companyInfo.company_name}
                country={companyInfo.country}
                onSaved={handleVATSaved}
                onSkip={handleVATSkipped}
              />
            </div>
          )}

          {/* Quote Items */}
          <div className="space-y-4 mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Quote Items
            </label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item.product_code}
                  onChange={(e) => updateItem(index, 'product_code', e.target.value)}
                  placeholder="Product Code"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                  min="1"
                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="px-3 py-2 text-red-600 hover:text-red-800"
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addItem}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              + Add Item
            </button>
          </div>

          {/* Discount Request */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Request Discount (Optional)
            </label>
            <input
              type="text"
              value={discountRequest}
              onChange={(e) => setDiscountRequest(e.target.value)}
              placeholder="e.g., 10% bulk discount"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Additional notes for the quote..."
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Quote'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
