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
    let detectedMachine = null;

    if (url.includes('/solutions/')) {
      eventType = 'solution_page_view';
    } else if (url.includes('/subscribe')) {
      eventType = 'subscription_page_view';
    } else if (url.includes('/product/')) {
      eventType = 'product_view';
    } else if (url.includes('/machines/') || url.includes('/machine/')) {
      eventType = 'machine_page_view';
    }

    // Detect machine information from URL
    detectedMachine = detectMachineFromUrl(url);

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

    // Update identified_machines if we detected a machine from URL
    if (detectedMachine && prospectCompanyId) {
      await updateIdentifiedMachines(supabase, prospectCompanyId, detectedMachine, url);
    }

    // TODO: Calculate and update lead score based on lead_scoring_rules

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('[Track] Error:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

/**
 * Detect machine information from URL patterns
 */
function detectMachineFromUrl(url: string): { brand: string; model: string } | null {
  // Common machine brand patterns
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
    // Fetch current prospect company data
    const { data: prospect } = await supabase
      .from('prospect_companies')
      .select('identified_machines')
      .eq('prospect_company_id', prospectCompanyId)
      .single();

    if (!prospect) return;

    let machines = prospect.identified_machines || [];

    // Find if this machine already exists
    const machineKey = `${detectedMachine.brand}|${detectedMachine.model}`;
    const existingIndex = machines.findIndex(
      (m: any) => `${m.brand}|${m.model}` === machineKey
    );

    if (existingIndex >= 0) {
      // Update existing machine
      const existing = machines[existingIndex];
      machines[existingIndex] = {
        ...existing,
        visit_count: (existing.visit_count || 1) + 1,
        last_seen: new Date().toISOString(),
        confidence: calculateConfidence((existing.visit_count || 1) + 1),
        pages_viewed: [...new Set([...(existing.pages_viewed || []), url])],
      };
    } else {
      // Add new machine
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

    // Update prospect company
    await supabase
      .from('prospect_companies')
      .update({ identified_machines: machines })
      .eq('prospect_company_id', prospectCompanyId);

  } catch (error) {
    console.error('[UpdateMachines] Error:', error);
  }
}

/**
 * Calculate confidence level based on visit count
 */
function calculateConfidence(visitCount: number): 'low' | 'medium' | 'high' {
  if (visitCount >= 3) return 'high';
  if (visitCount >= 2) return 'medium';
  return 'low';
}
