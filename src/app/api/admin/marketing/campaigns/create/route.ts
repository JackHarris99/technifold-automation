/**
 * POST /api/admin/marketing/campaigns/create
 * Create campaign and optionally queue sends
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();

    const {
      campaign_name,
      campaign_code,
      sending_domain,
      target_status,
      email_subject,
      email_preview_text,
      email_body_html,
      value_proposition,
      status,
    } = body;

    const supabase = getSupabaseClient();

    // Create campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('marketing_campaigns')
      .insert({
        campaign_name,
        campaign_code: campaign_code || null,
        sending_domain: sending_domain || 'technifold.com',
        campaign_type: 'awareness',
        email_subject,
        email_preview_text: email_preview_text || null,
        email_body_html,
        value_proposition: value_proposition || null,
        status: status || 'draft',
        created_by: user.user_id,
      })
      .select()
      .single();

    if (campaignError) {
      console.error('[Campaign Create] Error:', campaignError);
      return NextResponse.json({ error: campaignError.message }, { status: 500 });
    }

    // If status is 'active', queue sends
    let recipientCount = 0;
    if (status === 'active') {
      // Get target prospects
      let query = supabase
        .from('prospect_companies')
        .select(`
          prospect_company_id,
          company_name,
          prospect_contacts (
            prospect_contact_id,
            email,
            first_name,
            last_name,
            marketing_status
          )
        `)
        .neq('lead_status', 'converted')
        .neq('lead_status', 'dead');

      // Filter by status if specified
      if (target_status && target_status.length > 0) {
        query = query.in('lead_status', target_status);
      }

      const { data: prospects } = await query;

      // Create campaign_sends records
      const sends = [];
      for (const prospect of prospects || []) {
        for (const contact of prospect.prospect_contacts) {
          // Skip unsubscribed/bounced contacts
          if (contact.marketing_status !== 'subscribed') continue;

          sends.push({
            campaign_id: campaign.campaign_id,
            prospect_contact_id: contact.prospect_contact_id,
            prospect_company_id: prospect.prospect_company_id,
            email_address: contact.email,
            contact_name: [contact.first_name, contact.last_name].filter(Boolean).join(' ') || null,
            company_name: prospect.company_name,
            send_status: 'queued',
          });

          recipientCount++;
        }
      }

      if (sends.length > 0) {
        const { error: sendsError } = await supabase
          .from('campaign_sends')
          .insert(sends);

        if (sendsError) {
          console.error('[Campaign Create] Error creating sends:', sendsError);
          return NextResponse.json({ error: sendsError.message }, { status: 500 });
        }

        // Update campaign stats
        await supabase
          .from('marketing_campaigns')
          .update({
            total_recipients: recipientCount,
            sent_at: new Date().toISOString(),
          })
          .eq('campaign_id', campaign.campaign_id);

        // Trigger batch email processor to start sending emails
        try {
          const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
          const sendResponse = await fetch(`${baseUrl}/api/admin/marketing/send-emails`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              campaign_id: campaign.campaign_id,
              batch_size: 50, // Process 50 emails at a time
            }),
          });

          if (!sendResponse.ok) {
            console.error('[Campaign Create] Failed to trigger email sending:', await sendResponse.text());
            // Don't fail the campaign creation - emails are queued and can be retried
          } else {
            const sendResult = await sendResponse.json();
            console.log(`[Campaign Create] Email batch processing started: ${sendResult.sent_count} sent, ${sendResult.failed_count} failed`);
          }
        } catch (triggerError) {
          console.error('[Campaign Create] Error triggering email batch processor:', triggerError);
          // Don't fail the campaign creation - emails are queued and can be retried manually
        }
      }
    }

    return NextResponse.json({
      success: true,
      campaign_id: campaign.campaign_id,
      recipient_count: recipientCount,
    });

  } catch (error: any) {
    console.error('[Campaign Create] Error:', error);
    return NextResponse.json({
      error: error.message || 'Failed to create campaign'
    }, { status: 500 });
  }
}
