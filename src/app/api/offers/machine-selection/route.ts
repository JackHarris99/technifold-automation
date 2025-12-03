/**
 * Machine Selection API
 * Records when user selects their machine in offer flow
 * POST /api/offers/machine-selection
 *
 * Actions:
 * 1. Insert engagement_events (event_name='machine_selected')
 * 2. Upsert company_machine (confidence=2, source='campaign_click')
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      token,
      company_id,
      contact_id,
      machine_id,
      brand,
      model,
      offer_key,
      campaign_key,
    } = body;

    // Validation
    if (!token || !company_id || !machine_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify token is still valid
    const payload = verifyToken(token);
    if (!payload || payload.company_id !== company_id) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    // Defence-in-depth: if contact_id present, verify it belongs to company_id
    if (contact_id) {
      const supabase = getSupabaseClient();
      const { data: contact } = await supabase
        .from('contacts')
        .select('company_id')
        .eq('contact_id', contact_id)
        .single();

      if (!contact || contact.company_id !== company_id) {
        return NextResponse.json(
          { error: 'Contact does not belong to company' },
          { status: 403 }
        );
      }
    }

    const supabase = getSupabaseClient();
    const url = `/x/${token}`;

    // 1. Insert engagement event
    const { data: event, error: eventError } = await supabase
      .from('engagement_events')
      .insert({
        company_id,
        contact_id: contact_id || null,
        source: 'vercel',
        event_name: 'machine_selected',
        offer_key: offer_key || null,
        campaign_key: campaign_key || null,
        url,
        meta: {
          machine_id,
          brand,
          model,
          selection_source: 'offer_picker',
        },
      })
      .select('event_id')
      .single();

    if (eventError) {
      console.error('[machine-selection] Error inserting engagement event:', eventError);
      return NextResponse.json(
        { error: 'Failed to record event' },
        { status: 500 }
      );
    }

    // 2. Upsert company_machine with confidence scoring
    // Fetch existing record to check confidence
    const { data: existing } = await supabase
      .from('company_machine')
      .select('id, confidence, evidence')
      .eq('company_id', company_id)
      .eq('machine_id', machine_id)
      .single();

    const newEvidence = {
      event_id: event.event_id,
      url,
      campaign_key,
      offer_key,
      clicked_at: new Date().toISOString(),
    };

    const clickConfidence = 2; // clicked in campaign = confidence 2

    if (existing) {
      // Update existing - only increase confidence, never decrease
      const newConfidence = Math.max(existing.confidence || 1, clickConfidence);
      const mergedEvidence = existing.evidence
        ? {
            ...(existing.evidence as any),
            campaign_clicks: [
              ...((existing.evidence as any)?.campaign_clicks || []),
              newEvidence,
            ],
          }
        : { campaign_clicks: [newEvidence] };

      const { error: updateError } = await supabase
        .from('company_machine')
        .update({
          confidence: newConfidence,
          source: 'campaign_click',
          evidence: mergedEvidence,
        })
        .eq('id', existing.id);

      if (updateError) {
        console.error('[machine-selection] Error updating company_machine:', updateError);
      }
    } else {
      // Insert new record
      const { error: insertError } = await supabase
        .from('company_machine')
        .insert({
          company_id,
          machine_id,
          confidence: clickConfidence,
          source: 'campaign_click',
          verified: false,
          evidence: { campaign_clicks: [newEvidence] },
        });

      if (insertError) {
        console.error('[machine-selection] Error inserting company_machine:', insertError);
      }
    }

    return NextResponse.json({
      success: true,
      event_id: event.event_id,
    });
  } catch (error) {
    console.error('[machine-selection] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
