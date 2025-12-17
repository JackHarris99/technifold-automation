/**
 * GET /api/admin/trials/list
 * Fetch all trial intents with company, contact, and machine info
 */

import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET() {
  try {
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
        companies:company_id(company_name),
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
    const trials = (data || []).map((trial: any) => ({
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
    }));

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
