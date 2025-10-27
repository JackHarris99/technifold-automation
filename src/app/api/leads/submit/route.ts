/**
 * POST /api/leads/submit
 * Handles inbound lead submissions from machine/problem pages
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      company,
      email,
      phone,
      urgency,
      notes,
      machine_id,
      solution_id,
      problem_id
    } = body;

    // Validate required fields
    if (!name || !company || !email || !urgency) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Create engagement event
    const { error: eventError } = await supabase
      .from('engagement_events')
      .insert({
        source: 'vercel',
        event_type: 'inbound_lead',
        event_name: 'inbound_lead',
        session_id: crypto.randomUUID(),
        url: '/api/leads/submit',
        meta: {
          lead_data: {
            name,
            company,
            email,
            phone,
            urgency,
            notes,
            machine_id,
            solution_id,
            problem_id
          }
        }
      });

    if (eventError) {
      console.error('[leads/submit] Engagement event error:', eventError);
    }

    // Enqueue alert job in outbox
    const { error: outboxError } = await supabase
      .from('outbox')
      .insert({
        job_type: 'inbound_lead_alert',
        status: 'pending',
        attempts: 0,
        max_attempts: 3,
        payload: {
          lead: {
            name,
            company,
            email,
            phone,
            urgency,
            notes
          },
          machine_id,
          solution_id,
          problem_id,
          submitted_at: new Date().toISOString()
        }
      });

    if (outboxError) {
      console.error('[leads/submit] Outbox error:', outboxError);
      // Don't fail the request if outbox fails - lead is still captured in engagement_events
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[leads/submit] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
