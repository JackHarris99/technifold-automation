/**
 * Product Categorization Page
 * Inline editing for all product fields - spreadsheet-style interface
 */

import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProductCategorizationClient from '@/components/admin/ProductCategorizationClient';

async function fetchAllProducts() {
  const supabase = getSupabaseClient();
  const BATCH_SIZE = 1000;
  let allProducts: any[] = [];
  let start = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('products')
      .select('*')
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

  console.log(`[Categorization] Loaded ${allProducts.length} products in ${Math.ceil(allProducts.length / BATCH_SIZE)} batches`);
  return allProducts;
}

export default async function CategorizationPage() {
  // Allow all admin users to access this page (not just directors)
  const products = await fetchAllProducts();

  return <ProductCategorizationClient products={products} />;
}
