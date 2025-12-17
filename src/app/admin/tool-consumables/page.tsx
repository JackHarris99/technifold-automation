/**
 * Tool-Consumable Relationships Admin Page
 * Manage which consumables are compatible with which tools
 */

import { getSupabaseClient } from '@/lib/supabase';
import ToolConsumableManagement from '@/components/admin/ToolConsumableManagement';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ToolConsumablesAdminPage() {
  const supabase = getSupabaseClient();

  // Fetch all tool-consumable relationships
  const { data: relationships, error: relError } = await supabase
    .from('tool_consumable_map')
    .select(`
      tool_code,
      consumable_code,
      tools:products!tool_consumable_map_tool_code_fkey(product_code, description, rental_price_monthly),
      consumables:products!tool_consumable_map_consumable_code_fkey(product_code, description, price)
    `)
    .order('tool_code');

  // Fetch all tools (products with rental_price_monthly)
  const { data: tools, error: toolsError } = await supabase
    .from('products')
    .select('product_code, description, rental_price_monthly')
    .not('rental_price_monthly', 'is', null)
    .order('product_code');

  // Fetch all consumables
  const { data: consumables, error: consumablesError } = await supabase
    .from('products')
    .select('product_code, description, price, type')
    .eq('type', 'consumable')
    .order('product_code');

  if (relError || toolsError || consumablesError) {
    console.error('Error fetching data:', { relError, toolsError, consumablesError });
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Tool-Consumable Relationships</h1>
          <p className="mt-2 text-gray-600">
            Manage which consumables are compatible with each tool for reorder recommendations
          </p>
        </div>

        <ToolConsumableManagement
          relationships={relationships || []}
          tools={tools || []}
          consumables={consumables || []}
        />
      </div>
    </div>
  );
}
