/**
 * GET /api/distributor/shipping-addresses
 * Fetch all shipping addresses for the distributor's company
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

    const { data: addresses, error } = await supabase
      .from('shipping_addresses')
      .select('*')
      .eq('company_id', distributor.company_id)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Distributor Shipping Addresses] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      addresses: addresses || [],
    });
  } catch (error) {
    console.error('[Distributor Shipping Addresses] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
