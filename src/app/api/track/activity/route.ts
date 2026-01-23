/**
 * POST /api/track/activity
 * Universal activity tracking for ALL users
 * Handles prospects, customers, authenticated users
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

      // Prospect data
      prospect_token,
      campaign_token,

      // Customer data
      customer_company_id,
      customer_contact_id,
      token_object_type,
    } = body;

    const supabase = getSupabaseClient();

    // ========== PROSPECT TRACKING ==========
    let prospectContactId = null;
    let prospectCompanyId = null;
    let campaignSendId = null;

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

    // ========== DETERMINE EVENT TYPE ==========
    let eventType = 'page_view';
    let source = 'direct';

    if (campaign_token) {
      source = 'marketing_email';
    } else if (token_object_type === 'reorder') {
      source = 'reorder_link';
      eventType = 'reorder_view';
    } else if (token_object_type === 'quote') {
      source = 'quote_link';
      eventType = 'quote_view';
    } else if (token_object_type === 'offer' || token_object_type === 'trial') {
      source = 'offer_link';
      eventType = 'offer_view';
    } else if (referrer && referrer.includes('google')) {
      source = 'google';
    } else if (prospect_token) {
      source = 'marketing_cookie';
    } else if (customer_contact_id) {
      source = 'customer_cookie';
    }

    // Refine event type based on URL
    if (url.includes('/solutions/')) {
      eventType = 'solution_page_view';
    } else if (url.includes('/subscribe')) {
      eventType = 'subscription_page_view';
    } else if (url.includes('/product/')) {
      eventType = 'product_view';
    } else if (url.includes('/machines/') || url.includes('/machine/')) {
      eventType = 'machine_page_view';
    } else if (url.startsWith('/r/')) {
      eventType = 'reorder_portal_view';
    } else if (url.startsWith('/q/')) {
      eventType = 'quote_view';
    } else if (url.startsWith('/x/')) {
      eventType = 'offer_view';
    }

    // ========== LOG TO UNIVERSAL ACTIVITY TABLE ==========
    const activityData: any = {
      url,
      event_type: eventType,
      source,
      object_type: token_object_type || null,
      referrer,
      user_agent,
      ip_address,
      meta: { query_params },
    };

    // Set appropriate ID fields
    if (prospectContactId) {
      activityData.prospect_contact_id = prospectContactId;
    }

    if (customer_contact_id) {
      activityData.customer_contact_id = customer_contact_id;
    }

    if (customer_company_id) {
      activityData.customer_company_id = customer_company_id;
    }

    // Insert into activity_tracking
    const { error: activityError } = await supabase
      .from('activity_tracking')
      .insert(activityData);

    if (activityError) {
      console.error('[TrackActivity] Activity error:', activityError);
    }

    // ========== PROSPECT-SPECIFIC TRACKING ==========
    if (prospectContactId && prospectCompanyId) {
      // Log to engagement_events (legacy prospect tracking)
      await supabase.from('engagement_events').insert({
        prospect_contact_id: prospectContactId,
        prospect_company_id: prospectCompanyId,
        campaign_send_id: campaignSendId,
        event_type: eventType,
        event_name: 'prospect_page_view',
        source: source,
        url,
        meta: { query_params, referrer, user_agent, ip_address },
      });

      // Update campaign send stats if from campaign
      if (campaignSendId) {
        const { data: existingClick } = await supabase
          .from('campaign_sends')
          .select('clicked_at')
          .eq('send_id', campaignSendId)
          .single();

        if (!existingClick?.clicked_at) {
          await supabase.from('campaign_sends').update({
            clicked_at: new Date().toISOString(),
            last_clicked_at: new Date().toISOString(),
            total_clicks: 1,
          }).eq('send_id', campaignSendId);
        } else {
          await supabase.from('campaign_sends').update({
            last_clicked_at: new Date().toISOString(),
            total_clicks: supabase.raw('total_clicks + 1'),
          }).eq('send_id', campaignSendId);
        }
      }

      // Update prospect last_engaged_at
      await supabase.from('prospect_contacts').update({
        last_engaged_at: new Date().toISOString()
      }).eq('prospect_contact_id', prospectContactId);

      await supabase.from('prospect_companies').update({
        last_engaged_at: new Date().toISOString()
      }).eq('prospect_company_id', prospectCompanyId);

      // Machine detection for prospects
      const detectedMachine = detectMachineFromUrl(url);
      if (detectedMachine) {
        await updateIdentifiedMachines(supabase, prospectCompanyId, detectedMachine, url);
      }
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[TrackActivity] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

/**
 * Detect machine information from URL patterns
 */
