/**
 * GET /api/admin/companies/[companyId]/contacts
 * Returns contacts for a specific company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { verifyAdminAuth } from '@/lib/admin-auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ companyId: string }> }
) {
  // Verify admin authentication
  const authError = verifyAdminAuth(request);
  if (authError) return authError;

  try {
    const { companyId } = await params;
    const supabase = getSupabaseClient();

    // Fetch contacts for the company
    // Note: For system-check testing, fetching minimal fields without marketing filters
    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('contact_id, company_id, full_name, email')
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
