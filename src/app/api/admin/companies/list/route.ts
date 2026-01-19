/**
 * GET /api/admin/companies/list
 * Fetch all companies for admin dropdown selections
 * SECURITY: Uses standardized authentication
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Use standardized auth instead of custom session cookie
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const viewMode = searchParams.get('viewMode'); // 'my_customers' or null (all)

    const supabase = getSupabaseClient();

    // Fetch all companies with pagination
    let companies: any[] = [];
    let offset = 0;
    const batchSize = 1000;
    let hasMore = true;

    while (hasMore) {
      let query = supabase
        .from('companies')
        .select('company_id, company_name, account_owner')
        .neq('status', 'dead')  // Hide dead customers from dropdowns
        .order('company_name')
        .range(offset, offset + batchSize - 1);

      // Apply "My Customers" filter if requested
      if (viewMode === 'my_customers' && user.sales_rep_id) {
        query = query.eq('account_owner', user.sales_rep_id);
      }

      const { data: batch, error } = await query;

      if (error) {
        console.error('[companies/list] Error:', error);
        return NextResponse.json(
          { error: error.message },
          { status: 500 }
        );
      }

      if (!batch || batch.length === 0) {
        hasMore = false;
      } else {
        companies = [...companies, ...batch];
        if (batch.length < batchSize) {
          hasMore = false;
        }
        offset += batchSize;
      }
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
