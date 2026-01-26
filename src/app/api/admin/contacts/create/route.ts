/**
 * POST /api/admin/contacts/create
 * Create a new contact for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { validateContactCreation, sanitizeString } from '@/lib/request-validation';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    // VALIDATION: Validate request body
    const validation = validateContactCreation(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

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

    const supabase = getSupabaseClient();

    // Generate unique token for contact (for tokenized links)
    const contactToken = crypto.randomUUID();

    // Create contact (with sanitized inputs)
    const { data: contact, error: insertError } = await supabase
      .from('contacts')
      .insert({
        company_id,
        first_name: sanitizeString(first_name),
        last_name: sanitizeString(last_name),
        full_name: sanitizeString(full_name || `${first_name || ''} ${last_name || ''}`.trim()),
        email: sanitizeString(email),
        phone: sanitizeString(phone),
        role: sanitizeString(role),
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
