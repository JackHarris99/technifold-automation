/**
 * Product Categorization Page - Enhanced
 * Spreadsheet-style interface with sales history and distributor pricing
 */

import { getSupabaseClient } from '@/lib/supabase';
import ProductCategorizationClient from '@/components/admin/ProductCategorizationClient';

async function fetchAllProducts() {
  const supabase = getSupabaseClient();

  // Fetch products with sales history in a single query
  const { data: productsData, error: productsError } = await supabase.rpc('get_products_with_sales_history');

  if (productsError) {
    console.error('[Categorization] Error fetching products:', productsError);
    // Fallback to basic fetch if RPC fails
    const { data: fallbackData } = await supabase
      .from('products')
      .select('*')
      .order('product_code');
    return fallbackData || [];
  }

  console.log(`[Categorization] Loaded ${productsData?.length || 0} products with sales history`);
  return productsData || [];
}

export default async function CategorizationPage() {
  const products = await fetchAllProducts();
  return <ProductCategorizationClient products={products} />;
}
