/**
 * Product Detail & Edit Page
 * Beautiful product management page matching portal aesthetic
 */

import { getSupabaseClient } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import ProductDetailView from '@/components/admin/ProductDetailView';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ product_code: string }>;
}) {
  const { product_code: encodedProductCode } = await params;
  // Decode product code: replace -- with / for codes containing slashes
  const product_code = encodedProductCode.replace(/--/g, '/');
  const supabase = getSupabaseClient();

  // Fetch product details
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('*')
    .eq('product_code', product_code)
    .single();

  if (productError || !product) {
    notFound();
  }

  // Fetch related data based on product type
  const relatedData: {
    linkedConsumables?: any[];
    linkedTools?: any[];
    availableConsumables?: any[];
    availableTools?: any[];
  } = {};

  if (product.type === 'tool') {
    // Get consumables linked to this tool
    const { data: toolConsumableMap } = await supabase
      .from('tool_consumable_map')
      .select('consumable_code')
      .eq('tool_code', product_code);

    if (toolConsumableMap && toolConsumableMap.length > 0) {
      const consumableCodes = toolConsumableMap.map(tc => tc.consumable_code);
      const { data: consumables } = await supabase
        .from('products')
        .select('product_code, description, price, category, image_url, type')
        .in('product_code', consumableCodes);

      relatedData.linkedConsumables = consumables || [];
    } else {
      relatedData.linkedConsumables = [];
    }

    // Get all available consumables for linking
    const { data: allConsumables } = await supabase
      .from('products')
      .select('product_code, description, category, type')
      .eq('type', 'consumable')
      .eq('active', true)
      .order('category')
      .order('description');

    relatedData.availableConsumables = allConsumables || [];
  } else if (product.type === 'consumable') {
    // Get tools that use this consumable
    const { data: toolConsumableMap } = await supabase
      .from('tool_consumable_map')
      .select('tool_code')
      .eq('consumable_code', product_code);

    if (toolConsumableMap && toolConsumableMap.length > 0) {
      const toolCodes = toolConsumableMap.map(tc => tc.tool_code);
      const { data: tools } = await supabase
        .from('products')
        .select('product_code, description, rental_price_monthly, category, image_url, type')
        .in('product_code', toolCodes);

      relatedData.linkedTools = tools || [];
    } else {
      relatedData.linkedTools = [];
    }

    // Get all available tools for linking
    const { data: allTools } = await supabase
      .from('products')
      .select('product_code, description, category, type')
      .eq('type', 'tool')
      .eq('active', true)
      .order('category')
      .order('description');

    relatedData.availableTools = allTools || [];
  }

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <ProductDetailView
        product={product}
        relatedData={relatedData}
      />
    </div>
  );
}
