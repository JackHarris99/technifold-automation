/**
 * Product Categorization Page - Enhanced
 * Spreadsheet-style interface with sales history and distributor pricing
 */

import { getSupabaseClient } from '@/lib/supabase';
import ProductCategorizationClient from '@/components/admin/ProductCategorizationClient';

async function fetchAllProducts() {
  const supabase = getSupabaseClient();

  let allProducts: any[] = [];
  let start = 0;
  const batchSize = 1000;
  let hasMore = true;

  // Fetch products in batches of 1000 to overcome Supabase limit
  while (hasMore) {
    const { data: batch, error } = await supabase
      .rpc('get_products_with_sales_history')
      .range(start, start + batchSize - 1);

    if (error) {
      console.error('[Categorization] Error fetching products batch:', error);
      break;
    }

    if (batch && batch.length > 0) {
      allProducts = [...allProducts, ...batch];
      start += batchSize;
      hasMore = batch.length === batchSize; // Continue if we got a full batch
    } else {
      hasMore = false;
    }
  }

  console.log(`[Categorization] Loaded ${allProducts.length} products with sales history`);
  return allProducts;
}

export default async function CategorizationPage() {
  const products = await fetchAllProducts();
  return <ProductCategorizationClient products={products} />;
}
