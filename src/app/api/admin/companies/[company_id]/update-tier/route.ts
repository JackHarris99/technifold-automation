/**
 * PATCH /api/admin/companies/[company_id]/update-tier
 * Update distributor pricing tier
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ company_id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_id } = await params;
    const { pricing_tier } = await request.json();

    if (!pricing_tier || !['tier_1', 'tier_2', 'tier_3'].includes(pricing_tier)) {
      return NextResponse.json({ error: 'Invalid pricing tier' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Update company pricing tier
    const { error } = await supabase
      .from('companies')
      .update({
        pricing_tier,
        updated_at: new Date().toISOString()
      })
      .eq('company_id', company_id);

    if (error) {
      console.error('Error updating pricing tier:', error);
      return NextResponse.json({ error: 'Failed to update pricing tier' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      pricing_tier
    });
  } catch (error) {
    console.error('Update tier error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
