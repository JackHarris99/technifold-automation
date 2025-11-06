/**
 * Double-Tokenized Reorder Portal
 * /portal/[company_token]/[contact_token]
 * Tracks which specific contact is viewing and ordering
 */

import { notFound } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import { PortalPage } from '@/components/PortalPage';
import type { CompanyPayload } from '@/types';

interface PortalPageProps {
  params: Promise<{
    company_token: string;
    contact_token: string;
  }>;
}

export default async function DoubleTokenPortalPage({ params }: PortalPageProps) {
  const { company_token, contact_token } = await params;

  const supabase = getSupabaseClient();

  // 1. Look up company by portal_token
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('company_id, company_name, company_uuid, portal_payload, payload_generated_at')
    .eq('portal_token', company_token)
    .single();

  if (companyError || !company) {
    console.error('[Portal] Company not found:', company_token);
    notFound();
  }

  // 2. Look up contact by token and verify they belong to this company
  const { data: contact, error: contactError } = await supabase
    .from('contacts')
    .select('contact_id, full_name, email, company_uuid, sales_rep_id')
    .eq('token', contact_token)
    .single();

  if (contactError || !contact) {
    console.error('[Portal] Contact not found:', contact_token);
    notFound();
  }

  // Verify contact belongs to this company (using UUIDs)
  if (contact.company_uuid !== company.company_uuid) {
    console.error('[Portal] Contact/company mismatch');
    notFound();
  }

  // 3. Get or generate portal payload
  let payload: CompanyPayload;

  // Check if cached payload is fresh (< 24 hours)
  const payloadAge = company.payload_generated_at
    ? Date.now() - new Date(company.payload_generated_at).getTime()
    : Infinity;
  const isFresh = payloadAge < 24 * 60 * 60 * 1000;

  if (company.portal_payload && isFresh) {
    // Use cached
    console.log(`[Portal] Using cached payload for ${company.company_name}`);
    payload = company.portal_payload as CompanyPayload;
  } else {
    // Generate fresh
    console.log(`[Portal] Generating fresh payload for ${company.company_name}`);

    const { data: viewData, error: viewError } = await supabase
      .from('vw_company_consumable_payload')
      .select('*')
      .eq('company_id', company.company_id)
      .single();

    if (viewError || !viewData) {
      console.error('[Portal] Failed to generate payload:', viewError);
      notFound();
    }

    payload = viewData as CompanyPayload;

    // Cache it async (fire and forget)
    supabase.rpc('regenerate_company_payload', { p_company_id: company.company_id })
      .then(() => console.log(`[Portal] Cached payload for ${company.company_name}`))
      .catch(err => console.error(`[Portal] Cache failed:`, err));
  }

  // 4. Track portal view interaction (don't await - fire and forget to avoid blocking)
  supabase
    .from('contact_interactions')
    .insert({
      contact_id: contact.contact_id,
      company_uuid: company.company_uuid,
      interaction_type: 'portal_view',
      url: `/portal/${company_token}/${contact_token}`,
      metadata: {
        contact_name: contact.full_name,
        company_name: company.company_name,
        reorder_items_count: payload.reorder_items?.length || 0,
        tool_tabs_count: payload.by_tool_tabs?.length || 0
      },
      sales_rep_id: contact.sales_rep_id
    })
    .then(() => console.log(`[Portal] Tracked view by ${contact.full_name} (${contact.email})`))
    .catch(err => console.error('[Portal] Tracking failed:', err));

  // 5. Render portal with contact context
  return <PortalPage payload={payload} contact={contact} />;
}

export async function generateMetadata({ params }: PortalPageProps) {
  const { company_token } = await params;
  const supabase = getSupabaseClient();

  const { data: company } = await supabase
    .from('companies')
    .select('company_name')
    .eq('portal_token', company_token)
    .single();

  if (!company) {
    return {
      title: 'Portal Not Found',
    };
  }

  return {
    title: `${company.company_name} - Reorder Portal`,
    description: `Consumables reorder portal for ${company.company_name}`,
  };
}
