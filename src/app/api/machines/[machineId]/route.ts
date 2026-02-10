/**
 * GET /api/machines/[machineId]
 * Get a single machine by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: { machineId: string } }
) {
  try {
    const { machineId } = params;
    const supabase = getSupabaseClient();

    const { data: machine, error } = await supabase
      .from('machines')
      .select('machine_id, slug, display_name, brand, model, type, description')
      .eq('machine_id', machineId)
      .eq('active', true)
      .single();

    if (error || !machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    return NextResponse.json(machine);
  } catch (error) {
    console.error('[Machine API] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
