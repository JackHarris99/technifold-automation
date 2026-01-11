'use client';

import { useState, useEffect } from 'react';

interface AddSubscriptionToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
  subscriptions: any[];
}

export default function AddSubscriptionToolModal({
  isOpen,
  onClose,
  companyId,
  subscriptions
}: AddSubscriptionToolModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    subscription_id: '',
    tool_code: '',
  });
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter to active subscriptions only
  const activeSubscriptions = subscriptions.filter(s => s.status === 'active');

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/admin/tools/list');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load tools');
      }

      setProducts(data.tools || []);
    } catch (err: any) {
      console.error('Error loading products:', err);
      setError('Failed to load products');
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.subscription_id) {
      setError('Please select a subscription');
      setLoading(false);
      return;
    }

    if (!formData.tool_code) {
      setError('Please select a tool');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/admin/subscription-tools/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_id: formData.subscription_id,
          tool_code: formData.tool_code,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add tool to subscription');
      }

      // Success - reload page
      window.location.reload();
    } catch (err: any) {
      console.error('Error adding tool to subscription:', err);
      setError(err.message || 'Failed to add tool to subscription');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add Tool to Subscription</h2>
          <button
            onClick={onClose}
            className="text-gray-800 hover:text-gray-800"
          >
            ✕
          </button>
        </div>

        {activeSubscriptions.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded mb-4">
            No active subscriptions found for this company. Please create a subscription first.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription <span className="text-red-500">*</span>
              </label>
              <select
                required
                value={formData.subscription_id}
                onChange={(e) => setFormData({ ...formData, subscription_id: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a subscription...</option>
                {activeSubscriptions.map((subscription) => (
                  <option key={subscription.subscription_id} value={subscription.subscription_id}>
                    {subscription.subscription_name} - Started {new Date(subscription.start_date).toLocaleDateString()}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tool <span className="text-red-500">*</span>
              </label>
              {loadingProducts ? (
                <div className="text-sm text-gray-700">Loading tools...</div>
              ) : (
                <select
                  required
                  value={formData.tool_code}
                  onChange={(e) => setFormData({ ...formData, tool_code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a tool...</option>
                  {products.map((product) => (
                    <option key={product.product_code} value={product.product_code}>
                      {product.product_code} - {product.description} (£{product.rental_price_monthly}/mo)
                    </option>
                  ))}
                </select>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
                disabled={loading || loadingProducts}
              >
                {loading ? 'Adding...' : 'Add Tool'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
