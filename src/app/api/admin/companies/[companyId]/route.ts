/**
 * PATCH /api/admin/companies/[companyId]
 * Update company settings
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ companyId: string }> }
) {
  try {
    const { companyId } = await context.params;
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

    const { company_name, account_owner, category } = body;

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (company_name !== undefined) updateData.company_name = company_name;
    if (account_owner !== undefined) updateData.account_owner = account_owner;
    if (category !== undefined) updateData.category = category;

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
