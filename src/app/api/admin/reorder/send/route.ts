/**
 * POST /api/admin/reorder/send
 * Enqueue reorder reminder emails
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, contact_ids, offer_key, campaign_key } = body;

    if (!company_id || !contact_ids || contact_ids.length === 0) {
      return NextResponse.json(
        { error: 'company_id and contact_ids are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get contact details
    const { data: contacts, error: contactsError } = await supabase
      .from('contacts')
      .select('contact_id, email, first_name, last_name')
      .in('contact_id', contact_ids);

    if (contactsError || !contacts) {
      console.error('[admin/reorder/send] Contacts error:', contactsError);
      return NextResponse.json(
        { error: 'Failed to fetch contacts' },
        { status: 500 }
      );
    }

    // Create outbox job for sending offer emails
    const { data: job, error: jobError } = await supabase
      .from('outbox')
      .insert({
        job_type: 'send_offer_email',
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        payload: {
          company_id,
          offer_key: offer_key || 'reorder_reminder',
          campaign_key: campaign_key || `reorder_${new Date().toISOString().split('T')[0]}`,
          recipients: contacts.map(c => ({
            contact_id: c.contact_id,
            email: c.email,
            first_name: c.first_name,
            last_name: c.last_name
          }))
        }
      })
      .select('job_id')
      .single();

    if (jobError || !job) {
      console.error('[admin/reorder/send] Job creation error:', jobError);
      return NextResponse.json(
        { error: 'Failed to enqueue reorder reminder' },
        { status: 500 }
      );
    }

    // Log engagement event
    await supabase
      .from('engagement_events')
      .insert({
        company_id,
        source: 'vercel',
        event_type: 'reorder_reminder_sent',
        event_name: 'reorder_reminder_sent',
        campaign_key: campaign_key || null,
        url: '/api/admin/reorder/send',
        meta: {
          job_id: job.job_id,
          contact_count: contacts.length,
          offer_key: offer_key || 'reorder_reminder'
        }
      })
      .catch(err => console.error('[admin/reorder/send] Event error:', err));

    return NextResponse.json({
      success: true,
      job_id: job.job_id,
      recipient_count: contacts.length
    });
  } catch (err) {
    console.error('[admin/reorder/send] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
