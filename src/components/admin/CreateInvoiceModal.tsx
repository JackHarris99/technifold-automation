/**
 * Create Invoice Modal
 * Creates Stripe invoice and sends via Resend
 */

'use client';

import { useState, useEffect } from 'react';
import AddressCollectionModal from '../portals/AddressCollectionModal';

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
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [checkingAddresses, setCheckingAddresses] = useState(true);
  const [productSuggestions, setProductSuggestions] = useState<Array<{
    product_code: string;
    description: string;
    price: number;
    currency: string;
  }>>([]);
  const [showSuggestions, setShowSuggestions] = useState<number | null>(null); // index of item showing suggestions

  // Load contacts on mount
  useEffect(() => {
    loadContacts();
    setCheckingAddresses(false); // Simple check - we'll validate on submit
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

    // Auto-search products when product_code is entered
    if (field === 'product_code' && typeof value === 'string') {
      if (value.trim().length > 0) {
        try {
          const response = await fetch(`/api/admin/products/search?q=${encodeURIComponent(value.trim())}`);
          if (response.ok) {
            const data = await response.json();
            setProductSuggestions(data.products || []);
            setShowSuggestions(index);
          }
        } catch (err) {
          console.error('[CreateInvoiceModal] Error searching products:', err);
        }
      } else {
        setProductSuggestions([]);
        setShowSuggestions(null);
      }
    }
  };

  const selectProduct = (index: number, product: { product_code: string; description: string; price: number }) => {
    const newItems = [...items];
    newItems[index] = {
      ...newItems[index],
      product_code: product.product_code,
      description: product.description,
      unit_price: product.price,
    };
    setItems(newItems);
    setProductSuggestions([]);
    setShowSuggestions(null);
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

      // Check if addresses and VAT are needed
      console.log('[CreateInvoiceModal] Checking if addresses needed for company:', companyId);
      const checkResponse = await fetch(`/api/companies/check-details-needed?company_id=${companyId}`);
      const checkData = await checkResponse.json();
      console.log('[CreateInvoiceModal] Check result:', checkData);

      if (checkData.details_needed) {
        console.log('[CreateInvoiceModal] Addresses needed - showing modal');
        // Show address collection modal
        setShowAddressModal(true);
        setLoading(false);
        return;
      }

      console.log('[CreateInvoiceModal] Addresses OK - proceeding with invoice creation');

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
        headers: {
          'Content-Type': 'application/json',
          'X-Admin-Secret': process.env.NEXT_PUBLIC_ADMIN_SECRET || 'Technifold',
        },
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
        console.error('[CreateInvoiceModal] API Error:', data);

        // Show detailed error if address-related
        if (data.details) {
          throw new Error(`${data.error}\n\n${data.details}`);
        }

        throw new Error(data.error || 'Failed to create invoice');
      }

      const data = await response.json();
      console.log('[CreateInvoiceModal] Invoice created successfully:', data);
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

  const handleAddressSaved = async () => {
    setShowAddressModal(false);

    // Proceed with invoice creation
    const validItems = items.filter(item =>
      item.product_code.trim() !== '' &&
      item.description.trim() !== '' &&
      item.unit_price > 0
    );
    setLoading(true);
    await createInvoice(validItems);
  };

  const handleAddressCancel = () => {
    setShowAddressModal(false);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      return sum + (item.unit_price * item.quantity);
    }, 0);
  };

  if (checkingAddresses || loadingContacts) {
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

          {/* Address Collection Modal (shown when addresses are missing) */}
          {showAddressModal && (
            <AddressCollectionModal
              isOpen={showAddressModal}
              onClose={handleAddressCancel}
              companyId={companyId}
              companyName={companyName}
              onSuccess={handleAddressSaved}
            />
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
              <div key={index} className="relative">
                <div className="flex gap-2">
                  <div className="relative w-32">
                    <input
                      type="text"
                      value={item.product_code}
                      onChange={(e) => updateItem(index, 'product_code', e.target.value)}
                      placeholder="Type to search..."
                      className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm text-gray-900 placeholder-gray-400"
                    />
                    {/* Autocomplete dropdown */}
                    {showSuggestions === index && productSuggestions.length > 0 && (
                      <div className="absolute z-50 mt-1 w-96 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto">
                        {productSuggestions.map((product, pIndex) => (
                          <button
                            key={pIndex}
                            type="button"
                            onClick={() => selectProduct(index, product)}
                            className="w-full px-3 py-2 text-left hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-sm text-gray-900">{product.product_code}</div>
                            <div className="text-xs text-gray-600">{product.description}</div>
                            <div className="text-xs text-green-600 font-semibold">£{product.price.toFixed(2)}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
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
