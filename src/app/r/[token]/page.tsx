/**
 * Reorder Portal Route
 * /r/[token] - HMAC-signed token containing company_id + contact_id
 * Shows consumables reorder portal with contact-level tracking
 */

import { notFound } from 'next/navigation';
import { verifyToken } from '@/lib/tokens';
import { getSupabaseClient } from '@/lib/supabase';
import { PortalPage } from '@/components/PortalPage';
import type { CompanyPayload } from '@/types';

interface ReorderPortalProps {
  params: Promise<{
    token: string;
  }>;
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

  // 2. Fetch company with cached portal payload
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
      .select('contact_id, full_name, email, company_id, sales_rep_id')
      .eq('contact_id', contact_id)
      .single();

    // Verify contact belongs to company
    if (contactData && contactData.company_id === company.company_id) {
      contact = contactData;
    } else {
      console.warn('[Reorder] Contact/company mismatch or contact not found');
    }
  }

  // 4. Get portal payload
  let portalPayload: CompanyPayload;

  if (company.portal_payload) {
    // Use cached payload
    console.log(`[Reorder] Using cached payload for ${company.company_name}`);
    portalPayload = company.portal_payload as CompanyPayload;
  } else {
    // No cache - return empty portal
    console.log(`[Reorder] No cache for ${company.company_name} - empty portal`);
    portalPayload = {
      company_id: company.company_id,
      company_name: company.company_name,
      reorder_items: [],
      by_tool_tabs: []
    };

    // Generate in background
    supabase.rpc('regenerate_company_payload', { p_company_id: company.company_id })
      .then(({ error }) => {
        if (error) console.error('[Reorder] Generation failed:', error);
      });
  }

  // 5. Track reorder portal view
  if (contact) {
    supabase
      .from('contact_interactions')
      .insert({
        contact_id: contact.contact_id,
        company_id: company.company_id,
        interaction_type: 'portal_view',
        url: `/r/${token}`,
        metadata: {
          contact_name: contact.full_name,
          company_name: company.company_name,
          reorder_items_count: portalPayload.reorder_items?.length || 0,
          tool_tabs_count: portalPayload.by_tool_tabs?.length || 0,
          token_type: 'reorder'
        },
        sales_rep_id: contact.sales_rep_id
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
