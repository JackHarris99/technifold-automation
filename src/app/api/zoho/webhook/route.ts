/**
 * Zoho CRM/Email Webhook Handler
 * POST /api/zoho/webhook
 *
 * Accepts events from Zoho CRM (email opens, clicks, campaign events)
 * and writes them to engagement_events table
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

const ZOHO_WEBHOOK_SECRET = process.env.ZOHO_WEBHOOK_SECRET;

if (!ZOHO_WEBHOOK_SECRET) {
  console.warn('[zoho-webhook] ZOHO_WEBHOOK_SECRET not configured - webhook will reject all requests');
}

interface ZohoWebhookPayload {
  event_type: string;  // e.g., 'email_opened', 'email_clicked', 'campaign_sent'
  event_id: string;    // Unique event ID from Zoho for idempotency
  company_id?: string;
  contact_id?: string;
  email?: string;      // Fallback if contact_id not provided
  campaign_key?: string;
  offer_key?: string;
  url?: string;
  occurred_at?: string; // ISO timestamp
  metadata?: Record<string, any>;
}

export async function POST(request: NextRequest) {
  try {
    // Verify webhook secret
    const secret = request.headers.get('x-zoho-secret');

    if (!secret || secret !== ZOHO_WEBHOOK_SECRET) {
      console.error('[zoho-webhook] Invalid or missing X-Zoho-Secret header');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse payload
    const payload = await request.json() as ZohoWebhookPayload;

    // Validate required fields
    if (!payload.event_type || !payload.event_id) {
      return NextResponse.json(
        { error: 'Missing required fields: event_type and event_id are required' },
        { status: 400 }
      );
    }

    console.log(`[zoho-webhook] Received event: ${payload.event_type} (${payload.event_id})`);

    const supabase = getSupabaseClient();

    // Resolve contact_id from email if not provided
    let contactId = payload.contact_id;
    let companyId = payload.company_id;
    let companyUuid: string | undefined;

    if (!contactId && payload.email) {
      console.log(`[zoho-webhook] Resolving contact by email: ${payload.email}`);
      const { data: contact } = await supabase
        .from('contacts')
        .select('contact_id, company_id, company_uuid')
        .eq('email', payload.email)
        .single();

      if (contact) {
        contactId = contact.contact_id;
        companyId = companyId || contact.company_id;
        companyUuid = contact.company_uuid;
      } else {
        console.warn(`[zoho-webhook] Contact not found for email: ${payload.email}`);
      }
    } else if (contactId) {
      // Get company info for this contact
      const { data: contact } = await supabase
        .from('contacts')
        .select('company_id, company_uuid')
        .eq('contact_id', contactId)
        .single();

      if (contact) {
        companyId = companyId || contact.company_id;
        companyUuid = contact.company_uuid;
      }
    }

    // Map Zoho event types to our event names
    const eventName = mapZohoEventType(payload.event_type);

    // Handle unsubscribe events by updating contact marketing_status
    if (payload.event_type === 'email_unsubscribed' && contactId) {
      console.log(`[zoho-webhook] Updating marketing_status to 'unsubscribed' for contact: ${contactId}`);
      const { error: updateError } = await supabase
        .from('contacts')
        .update({
          marketing_status: 'unsubscribed',
        })
        .eq('contact_id', contactId);

      if (updateError) {
        console.error('[zoho-webhook] Error updating contact marketing_status:', updateError);
        // Continue to log the event even if update fails
      }
    }

    // Insert engagement event (idempotent on source + source_event_id)
    const { error } = await supabase
      .from('engagement_events')
      .insert({
        company_id: companyId || null,
        company_uuid: companyUuid || null,
        contact_id: contactId || null,
        source: 'zoho',
        source_event_id: payload.event_id,
        event_name: eventName,
        campaign_key: payload.campaign_key || null,
        offer_key: payload.offer_key || null,
        url: payload.url || null,
        occurred_at: payload.occurred_at || new Date().toISOString(),
        meta: {
          zoho_event_type: payload.event_type,
          email: payload.email,
          ...payload.metadata,
        },
      });

    if (error) {
      // Check if it's a duplicate key error (idempotency)
      if (error.code === '23505' || error.message?.includes('duplicate')) {
        console.log(`[zoho-webhook] Event already processed: ${payload.event_id}`);
        return NextResponse.json({
          success: true,
          message: 'Event already processed',
        });
      }

      console.error('[zoho-webhook] Error inserting engagement event:', error);
      return NextResponse.json(
        { error: 'Failed to process event' },
        { status: 500 }
      );
    }

    console.log(`[zoho-webhook] Event processed successfully: ${payload.event_id}`);

    return NextResponse.json({
      success: true,
      event_id: payload.event_id,
    });
  } catch (error) {
    console.error('[zoho-webhook] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Map Zoho event types to our standardized event names
 */
function mapZohoEventType(zohoEventType: string): string {
  const mapping: Record<string, string> = {
    'email_sent': 'email_sent',
    'email_delivered': 'email_delivered',
    'email_opened': 'email_opened',
    'email_clicked': 'email_clicked',
    'email_bounced': 'email_bounced',
    'email_unsubscribed': 'unsubscribe',  // Canonical event name
    'campaign_sent': 'campaign_sent',
    'form_submitted': 'form_submitted',
    'webinar_registered': 'webinar_registered',
    'deal_created': 'deal_created',
    'deal_won': 'deal_won',
  };

  return mapping[zohoEventType] || zohoEventType;
}
