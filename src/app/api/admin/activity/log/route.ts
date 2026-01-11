/**
 * POST /api/admin/activity/log
 * Log manual sales activity (calls, visits, emails, follow-ups)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

interface LogActivityRequest {
  company_id: string;
  contact_id?: string | null;
  activity_type: 'call' | 'visit' | 'email' | 'followup' | 'meeting';
  context?: 'quote_followup' | 'invoice_chase' | 'general';
  outcome?: string;
  notes?: string;
  // Optional: link to specific quote or invoice
  quote_id?: string;
  invoice_id?: string;
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: LogActivityRequest = await request.json();

    // Validate required fields
    if (!body.company_id || !body.activity_type) {
      return NextResponse.json(
        { error: 'Missing required fields: company_id, activity_type' },
        { status: 400 }
      );
    }

    // Build event_name based on activity type and context
    let eventName = 'manual_contact_';
    eventName += body.activity_type;
    if (body.context && body.context !== 'general') {
      eventName += `_${body.context}`;
    }

    // Build meta object with all contextual data
    const meta: Record<string, any> = {
      logged_by: currentUser.email,
      logged_by_name: currentUser.full_name,
    };

    if (body.outcome) meta.outcome = body.outcome;
    if (body.notes) meta.notes = body.notes;
    if (body.quote_id) meta.quote_id = body.quote_id;
    if (body.invoice_id) meta.invoice_id = body.invoice_id;

    // Insert into engagement_events
    const supabase = getSupabaseClient();
    const { data, error } = await supabase
      .from('engagement_events')
      .insert({
        company_id: body.company_id,
        contact_id: body.contact_id || null,
        event_name: eventName,
        event_type: 'manual_activity',
        occurred_at: new Date().toISOString(),
        source: 'crm_manual',
        meta: meta,
      })
      .select()
      .single();

    if (error) {
      console.error('[activity-log] Insert error:', error);
      return NextResponse.json(
        { error: 'Failed to log activity', details: error.message },
        { status: 500 }
      );
    }

    console.log(`[activity-log] Logged ${eventName} for company ${body.company_id} by ${currentUser.email}`);

    return NextResponse.json({
      success: true,
      event_id: data.event_id,
      event_name: eventName,
    });
  } catch (error) {
    console.error('[activity-log] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
