/**
 * POST /api/admin/companies/[company_id]/change-owner
 * Change the account_owner (sales rep) for a company
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { isDirector } from '@/lib/auth';
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
    const { new_owner } = body;

    if (!new_owner) {
      return NextResponse.json(
        { error: 'new_owner (sales_rep_id) is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify new owner is an active sales rep or director with sales_rep_id
    const { data: salesRep, error: repError } = await supabase
      .from('users')
      .select('sales_rep_id, full_name, is_active, role')
      .eq('sales_rep_id', new_owner)
      .eq('is_active', true)
      .or('role.eq.sales_rep,role.eq.director')
      .single();

    if (repError || !salesRep) {
      return NextResponse.json(
        { error: 'Invalid sales rep or sales rep is not active' },
        { status: 400 }
      );
    }

    // Get current company data
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('company_id, company_name, account_owner')
      .eq('company_id', company_id)
      .single();

    if (fetchError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Check if already assigned to this rep
    if (company.account_owner === new_owner) {
      return NextResponse.json(
        { error: `Company is already assigned to ${salesRep.full_name}` },
        { status: 400 }
      );
    }

    // Update account owner
    const { error: updateError } = await supabase
      .from('companies')
      .update({ account_owner: new_owner })
      .eq('company_id', company_id);

    if (updateError) {
      console.error('[Change Owner] Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to change account owner' },
        { status: 500 }
      );
    }

    // Log activity
    try {
      await supabase.from('engagement_events').insert({
        company_id,
        occurred_at: new Date().toISOString(),
        event_type: 'admin_action',
        event_name: 'account_owner_changed',
        source: 'admin_portal',
        meta: {
          old_owner: company.account_owner,
          new_owner,
          changed_by: director.sales_rep_id,
        },
      });
    } catch (logError) {
      console.error('[Change Owner] Failed to log event:', logError);
    }

    return NextResponse.json({
      success: true,
      company_id,
      old_owner: company.account_owner,
      new_owner,
      new_owner_name: salesRep.full_name,
      message: `Company reassigned to ${salesRep.full_name}`,
    });
  } catch (error) {
    console.error('[Change Owner] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
