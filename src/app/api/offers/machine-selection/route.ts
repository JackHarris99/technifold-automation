/**
 * Machine Selection API
 * Records when user selects their machine in offer flow
 * POST /api/offers/machine-selection
 *
 * Actions:
 * 1. Insert engagement_events (event_name='machine_selected')
 * 2. Upsert company_beliefs (confidence=2, source='offer_click')
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
      model_id,
      brand,
      model,
      offer_key,
      campaign_key,
    } = body;

    // Validation
    if (!token || !company_id || !model_id) {
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
          model_id,
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

    // 2. Upsert company_beliefs using greatest() and evidence merging
    // Fetch existing belief to check confidence
    const { data: existingBelief } = await supabase
      .from('company_beliefs')
      .select('confidence, evidence')
      .eq('company_id', company_id)
      .eq('model_id', model_id)
      .single();

    const newEvidence = {
      event_id: event.event_id,
      url,
      campaign_key,
      offer_key,
      clicked_at: new Date().toISOString(),
    };

    const newConfidence = 2; // clicked = confidence 2

    // Use upsert with onConflict
    const { error: beliefError } = await supabase
      .from('company_beliefs')
      .upsert({
        company_id,
        model_id,
        // Use greatest: only increase confidence, never decrease
        confidence: existingBelief
          ? Math.max(existingBelief.confidence, newConfidence)
          : newConfidence,
        source: 'offer_click',
        contact_id: contact_id || null,
        // Merge evidence: append new click to existing evidence
        evidence: existingBelief?.evidence
          ? {
              ...(existingBelief.evidence as any),
              offer_clicks: [
                ...((existingBelief.evidence as any)?.offer_clicks || []),
                newEvidence,
              ],
            }
          : { offer_clicks: [newEvidence] },
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'company_id,model_id',
      });

    if (beliefError) {
      console.error('[machine-selection] Error upserting belief:', beliefError);
      // Don't fail the request, belief is supplementary
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
