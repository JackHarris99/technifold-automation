/**
 * Reorder Portal Route
 * /r/[token] - HMAC-signed token containing company_id + contact_id
 * Shows consumables reorder portal with contact-level tracking
 */

import { notFound } from 'next/navigation';
import { cookies } from 'next/headers';
import { verifyToken, getCompanyQueryField } from '@/lib/tokens';
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
 * Shows ALL tools the company owns, with quantities and consumables where available
 */
async function generatePortalPayload(companyId: string, companyName: string): Promise<CompanyPayload> {
  console.log(`[generatePortalPayload] Starting for company_id: "${companyId}"`);
  const supabase = getSupabaseClient();

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

export default async function ReorderPortalPage({ params }: ReorderPortalProps) {
  const { token } = await params;

  // 1. Verify and decode HMAC token
  const payload = verifyToken(token);

  if (!payload) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid or Expired Link</h1>
          <p className="text-gray-800 mb-8">
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

  // 2. Fetch company (with backward compatibility for old TEXT company_id values)
  const companyQuery = getCompanyQueryField(company_id);
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('company_id, company_name, portal_payload')
    .eq(companyQuery.column, companyQuery.value)
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

  // 4. ALWAYS generate fresh payload to show ALL tools
  console.log(`[Reorder] Generating fresh payload for ${company.company_name}`);
  const portalPayload = await generatePortalPayload(String(company.company_id), company.company_name);

  // Update cache in background
  supabase
    .from('companies')
    .update({ portal_payload: portalPayload })
    .eq('company_id', company.company_id)
    .then(({ error }) => {
      if (error) {
        console.error('[Reorder] Failed to update cache:', error);
      }
    });

  // 5. Track reorder portal view (skip internal admin views)
  if (contact) {
    // Check if current user is an authenticated admin
    const cookieStore = await cookies();
    const userCookie = cookieStore.get('current_user');
    let isInternalView = false;
    let internalUser = null;

    if (userCookie) {
      try {
        const session = JSON.parse(userCookie.value);
        if (session.user_id && session.email) {
          isInternalView = true;
          internalUser = session.email;
        }
      } catch (e) {
        // Invalid cookie, treat as customer view
      }
    }

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
          token_type: 'reorder',
          internal_view: isInternalView,
          internal_user: internalUser
        }
      })
      .then(() => {
        if (isInternalView) {
          console.log(`[Reorder] Internal view by ${internalUser} (not counted as customer engagement)`);
        } else {
          console.log(`[Reorder] Customer view tracked: ${contact.full_name}`);
        }
      })
      .catch(err => console.error('[Reorder] Tracking failed:', err));
  }

  // 6. Render portal with token for API authentication
  return <PortalPage payload={portalPayload} contact={contact} token={token} isTest={payload.isTest} />;
}

export async function generateMetadata({ params }: ReorderPortalProps) {
  const { token } = await params;
  const payload = verifyToken(token);

  if (!payload) {
    return { title: 'Invalid Link' };
  }

  const supabase = getSupabaseClient();
  const companyQuery = getCompanyQueryField(payload.company_id);
  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq(companyQuery.column, companyQuery.value)
    .single();

  return {
    title: `${company?.company_name || 'Company'} - Reorder Portal`,
    description: 'Reorder consumables for your Technifold tools',
  };
}
