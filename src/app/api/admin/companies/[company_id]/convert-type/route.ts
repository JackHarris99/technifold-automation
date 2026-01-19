/**
 * POST /api/admin/companies/[company_id]/convert-type
 * Convert company between customer and distributor types
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, isDirector } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ company_id: string }> }
) {
  try {
    // Check if user is a director
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const { company_id } = await context.params;
    const body = await request.json();
    const { new_type } = body;

    // Validate new_type
    if (!new_type || !['customer', 'distributor'].includes(new_type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be "customer" or "distributor"' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get current company data
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('company_id, company_name, type')
      .eq('company_id', company_id)
      .single();

    if (fetchError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if already that type
    if (company.type === new_type) {
      return NextResponse.json(
        { error: `Company is already a ${new_type}` },
        { status: 400 }
      );
    }

    // Update company type
    const { error: updateError } = await supabase
      .from('companies')
      .update({ type: new_type })
      .eq('company_id', company_id);

    if (updateError) {
      console.error('[Convert Company Type] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update company type' },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabase.from('engagement_events').insert({
        company_id,
        occurred_at: new Date().toISOString(),
        event_type: 'admin_action',
        event_name: 'company_type_converted',
        source: 'admin_portal',
        meta: {
          old_type: company.type,
          new_type,
          converted_by: director.sales_rep_id,
        },
      });
    } catch (logError) {
      console.error('[Convert Company Type] Failed to log event:', logError);
      // Don't fail the request if logging fails
    }

    return NextResponse.json({
      success: true,
      company_id,
      old_type: company.type,
      new_type,
      message: `Company converted from ${company.type} to ${new_type}`,
    });
  } catch (error) {
    console.error('[Convert Company Type] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
