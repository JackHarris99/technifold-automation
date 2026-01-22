/**
 * POST /api/track/engagement
 * Log prospect engagement events and update lead scores
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      url,
      query_params,
      referrer,
      user_agent,
      ip_address,
      prospect_token,
      campaign_token,
    } = body;

    const supabase = getSupabaseClient();

    let prospectContactId = null;
    let prospectCompanyId = null;
    let campaignSendId = null;

    // Lookup prospect by token
    if (prospect_token) {
      const { data: contact } = await supabase
        .from('prospect_contacts')
        .select('prospect_contact_id, prospect_company_id')
        .eq('token', prospect_token)
        .single();

      if (contact) {
        prospectContactId = contact.prospect_contact_id;
        prospectCompanyId = contact.prospect_company_id;
      }
    }

    // Lookup campaign send by token
    if (campaign_token) {
      const { data: send } = await supabase
        .from('campaign_sends')
        .select('send_id, prospect_contact_id, prospect_company_id')
        .eq('token', campaign_token)
        .single();

      if (send) {
        campaignSendId = send.send_id;
        prospectContactId = prospectContactId || send.prospect_contact_id;
        prospectCompanyId = prospectCompanyId || send.prospect_company_id;
      }
    }

    if (!prospectContactId) {
      // No valid token - exit silently
      return NextResponse.json({ success: false });
    }

    // Determine event type based on URL
    let eventType = 'page_view';
    if (url.includes('/solutions/')) {
      eventType = 'solution_page_view';
    } else if (url.includes('/subscribe')) {
      eventType = 'subscription_page_view';
    } else if (url.includes('/product/')) {
      eventType = 'product_view';
    }

    // Log engagement event
    const { error: eventError } = await supabase
      .from('engagement_events')
      .insert({
        prospect_contact_id: prospectContactId,
        prospect_company_id: prospectCompanyId,
        campaign_send_id: campaignSendId,
        event_type: eventType,
        event_name: 'prospect_page_view',
        source: 'marketing_campaign',
        url,
        meta: {
          query_params,
          referrer,
          user_agent,
          ip_address,
        },
      });

    if (eventError) {
      console.error('[Track] Event error:', eventError);
    }

    // Update campaign send stats if this came from a campaign
    if (campaignSendId) {
      // Check if this is first click
      const { data: existingClick } = await supabase
        .from('campaign_sends')
        .select('clicked_at')
        .eq('send_id', campaignSendId)
        .single();

      if (!existingClick?.clicked_at) {
        // First click
        await supabase
          .from('campaign_sends')
          .update({
            clicked_at: new Date().toISOString(),
            last_clicked_at: new Date().toISOString(),
            total_clicks: 1,
          })
          .eq('send_id', campaignSendId);
      } else {
        // Subsequent click
        await supabase
          .from('campaign_sends')
          .update({
            last_clicked_at: new Date().toISOString(),
            total_clicks: supabase.raw('total_clicks + 1'),
          })
          .eq('send_id', campaignSendId);
      }
    }

    // Update prospect last_engaged_at
    await supabase
      .from('prospect_contacts')
      .update({ last_engaged_at: new Date().toISOString() })
      .eq('prospect_contact_id', prospectContactId);

    await supabase
      .from('prospect_companies')
      .update({ last_engaged_at: new Date().toISOString() })
      .eq('prospect_company_id', prospectCompanyId);

    // TODO: Calculate and update lead score based on lead_scoring_rules

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[Track] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
