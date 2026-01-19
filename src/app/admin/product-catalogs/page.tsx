/**
 * Product Catalog Management
 * Manage which products each company can see in their portal AND custom pricing
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import ProductCatalogClientV2 from '@/components/admin/ProductCatalogClientV2';

export default async function ProductCatalogsPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Fetch all distributors only (not regular customers)
  const { data: companies } = await supabase
    .from('companies')
    .select('company_id, company_name, type')
    .eq('type', 'distributor')
    .order('company_name');

  // Fetch all products with base prices
  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, type, category, price, active, show_in_distributor_portal')
    .order('type')
    .order('category')
    .order('description');

  // Fetch all existing catalog entries
  const { data: catalogEntries } = await supabase
    .from('company_product_catalog')
    .select('company_id, product_code, visible');

  // Fetch standard distributor pricing (for all distributors)
  const { data: distributorPricing } = await supabase
    .from('distributor_pricing')
    .select('product_code, standard_price, currency')
    .eq('active', true);

  // Fetch company-specific pricing
  const { data: companyPricing } = await supabase
    .from('company_distributor_pricing')
    .select('company_id, product_code, custom_price, currency')
    .eq('active', true);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Distributor Product Catalogs & Pricing</h1>
              <p className="text-sm text-gray-800 mt-1">
                Manage which products each distributor can see and set custom prices per distributor
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 py-8">
        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">How This Works</h3>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li><strong>Product Selection:</strong> Add products to a distributor's catalog. Once added, they see ONLY those products (overrides default catalog).</li>
            <li><strong>Custom Pricing:</strong> Set custom prices per distributor. Price priority: Custom price → Standard distributor price → Base sales price.</li>
            <li><strong>Default Catalog:</strong> If a distributor has no custom catalog, they see all products with "Show in Distributor Portal" checked.</li>
            <li><strong>Price Visibility:</strong> Base sales prices and standard distributor prices are shown here for reference only (NOT visible to distributors).</li>
          </ul>
        </div>

        <ProductCatalogClientV2
          companies={companies || []}
          products={products || []}
          catalogEntries={catalogEntries || []}
          distributorPricing={distributorPricing || []}
          companyPricing={companyPricing || []}
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
