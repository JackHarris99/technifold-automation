/**
 * API: Get companies for specific territory (account_owner filtered)
 * GET /api/admin/companies/territory?user_id={uuid}
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userId = searchParams.get('user_id');

  if (!userId) {
    return NextResponse.json({ error: 'user_id required' }, { status: 400 });
  }

  try {
    const supabase = getSupabaseClient();

    // Fetch companies assigned to this user
    const { data: companies, error: companiesError } = await supabase
      .from('companies')
      .select('company_id, company_name, country, account_owner')
      .eq('account_owner', userId)
      .order('company_name');

    if (companiesError) {
      console.error('[territory] Error fetching companies:', companiesError);
      return NextResponse.json({ error: companiesError.message }, { status: 500 });
    }

    // For each company, get machine count and subscription count
    const enrichedCompanies = await Promise.all(
      (companies || []).map(async (company) => {
        // Count machines
        const { count: machineCount } = await supabase
          .from('tools')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.company_id)
          .eq('status', 'active');

        // Count active subscriptions
        const { count: subscriptionCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.company_id)
          .in('status', ['active', 'trial']);

        // Check for active trials
        const { count: trialCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('company_id', company.company_id)
          .eq('status', 'trial');

        return {
          ...company,
          machine_count: machineCount || 0,
          subscription_count: subscriptionCount || 0,
          has_trial: (trialCount || 0) > 0,
        };
      })
    );

    return NextResponse.json({
      companies: enrichedCompanies,
      count: enrichedCompanies.length,
    });
  } catch (error) {
    console.error('[territory] Unexpected error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
