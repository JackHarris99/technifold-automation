/**
 * POST /api/machines/capture
 * Captures machine ownership for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      contact_id,
      machine_slug,
      source,
      offer_key,
      campaign_key
    } = body;

    if (!company_id || !machine_slug) {
      return NextResponse.json(
        { error: 'company_id and machine_slug are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get machine_id from slug
    const { data: machine, error: machineError } = await supabase
      .from('machines')
      .select('machine_id, display_name')
      .eq('slug', machine_slug)
      .single();

    if (machineError || !machine) {
      console.error('[machines/capture] Machine not found:', machineError);
      return NextResponse.json(
        { error: 'Machine not found' },
        { status: 404 }
      );
    }

    // Check if this company-machine pair already exists
    const { data: existing } = await supabase
      .from('company_machine')
      .select('company_machine_id, confidence_score')
      .eq('company_id', company_id)
      .eq('machine_id', machine.machine_id)
      .single();

    if (existing) {
      // Update existing record if it's unconfirmed and has lower confidence
      if (!existing.confirmed && (existing.confidence_score || 0) < 5) {
        const { error: updateError } = await supabase
          .from('company_machine')
          .update({
            source: source || 'self_report',
            confidence_score: 5,
            updated_at: new Date().toISOString()
          })
          .eq('company_machine_id', existing.company_machine_id);

        if (updateError) {
          console.error('[machines/capture] Update error:', updateError);
          return NextResponse.json(
            { error: 'Failed to update machine record' },
            { status: 500 }
          );
        }
      }
    } else {
      // Insert new company_machine record
      const { error: insertError } = await supabase
        .from('company_machine')
        .insert({
          company_id,
          machine_id: machine.machine_id,
          source: source || 'self_report',
          confirmed: false,
          confidence_score: 5,
          notes: `Self-reported via ${offer_key ? 'offer: ' + offer_key : 'machine finder'}`
        });

      if (insertError) {
        console.error('[machines/capture] Insert error:', insertError);
        return NextResponse.json(
          { error: 'Failed to save machine record' },
          { status: 500 }
        );
      }
    }

    // Log engagement event
    const { error: eventError } = await supabase
      .from('engagement_events')
      .insert({
        company_id,
        contact_id: contact_id || null,
        source: 'vercel',
        event_type: 'machine_self_report',
        event_name: 'machine_self_report',
        offer_key: offer_key || null,
        campaign_key: campaign_key || null,
        url: `/api/machines/capture`,
        meta: {
          machine_id: machine.machine_id,
          machine_slug,
          machine_display_name: machine.display_name
        }
      });

    if (eventError) {
      console.error('[machines/capture] Engagement event error:', eventError);
      // Don't fail the request if event logging fails
    }

    return NextResponse.json({
      success: true,
      machine_id: machine.machine_id,
      machine_name: machine.display_name
    });
  } catch (err) {
    console.error('[machines/capture] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
