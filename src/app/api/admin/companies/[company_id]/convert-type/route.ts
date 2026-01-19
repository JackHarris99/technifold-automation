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

    let assignedRep: string | null = null;

    // If converting TO customer, auto-assign sales rep using fair distribution
    if (new_type === 'customer') {
      // Check if current account_owner is an active sales rep
      const { data: currentOwner } = await supabase
        .from('users')
        .select('sales_rep_id, is_active, role')
        .eq('sales_rep_id', company.account_owner || '')
        .eq('role', 'sales_rep')
        .eq('is_active', true)
        .single();

      // If no valid owner, assign using same logic as new company creation
      if (!currentOwner) {
        // 1. Fetch all ACTIVE sales reps
        const { data: salesReps, error: repsError } = await supabase
          .from('users')
          .select('sales_rep_id, full_name, is_active')
          .eq('role', 'sales_rep')
          .eq('is_active', true)
          .order('sales_rep_id');

        if (!repsError && salesReps && salesReps.length > 0) {
          // 2. Count TOTAL companies per rep (using pagination)
          let allCompanies: { account_owner: string | null }[] = [];
          let start = 0;
          const batchSize = 1000;
          let hasMore = true;

          while (hasMore) {
            const { data: batch } = await supabase
              .from('companies')
              .select('account_owner')
              .not('account_owner', 'is', null)
              .range(start, start + batchSize - 1);

            if (batch && batch.length > 0) {
              allCompanies = allCompanies.concat(batch);
              start += batchSize;
              hasMore = batch.length === batchSize;
            } else {
              hasMore = false;
            }
          }

          // 3. Count companies per rep
          const repCounts: { [key: string]: number } = {};
          salesReps.forEach(rep => {
            repCounts[rep.sales_rep_id] = 0;
          });

          allCompanies.forEach(comp => {
            if (comp.account_owner && repCounts[comp.account_owner] !== undefined) {
              repCounts[comp.account_owner]++;
            }
          });

          // 4. Find rep(s) with fewest total assignments
          const minCount = Math.min(...Object.values(repCounts));
          const repsWithFewest = Object.keys(repCounts).filter(
            rep => repCounts[rep] === minCount
          );

          // 5. If multiple reps tied, pick randomly
          const randomIndex = Math.floor(Math.random() * repsWithFewest.length);
          assignedRep = repsWithFewest[randomIndex];

          console.log('[Convert Type] Auto-assigned to sales rep:', assignedRep, 'with', minCount, 'companies');
        }
      }
    }

    // Update company type (and account_owner if assigned)
    const updateData: any = { type: new_type };
    if (assignedRep) {
      updateData.account_owner = assignedRep;
    }

    const { error: updateError } = await supabase
      .from('companies')
      .update(updateData)
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
      assigned_rep: assignedRep,
      message: assignedRep
        ? `Company converted from ${company.type} to ${new_type} and assigned to ${assignedRep}`
        : `Company converted from ${company.type} to ${new_type}`,
    });
  } catch (error) {
    console.error('[Convert Company Type] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
