/**
 * Products Admin Page - Full CRUD for product management
 */

import { getSupabaseClient } from '@/lib/supabase';
import ProductsManagement from '@/components/admin/ProductsManagement';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsAdminPage() {
  const supabase = getSupabaseClient();

  // Fetch all products
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('product_code');

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Products Management</h1>
          <p className="mt-2 text-gray-600">
            Manage all products: tools, consumables, parts, and accessories
          </p>
        </div>

        <ProductsManagement products={products || []} />
      </div>
    </div>
  );
}
