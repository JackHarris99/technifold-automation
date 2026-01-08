/**
 * GET /api/admin/trials/list
 * Fetch all trial intents with company, contact, and machine info
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
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

    const { data, error } = await supabase
      .from('trial_intents')
      .select(`
        id,
        token,
        company_id,
        contact_id,
        machine_id,
        created_at,
        companies:company_id(company_name, account_owner),
        contacts:contact_id(full_name, email),
        machines:machine_id(brand, model, type)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[trials/list] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Transform data to flatten joined tables
    let trials = (data || []).map((trial: any) => ({
      id: trial.id,
      token: trial.token,
      company_id: trial.company_id,
      contact_id: trial.contact_id,
      machine_id: trial.machine_id,
      created_at: trial.created_at,
      company_name: trial.companies?.company_name || null,
      contact_name: trial.contacts?.full_name || null,
      contact_email: trial.contacts?.email || null,
      machine_brand: trial.machines?.brand || null,
      machine_model: trial.machines?.model || null,
      machine_type: trial.machines?.type || null,
      account_owner: trial.companies?.account_owner || null,
    }));

    // Apply "My Customers" filter
    if (viewMode === 'my_customers') {
      trials = trials.filter(trial => trial.account_owner === session.sales_rep_id);
    }

    // Remove account_owner from response (internal field)
    trials = trials.map(({ account_owner, ...trial }) => trial);

    return NextResponse.json({
      success: true,
      trials,
    });
  } catch (error) {
    console.error('[trials/list] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
