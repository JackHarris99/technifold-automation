/**
 * Bulk Product Editor - Unified Page
 * Combines: Bulk Pricing Tier + Bulk Attributes
 */

import { getSupabaseClient } from '@/lib/supabase';
import BulkEditClient from '@/components/admin/BulkEditClient';

async function fetchAllProducts() {
  const supabase = getSupabaseClient();
  const BATCH_SIZE = 1000;
  let allProducts: any[] = [];
  let start = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('products')
      .select('product_code, description, type, category, pricing_tier, price, active, extra')
      .order('product_code')
      .range(start, start + BATCH_SIZE - 1);

    if (error) {
      console.error('Error fetching products batch:', error);
      break;
    }

    if (data && data.length > 0) {
      allProducts = [...allProducts, ...data];
      start += BATCH_SIZE;
      hasMore = data.length === BATCH_SIZE;
    } else {
      hasMore = false;
    }
  }

  console.log(`[Bulk Edit] Loaded ${allProducts.length} products in ${Math.ceil(allProducts.length / BATCH_SIZE)} batches`);
  return allProducts;
}

export default async function BulkEditPage() {
  // Allow all admin users to access this page (not just directors)
  const products = await fetchAllProducts();

  return <BulkEditClient products={products} />;
}
