/**
 * Products Admin Page - Category-grouped product management with easy image uploads
 */

import { getSupabaseClient } from '@/lib/supabase';
import ProductsManagementV2 from '@/components/admin/ProductsManagementV2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsAdminPage() {
  const supabase = getSupabaseClient();

  // Fetch ALL products in batches (Supabase 1000 row limit)
  let allProducts: any[] = [];
  let start = 0;
  const batchSize = 1000;
  let hasMore = true;

  while (hasMore) {
    const { data: batch, error } = await supabase
      .from('products')
      .select('*')
      .order('type', { ascending: true })
      .order('category', { ascending: true })
      .order('product_code', { ascending: true })
      .range(start, start + batchSize - 1);

    if (error) {
      console.error('[products] Error fetching products:', error);
      break;
    }

    if (batch && batch.length > 0) {
      allProducts = allProducts.concat(batch);
      start += batchSize;
      hasMore = batch.length === batchSize;
    } else {
      hasMore = false;
    }
  }

  const products = allProducts;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        <ProductsManagementV2 products={products || []} />
      </div>
    </div>
  );
}
