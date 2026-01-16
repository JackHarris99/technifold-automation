/**
 * Product Catalog Management
 * Manage which products each company can see in their portal
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProductCatalogClient from '@/components/admin/ProductCatalogClient';

export default async function ProductCatalogsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch all companies (distributors and OEMs)
  const { data: companies } = await supabase
    .from('companies')
    .select('company_id, company_name, type')
    .in('type', ['distributor', 'customer'])
    .order('company_name');

  // Fetch all products
  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, type, category, active, show_in_distributor_portal')
    .order('type')
    .order('category')
    .order('description');

  // Fetch all existing catalog entries
  const { data: catalogEntries } = await supabase
    .from('company_product_catalog')
    .select('company_id, product_code, visible');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Product Catalogs</h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage which products each company can see in their portal
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How Product Catalogs Work</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>Default Catalog:</strong> Products with "Show in Distributor Portal" checked are shown to all companies without custom catalogs</li>
            <li><strong>Custom Catalog:</strong> If you assign products to a specific company, they see ONLY those products (overrides default)</li>
            <li><strong>OEMs:</strong> Create custom catalogs for OEM customers who need specific product sets</li>
            <li><strong>Distributors:</strong> Most distributors can use the default catalog, but you can customize if needed</li>
          </ul>
        </div>

        <ProductCatalogClient
          companies={companies || []}
          products={products || []}
          catalogEntries={catalogEntries || []}
        />

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/admin/sales" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Sales Center
          </Link>
        </div>
      </div>
    </div>
  );
}
