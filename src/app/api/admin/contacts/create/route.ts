/**
 * POST /api/admin/contacts/create
 * Create a new contact for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      first_name,
      last_name,
      full_name,
      email,
      phone,
      role,
      marketing_status,
    } = body;

    // Validation
    if (!company_id) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Generate unique token for contact (for tokenized links)
    const contactToken = crypto.randomUUID();

    // Create contact
    const { data: contact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        company_id,
        first_name: first_name || null,
        last_name: last_name || null,
        full_name: full_name || `${first_name || ''} ${last_name || ''}`.trim() || null,
        email,
        phone: phone || null,
        role: role || null,
        marketing_status: marketing_status || 'subscribed',
        source: 'manual',
        status: 'active',
        token: contactToken,
      })
      .select()
      .single();

    if (insertError) {
      console.error('[contacts/create] Insert error:', insertError);
      return NextResponse.json(
        { error: insertError.message },
        { status: 500 }
      );
    }

    console.log('[contacts/create] Created contact:', contact.contact_id);

    return NextResponse.json({
      success: true,
      contact,
    });
  } catch (error) {
    console.error('[contacts/create] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
