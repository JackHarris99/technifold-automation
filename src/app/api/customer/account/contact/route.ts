/**
 * PUT /api/customer/account/contact
 * Update contact information for logged-in customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { getSupabaseClient } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { first_name, last_name, email, phone } = body;

    // Validate required fields
    if (!first_name || !last_name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if email is already in use by another contact
    if (email !== session.email) {
      const { data: existing } = await supabase
        .from('contacts')
        .select('contact_id')
        .eq('email', email)
        .neq('contact_id', session.contact_id)
        .single();

      if (existing) {
        return NextResponse.json(
          { error: 'Email already in use' },
          { status: 400 }
        );
      }
    }

    // Update contact
    const { data: contact, error } = await supabase
      .from('contacts')
      .update({
        first_name,
        last_name,
        email,
        phone: phone || null,
      })
      .eq('contact_id', session.contact_id)
      .select()
      .single();

    if (error) {
      console.error('[Account Contact PUT] Error updating contact:', error);
      return NextResponse.json(
        { error: 'Failed to update contact information' },
        { status: 500 }
      );
    }

    return NextResponse.json({ contact });
  } catch (error: any) {
    console.error('[Account Contact PUT] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
