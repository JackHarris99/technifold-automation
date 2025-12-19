/**
 * Products Admin Page - Category-grouped product management with easy image uploads
 */

import { getSupabaseClient } from '@/lib/supabase';
import ProductsManagementV2 from '@/components/admin/ProductsManagementV2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsAdminPage() {
  const supabase = getSupabaseClient();

  // Fetch ALL products (remove default 1000 row limit)
  // Supabase has a default limit of 1000, must explicitly set higher or use range
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .range(0, 9999) // Fetch first 10,000 rows (0-indexed)
    .order('type, category, product_code');

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-[1600px] mx-auto">
        <ProductsManagementV2 products={products || []} />
      </div>
    </div>
  );
}
