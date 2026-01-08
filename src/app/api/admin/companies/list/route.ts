/**
 * GET /api/admin/companies/list
 * Fetch all companies for admin dropdown selections
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse session to get user info
    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const viewMode = searchParams.get('viewMode'); // 'my_customers' or null (all)

    const supabase = getSupabaseClient();

    let query = supabase
      .from('companies')
      .select('company_id, company_name')
      .order('company_name')
      .limit(1000);

    // Apply "My Customers" filter if requested
    if (viewMode === 'my_customers') {
      query = query.eq('account_owner', session.sales_rep_id);
    }

    const { data: companies, error } = await query;

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
