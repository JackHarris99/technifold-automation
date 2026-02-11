/**
 * Shared Portal Payload Generator
 * Used by both token-based and login-based portals
 */

import { getSupabaseClient } from '@/lib/supabase';
import type { CompanyPayload, ReorderItem, ToolTab } from '@/types';

/**
 * Generate portal payload on-the-fly from database
 * This ensures customers always see current data even if cache is empty
 * Shows ALL tools the company owns, with quantities and consumables where available
 */
export async function generatePortalPayload(companyId: string): Promise<CompanyPayload | null> {
  console.log(`[generatePortalPayload] Starting for company_id: "${companyId}"`);
  const supabase = getSupabaseClient();

  // Get company name first
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('company_id', companyId)
    .single();

  if (!company) {
    return null;
  }

  const companyName = company.company_name;

  // Get company's tools from unified product history table WITH quantities
  const { data: companyTools, error: toolsError } = await supabase
    .from('company_product_history')
    .select('product_code, total_quantity')
    .eq('company_id', companyId)
    .eq('product_type', 'tool');

  console.log(`[generatePortalPayload] company_product_history (tools) query:`, {
    companyId,
    count: companyTools?.length || 0,
    error: toolsError,
    sample: companyTools?.[0]
  });

  if (!companyTools || companyTools.length === 0) {
    return {
      company_id: companyId,
      company_name: companyName,
      reorder_items: [],
      by_tool_tabs: []
    };
  }

  // Group tools by product_code and sum quantities
  const toolQuantities = new Map<string, number>();
  companyTools.forEach(ct => {
    const current = toolQuantities.get(ct.product_code) || 0;
    toolQuantities.set(ct.product_code, current + (ct.total_quantity || 1));
  });

  const uniqueToolCodes = [...toolQuantities.keys()];

  // Get tool details from products table (for descriptions and images, only active)
  const { data: toolProducts } = await supabase
    .from('products')
    .select('product_code, description, image_url')
    .in('product_code', uniqueToolCodes)
    .eq('active', true);

  const toolDescriptions = new Map<string, string>();
  const toolImages = new Map<string, string | null>();
  toolProducts?.forEach(tp => {
    toolDescriptions.set(tp.product_code, tp.description || tp.product_code);
    toolImages.set(tp.product_code, tp.image_url || null);
  });

  // Get company's consumable order history from unified product history table
  const { data: companyConsumables, error: consumablesError } = await supabase
    .from('company_product_history')
    .select('product_code, last_purchased_at')
    .eq('company_id', companyId)
    .eq('product_type', 'consumable');

  console.log(`[generatePortalPayload] company_product_history (consumables) query:`, {
    companyId,
    count: companyConsumables?.length || 0,
    error: consumablesError,
    sample: companyConsumables?.[0]
  });

  const consumableLastOrdered = new Map<string, string>();
  companyConsumables?.forEach(cc => {
    if (cc.last_purchased_at) {
      consumableLastOrdered.set(cc.product_code, cc.last_purchased_at);
    }
  });

  // For each unique tool, get consumables
  const toolsWithConsumables = await Promise.all(
    uniqueToolCodes.map(async (toolCode) => {
      const quantity = toolQuantities.get(toolCode) || 1;
      const description = toolDescriptions.get(toolCode) || toolCode;
      const imageUrl = toolImages.get(toolCode) || null;

      // Get consumables for this tool
      const { data: consumableMap } = await supabase
        .from('tool_consumable_map')
        .select('consumable_code')
        .eq('tool_code', toolCode)
        .limit(500);

      const consumableCodes = (consumableMap || []).map(cm => cm.consumable_code);

      // No consumables mapped - still show the tool with empty items
      if (consumableCodes.length === 0) {
        return {
          tool_code: toolCode,
          tool_desc: description,
          quantity: quantity > 1 ? quantity : undefined,
          image_url: imageUrl,
          items: [] as ReorderItem[]
        };
      }

      // Get consumable details with prices (only active products)
      const { data: consumables } = await supabase
        .from('products')
        .select('product_code, description, price, category, image_url, pricing_tier')
        .in('product_code', consumableCodes)
        .eq('active', true)
        .limit(500);

      // Map consumables to reorder items using fact table data
      const items: ReorderItem[] = (consumables || []).map(cons => ({
        consumable_code: cons.product_code,
        description: cons.description || cons.product_code,
        price: cons.price,
        last_purchased: consumableLastOrdered.get(cons.product_code)?.split('T')[0] || null,
        category: cons.category,
        image_url: cons.image_url,
        pricing_tier: cons.pricing_tier
      }));

      return {
        tool_code: toolCode,
        tool_desc: description,
        quantity: quantity > 1 ? quantity : undefined,
        image_url: imageUrl,
        items
      };
    })
  );

  // Get ALL previously ordered consumables (not just ones linked to tools)
  // Use unified product history table instead of deprecated orders/order_items
  let reorderItems: ReorderItem[] = [];

  if (companyConsumables && companyConsumables.length > 0) {
    const orderedProductCodes = companyConsumables.map(cc => cc.product_code);

    // Get product details for all ordered consumables (only active)
    const { data: orderedProducts } = await supabase
      .from('products')
      .select('product_code, description, price, category, image_url, pricing_tier')
      .in('product_code', orderedProductCodes)
      .eq('active', true);

    if (orderedProducts) {
      reorderItems = orderedProducts.map(prod => ({
        consumable_code: prod.product_code,
        description: prod.description || prod.product_code,
        price: prod.price,
        last_purchased: consumableLastOrdered.get(prod.product_code)?.split('T')[0] || null,
        category: prod.category,
        image_url: prod.image_url,
        pricing_tier: prod.pricing_tier
      }));

      // Sort by most recently ordered
      reorderItems.sort((a, b) => {
        if (!a.last_purchased) return 1;
        if (!b.last_purchased) return -1;
        return new Date(b.last_purchased).getTime() - new Date(a.last_purchased).getTime();
      });
    }
  }

  return {
    company_id: companyId,
    company_name: companyName,
    reorder_items: reorderItems,
    by_tool_tabs: toolsWithConsumables as ToolTab[]
  };
}
