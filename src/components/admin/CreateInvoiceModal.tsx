/**
 * Create Invoice Modal
 * Creates Stripe invoice and sends via Resend
 */

'use client';

import { useState, useEffect } from 'react';
import VATNumberForm from '../shared/VATNumberForm';

interface CreateInvoiceModalProps {
  companyId: string;
  companyName: string;
  onClose: () => void;
}

interface InvoiceItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
}

export default function CreateInvoiceModal({
  companyId,
  companyName,
  onClose,
}: CreateInvoiceModalProps) {
  const [items, setItems] = useState<InvoiceItem[]>([
    { product_code: '', description: '', quantity: 1, unit_price: 0 },
  ]);
  const [contactId, setContactId] = useState('');
  const [contacts, setContacts] = useState<any[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showVATForm, setShowVATForm] = useState(false);
  const [companyInfo, setCompanyInfo] = useState<{
    company_id: string;
    company_name: string;
    country: string;
    vat_number: string | null;
  } | null>(null);
  const [checkingVAT, setCheckingVAT] = useState(true);

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
    checkVATStatus();
  }, [companyId]);

  const loadContacts = async () => {
    try {
      const response = await fetch(`/api/admin/companies/${companyId}/contacts`);
      const data = await response.json();
      setContacts(data.contacts || []);
      if (data.contacts && data.contacts.length > 0) {
        setContactId(data.contacts[0].contact_id);
      }
    } catch (err) {
      console.error('Failed to load contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  };

  const checkVATStatus = async () => {
    try {
      const response = await fetch(`/api/companies/check-vat-needed?company_id=${companyId}`);
      const data = await response.json();

      if (data.company) {
        setCompanyInfo(data.company);
      }

      setCheckingVAT(false);
    } catch (err) {
      console.error('Failed to check VAT status:', err);
      setCheckingVAT(false);
    }
  };

  const addItem = () => {
    setItems([...items, { product_code: '', description: '', quantity: 1, unit_price: 0 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const updateItem = async (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...items];
    if (field === 'unit_price' || field === 'quantity') {
      newItems[index] = { ...newItems[index], [field]: Number(value) };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);

    // Auto-lookup product when product_code is entered
    if (field === 'product_code' && typeof value === 'string' && value.trim() !== '') {
      try {
        const response = await fetch(`/api/admin/products/${value.trim()}`);
        if (response.ok) {
          const product = await response.json();
          newItems[index] = {
            ...newItems[index],
            description: product.description || newItems[index].description,
            unit_price: product.price || newItems[index].unit_price,
          };
          setItems([...newItems]);
        }
      } catch (err) {
        // If product not found, just continue with manual entry
        console.log('Product not found, manual entry mode');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Filter out empty items
      const validItems = items.filter(item =>
        item.product_code.trim() !== '' &&
        item.description.trim() !== '' &&
        item.unit_price > 0
      );

      if (validItems.length === 0) {
        setError('Please add at least one product with price');
        setLoading(false);
        return;
      }

      if (!contactId) {
        setError('Please select a contact');
        setLoading(false);
        return;
      }

      // Check if VAT number is needed
      const vatCheckResponse = await fetch(`/api/companies/check-vat-needed?company_id=${companyId}`);
      const vatCheckData = await vatCheckResponse.json();

      if (vatCheckData.vat_needed) {
        // Show VAT form instead of creating invoice
        setCompanyInfo(vatCheckData.company);
        setShowVATForm(true);
        setLoading(false);
        return;
      }

      // Proceed with invoice creation
      await createInvoice(validItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
      setLoading(false);
    }
  };

  const createInvoice = async (validItems: InvoiceItem[]) => {
    try {
      const response = await fetch('/api/admin/invoices/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: companyId,
          contact_id: contactId,
          items: validItems,
          currency: 'gbp',
          notes: notes || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create invoice');
      }

      const data = await response.json();
      alert(`Invoice created successfully!\n\nInvoice sent to customer via email.\n\nStripe Invoice ID: ${data.invoice_id || 'N/A'}`);
      onClose();
      window.location.reload(); // Refresh to show new invoice
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

    // Proceed with invoice creation
    const validItems = items.filter(item =>
      item.product_code.trim() !== '' &&
      item.description.trim() !== '' &&
      item.unit_price > 0
    );
    setLoading(true);
    await createInvoice(validItems);
  };

  const handleVATSkipped = async () => {
    setShowVATForm(false);

    // Proceed with invoice creation anyway
    const validItems = items.filter(item =>
      item.product_code.trim() !== '' &&
      item.description.trim() !== '' &&
      item.unit_price > 0
    );
    setLoading(true);
    await createInvoice(validItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);
  };

  if (checkingVAT || loadingContacts) {
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
            Create Invoice for {companyName}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Invoice will be created in Stripe and emailed to customer via Resend
          </p>
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

          {/* Contact Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Send Invoice To
            </label>
            <select
              value={contactId}
              onChange={(e) => setContactId(e.target.value)}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              required
            >
              <option value="">Select contact...</option>
              {contacts.map(contact => (
                <option key={contact.contact_id} value={contact.contact_id}>
                  {contact.full_name || `${contact.first_name} ${contact.last_name}`} ({contact.email})
                </option>
              ))}
            </select>
          </div>

          {/* Invoice Items */}
          <div className="space-y-4 mb-6">
            <label className="block text-sm font-medium text-gray-700">
              Invoice Items
            </label>
            {items.map((item, index) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={item.product_code}
                  onChange={(e) => updateItem(index, 'product_code', e.target.value)}
                  placeholder="Product Code"
                  className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder-gray-400"
                />
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => updateItem(index, 'description', e.target.value)}
                  placeholder="Description"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder-gray-400"
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                  min="1"
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900"
                />
                <input
                  type="number"
                  value={item.unit_price}
                  onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                  min="0"
                  step="0.01"
                  placeholder="Price"
                  className="w-28 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder-gray-400"
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

          {/* Total */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span>Subtotal:</span>
              <span>£{calculateTotal().toFixed(2)}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              VAT will be calculated automatically based on customer location
            </p>
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Internal notes (not visible to customer)..."
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
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
            >
              {loading ? 'Creating Invoice...' : 'Create & Send Invoice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
