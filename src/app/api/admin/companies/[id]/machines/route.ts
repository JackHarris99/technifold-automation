/**
 * GET /api/admin/companies/[id]/machines
 * Get machines for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('company_machine')
      .select(`
        company_machine_id,
        machine_id,
        confirmed,
        confidence_score,
        machines:machine_id(
          machine_id,
          brand,
          model,
          display_name,
          slug
        )
      `)
      .eq('company_id', id)
      .order('confidence_score', { ascending: false });

    if (error) {
      console.error('[admin/companies/machines] Error:', error);
      return NextResponse.json({ error: 'Failed to fetch machines' }, { status: 500 });
    }

    const machines = (data || []).map((row: any) => ({
      company_machine_id: row.company_machine_id,
      machine_id: row.machines.machine_id,
      brand: row.machines.brand,
      model: row.machines.model,
      display_name: row.machines.display_name,
      slug: row.machines.slug,
      confirmed: row.confirmed,
      confidence_score: row.confidence_score
    }));

    return NextResponse.json({ machines });
  } catch (err) {
    console.error('[admin/companies/machines] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
