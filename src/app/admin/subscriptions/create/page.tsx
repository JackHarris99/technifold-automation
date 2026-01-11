'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Company {
  company_id: string;
  company_name: string;
}

interface Contact {
  contact_id: string;
  full_name: string;
  email: string;
}

interface Product {
  product_code: string;
  description: string;
  type: string;
  price: number;
}

export default function CreateSubscriptionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [formData, setFormData] = useState({
    company_id: '',
    contact_id: '',
    monthly_price: '',
    currency: 'GBP',
    trial_days: '30',
    tools: [] as string[],
    notes: '',
  });

  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadCompanies();
    loadProducts();
  }, []);

  useEffect(() => {
    if (formData.company_id) {
      loadContacts(formData.company_id);
    } else {
      setContacts([]);
    }
  }, [formData.company_id]);

  async function loadCompanies() {
    try {
      const response = await fetch('/api/admin/companies/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load companies');
      }

      setCompanies(data.companies || []);
    } catch (error: any) {
      console.error('Error loading companies:', error);
    }
  }

  async function loadContacts(company_id: string) {
    try {
      const response = await fetch(`/api/admin/contacts/list?company_id=${company_id}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load contacts');
      }

      setContacts(data.contacts || []);
    } catch (error: any) {
      console.error('Error loading contacts:', error);
    }
  }

  async function loadProducts() {
    try {
      const response = await fetch('/api/admin/tools/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load tools');
      }

      // Map to match expected interface
      const mappedProducts = (data.tools || []).map((tool: any) => ({
        product_code: tool.product_code,
        description: tool.description,
        type: 'tool',
        price: tool.price || 0,
      }));

      setProducts(mappedProducts);
    } catch (error: any) {
      console.error('Error loading products:', error);
    }
  }

  function toggleTool(productCode: string) {
    setFormData(prev => ({
      ...prev,
      tools: prev.tools.includes(productCode)
        ? prev.tools.filter(t => t !== productCode)
        : [...prev.tools, productCode]
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.company_id) {
      alert('Please select a company');
      return;
    }

    if (formData.tools.length === 0) {
      alert('Please select at least one tool');
      return;
    }

    if (!formData.monthly_price || parseFloat(formData.monthly_price) <= 0) {
      alert('Please enter a valid monthly price');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/admin/subscriptions/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          company_id: formData.company_id,
          contact_id: formData.contact_id || null,
          monthly_price: formData.monthly_price,
          currency: formData.currency,
          tools: formData.tools,
          trial_days: formData.trial_days,
          notes: formData.notes || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create subscription');
      }

      alert('Subscription created successfully!');
      router.push(`/admin/subscriptions/${data.subscription.subscription_id}`);
    } catch (error: any) {
      console.error('[CreateSubscription] Exception:', error);
      alert(`Failed to create subscription: ${error.message || 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  const filteredCompanies = companies.filter(c =>
    c.company_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/admin/subscriptions"
            className="text-sm text-blue-600 hover:text-blue-700 mb-4 inline-block"
          >
            ← Back to Subscriptions
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Create Subscription</h1>
          <p className="mt-1 text-sm text-gray-700">
            Set up a new tool rental subscription for a customer
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm p-6 space-y-6">
          {/* Company Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Company *
            </label>
            <input
              type="text"
              placeholder="Search companies..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
            />
            <select
              value={formData.company_id}
              onChange={(e) => setFormData({ ...formData, company_id: e.target.value, contact_id: '' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select a company</option>
              {filteredCompanies.map((company) => (
                <option key={company.company_id} value={company.company_id}>
                  {company.company_name}
                </option>
              ))}
            </select>
          </div>

          {/* Contact Selection */}
          {formData.company_id && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Contact (Optional)
              </label>
              <select
                value={formData.contact_id}
                onChange={(e) => setFormData({ ...formData, contact_id: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No contact selected</option>
                {contacts.map((contact) => (
                  <option key={contact.contact_id} value={contact.contact_id}>
                    {contact.full_name} ({contact.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tool Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tools to Include *
            </label>
            <div className="border border-gray-300 rounded-md p-4 max-h-64 overflow-y-auto">
              {products.length === 0 ? (
                <p className="text-sm text-gray-700">Loading tools...</p>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => (
                    <label
                      key={product.product_code}
                      className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.tools.includes(product.product_code)}
                        onChange={() => toggleTool(product.product_code)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">
                          {product.description}
                        </div>
                        <div className="text-xs text-gray-700">
                          {product.product_code}
                          {product.price > 0 && ` • Retail: £${product.price.toFixed(2)}`}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>
            {formData.tools.length > 0 && (
              <p className="mt-2 text-sm text-gray-700">
                {formData.tools.length} tool{formData.tools.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Price *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-700">£</span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.monthly_price}
                  onChange={(e) => setFormData({ ...formData, monthly_price: e.target.value })}
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="159.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="GBP">GBP (£)</option>
                <option value="EUR">EUR (€)</option>
                <option value="USD">USD ($)</option>
              </select>
            </div>
          </div>

          {/* Trial Period */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trial Period (Days)
            </label>
            <input
              type="number"
              min="0"
              max="365"
              value={formData.trial_days}
              onChange={(e) => setFormData({ ...formData, trial_days: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-700">
              Set to 0 for immediate billing, or 30-90 days for typical trials
            </p>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Internal Notes (Optional)
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Any special terms, custom agreements, or internal notes..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Link
              href="/admin/subscriptions"
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Subscription'}
            </button>
          </div>
        </form>

        {/* Info Panel */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Next Steps After Creation</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Subscription will be created in "trial" status</li>
            <li>Tools should be dispatched to customer</li>
            <li>Before trial ends, connect to Stripe for billing</li>
            <li>Customer will be charged monthly after trial period</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