function detectMachineFromUrl(url: string): { brand: string; model: string } | null {
  const brandPatterns = [
    { pattern: /heidelberg[-\s]speedmaster[-\s]xl[-\s]?(\d+)/i, brand: 'Heidelberg', model: 'Speedmaster XL' },
    { pattern: /heidelberg[-\s]speedmaster[-\s]sm[-\s]?(\d+)/i, brand: 'Heidelberg', model: 'Speedmaster SM' },
    { pattern: /heidelberg[-\s]speedmaster[-\s]?(\d+)?/i, brand: 'Heidelberg', model: 'Speedmaster' },
    { pattern: /heidelberg/i, brand: 'Heidelberg', model: null },
    { pattern: /komori[-\s]lithrone[-\s]gl?[-\s]?(\d+)/i, brand: 'Komori', model: 'Lithrone GL' },
    { pattern: /komori[-\s]lithrone[-\s]?(\w+)?/i, brand: 'Komori', model: 'Lithrone' },
    { pattern: /komori/i, brand: 'Komori', model: null },
    { pattern: /kba[-\s]rapida[-\s]?(\d+)/i, brand: 'KBA', model: 'Rapida' },
    { pattern: /kba/i, brand: 'KBA', model: null },
    { pattern: /manroland[-\s]?(\w+)?/i, brand: 'manroland', model: null },
    { pattern: /ryobi[-\s]?(\d+)?/i, brand: 'Ryobi', model: null },
    { pattern: /shinohara[-\s]?(\d+)?/i, brand: 'Shinohara', model: null },
    { pattern: /mitsubishi[-\s]diamond[-\s]?(\d+)?/i, brand: 'Mitsubishi', model: 'Diamond' },
    { pattern: /mitsubishi/i, brand: 'Mitsubishi', model: null },
  ];

  for (const { pattern, brand, model } of brandPatterns) {
    const match = url.match(pattern);
    if (match) {
      const number = match[1] || null;
      let fullModel = model;

      if (number && model) {
        fullModel = `${model} ${number}`;
      } else if (number) {
        fullModel = number;
      }

      return { brand, model: fullModel || brand };
    }
  }

  return null;
}

/**
 * Update prospect's identified_machines array with confidence scoring
 */
async function updateIdentifiedMachines(
  supabase: any,
  prospectCompanyId: string,
  detectedMachine: { brand: string; model: string },
  url: string
) {
  try {
    const { data: prospect } = await supabase
      .from('prospect_companies')
      .select('identified_machines')
      .eq('prospect_company_id', prospectCompanyId)
      .single();

    if (!prospect) return;

    let machines = prospect.identified_machines || [];
    const machineKey = `${detectedMachine.brand}|${detectedMachine.model}`;
    const existingIndex = machines.findIndex(
      (m: any) => `${m.brand}|${m.model}` === machineKey
    );

    if (existingIndex >= 0) {
      const existing = machines[existingIndex];
      machines[existingIndex] = {
        ...existing,
        visit_count: (existing.visit_count || 1) + 1,
        last_seen: new Date().toISOString(),
        confidence: calculateConfidence((existing.visit_count || 1) + 1),
        pages_viewed: [...new Set([...(existing.pages_viewed || []), url])],
      };
    } else {
      machines.push({
        brand: detectedMachine.brand,
        model: detectedMachine.model,
        confidence: 'low',
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        visit_count: 1,
        source: 'page_visits',
        pages_viewed: [url],
      });
    }

    await supabase
      .from('prospect_companies')
      .update({ identified_machines: machines })
      .eq('prospect_company_id', prospectCompanyId);

  } catch (error) {
    console.error('[UpdateMachines] Error:', error);
  }
}

function calculateConfidence(visitCount: number): 'low' | 'medium' | 'high' {
  if (visitCount >= 3) return 'high';
  if (visitCount >= 2) return 'medium';
  return 'low';
}
