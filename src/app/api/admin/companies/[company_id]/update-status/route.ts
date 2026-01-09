/**
 * PATCH /api/admin/companies/[company_id]/update-status
 * Update company status (active/inactive/dead)
 * Only the account owner can change the status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ company_id: string }> }
) {
  try {
    const { company_id } = await params;

    if (!company_id) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    const cookieStore = await cookies();
    const userCookie = cookieStore.get('current_user');

    if (!userCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const session = JSON.parse(userCookie.value);
    const supabase = getSupabaseClient();

    const body = await request.json();
    const { status } = body;

    if (!status || !['active', 'inactive', 'dead'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be: active, inactive, or dead' },
        { status: 400 }
      );
    }

    // Verify ownership
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('account_owner, company_name, status')
      .eq('company_id', company_id)
      .single();

    if (fetchError || !company) {
      console.error('[update-status] Error fetching company:', fetchError);
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Only account owner can change status
    if (company.account_owner !== session.sales_rep_id) {
      return NextResponse.json(
        { error: 'Only the account owner can change company status' },
        { status: 403 }
      );
    }

    // Update status
    const { data: updatedCompany, error: updateError } = await supabase
      .from('companies')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('company_id', company_id)
      .select()
      .single();

    if (updateError) {
      console.error('[update-status] Error updating status:', updateError);
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    console.log(
      `[update-status] ${session.sales_rep_id} changed ${company.company_name} from ${company.status} to ${status}`
    );

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      previous_status: company.status,
    });
  } catch (error) {
    console.error('[update-status] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
