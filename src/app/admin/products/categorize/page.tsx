/**
 * Product Categorization Page
 * Inline editing for all product fields - spreadsheet-style interface
 */

import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ProductCategorizationClient from '@/components/admin/ProductCategorizationClient';

export default async function CategorizationPage() {
  const director = await isDirector();

  if (!director) {
    redirect('/admin');
  }

  const supabase = getSupabaseClient();

  // Fetch all products with all fields (no limit - fetch everything)
  const { data: products, count } = await supabase
    .from('products')
    .select('*', { count: 'exact' })
    .order('product_code')
    .range(0, 100000);

  console.log(`[Categorization] Loaded ${products?.length || 0} products (total: ${count})`);

  return <ProductCategorizationClient products={products || []} />;
}
