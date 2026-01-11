/**
 * GET /api/admin/companies/[company_id] - Fetch company details
 * PATCH /api/admin/companies/[company_id] - Update company settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ company_id: string }> }
) {
  try {
    const { company_id } = await context.params;

    const supabase = getSupabaseClient();
    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('company_id', company_id)
      .single();

    if (error) {
      console.error('Fetch company error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    return NextResponse.json(company);
  } catch (error: any) {
    console.error('Fetch company error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch company' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ company_id: string }> }
) {
  try {
    const { company_id: companyId } = await context.params;
    const body = await request.json();

    // Check territory permission
    const { canActOnCompany } = await import('@/lib/auth');
    const permission = await canActOnCompany(companyId);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: 403 }
      );
    }

    const { company_name, account_owner, type } = body;

    const supabase = getSupabaseClient();
    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (company_name !== undefined) updateData.company_name = company_name;
    if (account_owner !== undefined) updateData.account_owner = account_owner;
    if (type !== undefined) updateData.type = type;

    const { error } = await supabase
      .from('companies')
      .update(updateData)
      .eq('company_id', companyId);

    if (error) {
      console.error('Update company error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update company error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update company' }, { status: 500 });
  }
}
