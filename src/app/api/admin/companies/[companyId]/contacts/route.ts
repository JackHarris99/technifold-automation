/**
 * GET /api/admin/companies/[companyId]/contacts
 * Returns contacts for a specific company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await params;
    const supabase = getSupabaseClient();

    // Fetch contacts for the company
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('contact_id, full_name, email, marketing_status, gdpr_consent_at, zoho_contact_id')
      .eq('company_id', companyId)
      .order('full_name', { ascending: true });

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
