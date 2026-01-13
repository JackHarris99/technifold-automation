/**
 * GET /api/admin/subscriptions/list
 * Fetch all subscriptions and anomalies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');

    if (!sessionCookie) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse session to get user info
    let session;
    try {
      session = JSON.parse(sessionCookie.value);
    } catch {
      return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const viewMode = searchParams.get('viewMode'); // 'my_customers' or null (all)

    const supabase = getSupabaseClient();

    // Load subscriptions
    const { data: subscriptions, error: subsError } = await supabase
      .from('v_active_subscriptions')
      .select('*')
      .order('created_at', { ascending: false });

    if (subsError) {
      console.error('[subscriptions/list] Error:', subsError);
      return NextResponse.json(
        { error: subsError.message },
        { status: 500 }
      );
    }

    // Load anomalies (ratchet violations) - optional view
    const { data: anomalies, error: anomalyError } = await supabase
      .from('v_subscription_anomalies')
      .select('*')
      .order('updated_at', { ascending: false });

    if (anomalyError) {
      console.warn('[subscriptions/list] Anomaly load error (view may not exist):', anomalyError);
      // Don't fail if view doesn't exist
    }

    // Filter by account ownership if needed
    let filteredSubscriptions = subscriptions || [];
    let filteredAnomalies = anomalies || [];

    if (viewMode === 'my_customers') {
      // Get company IDs owned by this user
      const { data: companies } = await supabase
        .from('companies')
        .select('company_id')
        .eq('account_owner', session.sales_rep_id);

      const myCompanyIds = new Set(companies?.map(c => c.company_id) || []);

      filteredSubscriptions = filteredSubscriptions.filter(sub =>
        myCompanyIds.has(sub.company_id)
      );

      filteredAnomalies = filteredAnomalies.filter(anomaly =>
        myCompanyIds.has(anomaly.company_id)
      );
    }

    return NextResponse.json({
      success: true,
      subscriptions: filteredSubscriptions,
      anomalies: filteredAnomalies,
    });
  } catch (error) {
    console.error('[subscriptions/list] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
