/**
 * Reorder Portal Route
 * /r/[token] - HMAC-signed token containing company_id + contact_id
 * Shows consumables reorder portal with contact-level tracking
 */

import { notFound } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import { PortalPage } from '@/components/PortalPage';
import type { CompanyPayload, ReorderItem, ToolTab } from '@/types';

interface ReorderPortalProps {
  params: Promise<{
    token: string;
  }>;
}

/**
 * Generate portal payload on-the-fly from database
 * This ensures customers always see current data even if cache is empty
 */
async function generatePortalPayload(companyId: string, companyName: string): Promise<CompanyPayload> {
  const supabase = getSupabaseClient();

  // Get company's tools from company_tools table
  const { data: companyTools } = await supabase
    .from('company_tools')
    .select('tool_code')
    .eq('company_id', companyId);

  if (!companyTools || companyTools.length === 0) {
    return {
      company_id: parseInt(companyId) || 0,
      company_name: companyName,
      reorder_items: [],
      by_tool_tabs: []
    };
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
        return {
          tool_code: tool.product_code,
          tool_desc: tool.description,
          items: [] as ReorderItem[]
        };
      }

      // Get consumable details with prices
      const { data: consumables } = await supabase
        .from('products')
        .select('product_code, description, price, category, image_url')
        .in('product_code', consumableCodes)
        .limit(500);

      // Check order history for this company
      const { data: companyOrders } = await supabase
        .from('orders')
        .select('order_id, created_at')
        .eq('company_id', companyId)
        .eq('payment_status', 'paid')
        .order('created_at', { ascending: false });

      const orderIds = companyOrders?.map(o => o.order_id) || [];

      // Get order items for these orders
      let orderItemsByProduct = new Map<string, string>();
      if (orderIds.length > 0) {
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_code, order_id')
          .in('order_id', orderIds)
          .in('product_code', consumableCodes);

        // Map product_code to most recent order date
        orderItems?.forEach(oi => {
          if (!orderItemsByProduct.has(oi.product_code)) {
            const order = companyOrders?.find(o => o.order_id === oi.order_id);
            if (order) {
              orderItemsByProduct.set(oi.product_code, order.created_at);
            }
          }
        });
      }

      const items: ReorderItem[] = (consumables || []).map(cons => ({
        consumable_code: cons.product_code,
        description: cons.description || cons.product_code,
        price: cons.price,
        last_purchased: orderItemsByProduct.get(cons.product_code)?.split('T')[0] || null,
        category: cons.category
      }));

      return {
        tool_code: tool.product_code,
        tool_desc: tool.description,
        items
      };
    })
  );

  // Extract previously ordered items (consumables with purchase history)
  const reorderItems: ReorderItem[] = toolsWithConsumables
    .flatMap(tool => tool.items.filter(item => item.last_purchased))
    .sort((a, b) => {
      if (!a.last_purchased) return 1;
      if (!b.last_purchased) return -1;
      return new Date(b.last_purchased).getTime() - new Date(a.last_purchased).getTime();
    });

  // Remove duplicates (same consumable might be in multiple tools)
  const seenCodes = new Set<string>();
  const uniqueReorderItems = reorderItems.filter(item => {
    if (seenCodes.has(item.consumable_code)) return false;
    seenCodes.add(item.consumable_code);
    return true;
  });

  return {
    company_id: parseInt(companyId) || 0,
    company_name: companyName,
    reorder_items: uniqueReorderItems,
    by_tool_tabs: toolsWithConsumables as ToolTab[]
  };
}

export default async function ReorderPortalPage({ params }: ReorderPortalProps) {
  const { token } = await params;

  // 1. Verify and decode HMAC token
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-600 mb-8">
            This reorder link is no longer valid. Please contact us for a new link.
          </p>
          <a
            href="/contact"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700"
          >
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  const { company_id, contact_id } = payload;
  const supabase = getSupabaseClient();

  // 2. Fetch company
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('company_id, company_name, portal_payload')
    .eq('company_id', company_id)
    .single();

  if (companyError || !company) {
    console.error('[Reorder] Company not found:', company_id);
    notFound();
  }

  // 3. Fetch contact (optional - might not have contact_id)
  let contact = null;
  if (contact_id) {
    const { data: contactData } = await supabase
      .from('contacts')
      .select('contact_id, full_name, email, company_id')
      .eq('contact_id', contact_id)
      .single();

    // Verify contact belongs to company
    if (contactData && contactData.company_id === company.company_id) {
      contact = contactData;
    } else {
      console.warn('[Reorder] Contact/company mismatch or contact not found');
    }
  }

  // 4. Get portal payload - ALWAYS generate fresh if cache is empty
  let portalPayload: CompanyPayload;

  if (company.portal_payload &&
      (company.portal_payload as any).by_tool_tabs?.length > 0) {
    // Use cached payload if it has data
    console.log(`[Reorder] Using cached payload for ${company.company_name}`);
    portalPayload = company.portal_payload as CompanyPayload;
  } else {
    // Generate on-the-fly to ensure customer sees their data
    console.log(`[Reorder] Generating payload on-the-fly for ${company.company_name}`);
    portalPayload = await generatePortalPayload(company.company_id, company.company_name);

    // Update cache in background (don't await)
    supabase
      .from('companies')
      .update({ portal_payload: portalPayload })
      .eq('company_id', company.company_id)
      .then(({ error }) => {
        if (error) {
          console.error('[Reorder] Failed to update cache:', error);
        } else {
          console.log('[Reorder] Cache updated for', company.company_name);
        }
      });
  }

  // 5. Track reorder portal view
  if (contact) {
    supabase
      .from('engagement_events')
      .insert({
        contact_id: contact.contact_id,
        company_id: company.company_id,
        event_type: 'portal_view',
        event_name: 'reorder_page_view',
        source: 'vercel',
        url: `/r/${token}`,
        meta: {
          contact_name: contact.full_name,
          company_name: company.company_name,
          reorder_items_count: portalPayload.reorder_items?.length || 0,
          tool_tabs_count: portalPayload.by_tool_tabs?.length || 0,
          token_type: 'reorder'
        }
      })
      .then(() => console.log(`[Reorder] Tracked view by ${contact.full_name}`))
      .catch(err => console.error('[Reorder] Tracking failed:', err));
  }

  // 6. Render portal
  return <PortalPage payload={portalPayload} contact={contact} />;
}

export async function generateMetadata({ params }: ReorderPortalProps) {
  const { token } = await params;
  const payload = verifyToken(token);

  if (!payload) {
    return { title: 'Invalid Link' };
  }

  const supabase = getSupabaseClient();
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('company_id', payload.company_id)
    .single();

  return {
    title: `${company?.company_name || 'Company'} - Reorder Portal`,
    description: 'Reorder consumables for your Technifold tools',
  };
}
