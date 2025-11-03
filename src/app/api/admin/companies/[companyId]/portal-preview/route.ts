/**
 * GET /api/admin/companies/[companyId]/portal-preview
 * Get portal data (tools + consumables) for this company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await context.params;
    const supabase = getSupabaseClient();

    // Get company's tools from company_tool table
    const { data: companyTools } = await supabase
      .from('company_tool')
      .select('tool_code')
      .eq('company_id', companyId);

    if (!companyTools || companyTools.length === 0) {
      return NextResponse.json({ tools: [] });
    }

    const toolCodes = companyTools.map(ct => ct.tool_code);

    // Get tool details
    const { data: tools } = await supabase
      .from('products')
      .select('product_code, description, category, type')
      .in('product_code', toolCodes)
      .eq('type', 'tool');

    // For each tool, get consumables
    const toolsWithConsumables = await Promise.all(
      (tools || []).map(async (tool) => {
        // Get consumables for this tool
        const { data: consumableMap } = await supabase
          .from('tool_consumable_map')
          .select('consumable_code')
          .eq('tool_code', tool.product_code)
          .limit(500);

        const consumableCodes = (consumableMap || []).map(cm => cm.consumable_code);

        if (consumableCodes.length === 0) {
          return { ...tool, consumables: [] };
        }

        // Get consumable details
        const { data: consumables } = await supabase
          .from('products')
          .select('product_code, description, price, category, image_url')
          .in('product_code', consumableCodes)
          .limit(500);

        // Check last purchase date for each
        const consumablesWithHistory = await Promise.all(
          (consumables || []).map(async (cons) => {
            const { data: sales } = await supabase
              .from('sales')
              .select('txn_date')
              .eq('company_id', companyId)
              .eq('product_code', cons.product_code)
              .order('txn_date', { ascending: false })
              .limit(1);

            return {
              ...cons,
              last_purchased_at: sales && sales[0] ? sales[0].txn_date : null
            };
          })
        );

        return {
          tool_code: tool.product_code,
          description: tool.description,
          category: tool.category,
          consumables: consumablesWithHistory
        };
      })
    );

    return NextResponse.json({ tools: toolsWithConsumables });
  } catch (err) {
    console.error('[admin/companies/portal-preview] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
