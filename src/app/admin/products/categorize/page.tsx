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

  // Fetch all products with all fields
  const { data: products } = await supabase
    .from('products')
    .select('*')
    .order('product_code')
    .limit(10000);

  return <ProductCategorizationClient products={products || []} />;
}
