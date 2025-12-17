/**
 * GET /api/admin/companies/list
 * Fetch all companies for admin dropdown selections
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
    const supabase = getSupabaseClient();

    const { data: companies, error } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .order('company_name')
      .limit(1000);

    if (error) {
      console.error('[companies/list] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      companies: companies || [],
    });
  } catch (error) {
    console.error('[companies/list] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
