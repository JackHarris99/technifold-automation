/**
 * Admin SKU Explorer
 * Search SKUs, view associations, edit descriptions
 */

import { getSupabaseClient } from '@/lib/supabase';
import SkuExplorer from '@/components/admin/SkuExplorer';

export default async function SkuExplorerPage() {
  const supabase = getSupabaseClient();

  // Fetch ALL SKUs (no limit)
  const { data: allSkus } = await supabase
    .from('products')
    .select('product_code, description, type')
    .order('product_code');

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SKU Explorer
          </h1>
          <p className="text-gray-600">
            Search products, view associations, and edit descriptions
          </p>
        </div>

        <SkuExplorer allSkus={allSkus || []} />
      </div>
    </div>
  );
}
