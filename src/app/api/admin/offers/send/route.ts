/**
 * POST /api/admin/offers/send
 * Sends marketing offers via Zoho Campaigns with consent verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authError = verifyAdminAuth(request);
  if (authError) return authError;
  try {
    const body = await request.json();
    const { company_id, contact_ids, offer_key, campaign_key, custom_message } = body;

    // Validate input
    if (!company_id || !contact_ids || !Array.isArray(contact_ids) || contact_ids.length === 0) {
      return NextResponse.json(
        { error: 'company_id and contact_ids array are required' },
        { status: 400 }
      );
    }

    if (!offer_key) {
      return NextResponse.json({ error: 'offer_key is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Validate company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('company_id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Fetch contacts with consent status
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('contact_id, full_name, email, marketing_status, gdpr_consent_at, zoho_contact_id')
      .eq('company_id', company_id)
      .in('contact_id', contact_ids);

    if (contactsError) {
      console.error('[offers-send] Error fetching contacts:', contactsError);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: 'No valid contacts found' }, { status: 404 });
    }

    // Filter contacts with subscribed status (consent guard)
    const eligibleContacts = contacts.filter(
      contact =>
        contact.marketing_status === 'subscribed' &&
        contact.gdpr_consent_at !== null &&
        contact.zoho_contact_id !== null
    );

    if (eligibleContacts.length === 0) {
      return NextResponse.json(
        { error: 'No contacts with active consent and Zoho sync found' },
        { status: 400 }
      );
    }

    // Filter contacts without consent (for logging)
    const ineligibleContacts = contacts.filter(
      contact => !eligibleContacts.some(ec => ec.contact_id === contact.contact_id)
    );

    if (ineligibleContacts.length > 0) {
      console.warn(
        `[offers-send] ${ineligibleContacts.length} contacts excluded due to missing consent or Zoho sync:`,
        ineligibleContacts.map(c => c.contact_id)
      );
    }

    // Create outbox job for Zoho Campaigns send
    const jobPayload = {
      company_id: company.company_id,
      company_name: company.company_name,
      offer_key,
      campaign_key: campaign_key || `offer-${Date.now()}`,
      custom_message: custom_message || null,
      recipients: eligibleContacts.map(c => ({
        contact_id: c.contact_id,
        email: c.email,
        full_name: c.full_name,
        zoho_contact_id: c.zoho_contact_id,
      })),
    };

    const { data: job, error: jobError } = await supabase
      .from('outbox')
      .insert({
        job_type: 'send_offer_email',
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        payload: jobPayload,
        scheduled_for: new Date().toISOString(),
      })
      .select('job_id')
      .single();

    if (jobError || !job) {
      console.error('[offers-send] Error creating outbox job:', jobError);
      return NextResponse.json(
        { error: 'Failed to enqueue offer send job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job_id: job.job_id,
      eligible_count: eligibleContacts.length,
      ineligible_count: ineligibleContacts.length,
      ineligible_reasons: ineligibleContacts.map(c => ({
        contact_id: c.contact_id,
        email: c.email,
        reason:
          c.marketing_status !== 'subscribed'
            ? `marketing_status: ${c.marketing_status}`
            : !c.gdpr_consent_at
            ? 'no GDPR consent'
            : 'not synced to Zoho',
      })),
    });
  } catch (err) {
    console.error('[offers-send] Unexpected error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
