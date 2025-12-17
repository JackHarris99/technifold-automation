/**
 * GET /api/admin/contacts/list?company_id=xxx
 * Fetch contacts for a company for admin dropdown selections
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const companyId = searchParams.get('company_id');

    if (!companyId) {
      return NextResponse.json(
        { error: 'company_id query parameter is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    const { data: contacts, error } = await supabase
      .from('contacts')
      .select('contact_id, full_name, email')
      .eq('company_id', companyId)
      .order('full_name');

    if (error) {
      console.error('[contacts/list] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contacts: contacts || [],
    });
  } catch (error) {
    console.error('[contacts/list] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
