'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  companyId: string;
}

export default function AddToolModal({ isOpen, onClose, companyId }: AddToolModalProps) {
  const [products, setProducts] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    product_code: '',
    first_purchased_at: '',
    last_purchased_at: '',
    total_quantity: 1,
    total_purchases: 1,
  });
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadProducts();
    }
  }, [isOpen]);

  const loadProducts = async () => {
    try {
      const supabase = createClientComponentClient();

      // Query products where rental_price_monthly is NOT NULL (these are tools)
      const { data, error: fetchError } = await supabase
        .from('products')
        .select('product_code, product_name, rental_price_monthly')
        .not('rental_price_monthly', 'is', null)
        .order('product_name');

      if (fetchError) throw fetchError;

      setProducts(data || []);
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

    if (!formData.product_code) {
      setError('Please select a tool');
      setLoading(false);
      return;
    }

    if (!formData.first_purchased_at || !formData.last_purchased_at) {
      setError('Please provide purchase dates');
      setLoading(false);
      return;
    }

    try {
      const supabase = createClientComponentClient();

      // Insert into company_product_history
      const { error: insertError } = await supabase.from('company_product_history').insert({
        company_id: companyId,
        product_code: formData.product_code,
        product_type: 'tool',
        first_purchased_at: formData.first_purchased_at,
        last_purchased_at: formData.last_purchased_at,
        total_purchases: formData.total_purchases,
        total_quantity: formData.total_quantity,
        source: 'manual',
        added_by: 'admin',
      });

      if (insertError) throw insertError;

      // Success - reload page
      window.location.reload();
    } catch (err: any) {
      console.error('Error adding tool:', err);
      setError(err.message || 'Failed to add tool');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  // Set default dates to today if not set
  const today = new Date().toISOString().split('T')[0];
  if (!formData.first_purchased_at) {
    setFormData(prev => ({ ...prev, first_purchased_at: today, last_purchased_at: today }));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add Tool to Purchase History</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tool <span className="text-red-500">*</span>
            </label>
            {loadingProducts ? (
              <div className="text-sm text-gray-500">Loading tools...</div>
            ) : (
              <select
                required
                value={formData.product_code}
                onChange={(e) => setFormData({ ...formData, product_code: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select a tool...</option>
                {products.map((product) => (
                  <option key={product.product_code} value={product.product_code}>
                    {product.product_code} - {product.product_name}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Purchased Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.first_purchased_at}
              onChange={(e) => setFormData({ ...formData, first_purchased_at: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Purchased Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              required
              value={formData.last_purchased_at}
              onChange={(e) => setFormData({ ...formData, last_purchased_at: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Quantity
            </label>
            <input
              type="number"
              min="1"
              value={formData.total_quantity}
              onChange={(e) => setFormData({ ...formData, total_quantity: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Total Purchases
            </label>
            <input
              type="number"
              min="1"
              value={formData.total_purchases}
              onChange={(e) => setFormData({ ...formData, total_purchases: parseInt(e.target.value) || 1 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
      </div>
    </div>
  );
}
