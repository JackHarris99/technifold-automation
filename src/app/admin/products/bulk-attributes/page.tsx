/**
 * Bulk Product Attributes Page
 * Search/filter products and add attributes to multiple products at once
 */

import { getSupabaseClient } from '@/lib/supabase';
import BulkAttributeEditor from '@/components/admin/BulkAttributeEditor';

export default async function BulkAttributesPage() {
  const supabase = getSupabaseClient();

  // Fetch all products
  const { data: products } = await supabase
    .from('products')
    .select('product_code, description, type, category, active, extra')
    .order('product_code');

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Bulk Attribute Editor</h1>
        <p className="text-gray-600 mt-2">
          Search for products, select multiple, and add attributes to all at once.
        </p>
      </div>

      <BulkAttributeEditor products={products || []} />
    </div>
  );
}
