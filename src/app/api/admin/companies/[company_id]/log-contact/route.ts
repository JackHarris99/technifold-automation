/**
 * API: Log Contact
 * POST /api/admin/companies/[company_id]/log-contact
 * Records manual contact (phone/email/visit) in engagement_events
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ company_id: string }> }
) {
  try {
    const { company_id } = await params;
    const { method, contact_id, notes } = await request.json();

    if (!method || !notes) {
      return NextResponse.json(
        { error: 'Method and notes are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Insert into engagement_events
    const { data, error } = await supabase
      .from('engagement_events')
      .insert({
        company_id,
        contact_id: contact_id || null,
        occurred_at: new Date().toISOString(),
        event_type: `manual_contact_${method}`,
        event_name: `Manual contact: ${method}`,
        source: 'admin_crm',
        meta: {
          notes,
          method,
        },
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to log contact:', error);
      return NextResponse.json(
        { error: 'Failed to log contact' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
