/**
 * GET /api/admin/companies/[companyId]/contacts
 * Returns contacts for a specific company
 *
 * POST /api/admin/companies/[companyId]/contacts
 * Add new contact to company
 *
 * Note: This endpoint is used by the system-check page which is already
 * protected by the admin layout. No additional auth needed here.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const supabaseGet = getSupabaseClient();

    // Fetch contacts for the company
    // Note: For system-check testing, fetching minimal fields without marketing filters
    // Removing 1000 row limit to fetch ALL contacts for this company
    const { data: contacts, error } = await supabaseGet
      .from('contacts')
      .select('contact_id, company_id, full_name, email')
      .eq('company_id', companyId)
      .order('full_name', { ascending: true })
      .range(0, 9999); // Fetch up to 10,000 contacts per company

    if (error) {
      console.error('[contacts-api] Error fetching contacts:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts' }, { status: 500 });
    }

    return NextResponse.json({ contacts: contacts || [] });
  } catch (err) {
    console.error('[contacts-api] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await context.params;
    const body = await request.json();

    const { first_name, last_name, full_name, email, role, marketing_status } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('contacts')
      .insert({
        company_id: companyId,
        first_name,
        last_name,
        full_name: full_name || `${first_name} ${last_name}`.trim(),
        email,
        role,
        marketing_status: marketing_status || 'subscribed',
      })
      .select()
      .single();

    if (error) {
      console.error('Add contact error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, contact: data });
  } catch (error: any) {
    console.error('Add contact error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add contact' }, { status: 500 });
  }
}
