/**
 * GET /api/distributor/company-details
 * Fetch company billing details for the distributor
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentDistributor } from '@/lib/distributorAuth';

export async function GET() {
  try {
    const distributor = await getCurrentDistributor();

    if (!distributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const { data: company, error } = await supabase
      .from('companies')
      .select('company_id, company_name, billing_address_line_1, billing_address_line_2, billing_city, billing_state_province, billing_postal_code, billing_country')
      .eq('company_id', distributor.company_id)
      .single();

    if (error) {
      console.error('[Distributor Company Details] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch company details' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error('[Distributor Company Details] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
