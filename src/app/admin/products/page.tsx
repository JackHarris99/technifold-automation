/**
 * Products Admin Page - Category-grouped product management with easy image uploads
 */

import { getSupabaseClient } from '@/lib/supabase';
import ProductsManagementV2 from '@/components/admin/ProductsManagementV2';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductsAdminPage() {
  const supabase = getSupabaseClient();

  // Fetch all products ordered by type, category, then code
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .order('type')
    .order('category')
    .order('product_code');

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
