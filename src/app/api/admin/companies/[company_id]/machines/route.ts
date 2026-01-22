/**
 * GET /api/admin/companies/[company_id]/machines
 * Returns machines for a specific company
 *
 * POST /api/admin/companies/[company_id]/machines
 * Add machine to company's plant list
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser, canActOnCompany } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ company_id: string }> }
) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_id: companyId } = await params;
    const supabase = getSupabaseClient();

    const { data, error } = await supabase
      .from('company_machine')
      .select(`
        id,
        machine_id,
        quantity,
        location,
        verified,
        source,
        notes,
        created_at,
        machine:machine_id (
          machine_id,
          brand,
          model,
          display_name,
          type
        )
      `)
      .eq('company_id', companyId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[machines-api] Error fetching machines:', error);
      return NextResponse.json({ error: 'Failed to fetch machines' }, { status: 500 });
    }

    return NextResponse.json({ machines: data || [] });
  } catch (err) {
    console.error('[machines-api] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ company_id: string }> }
) {
  try {
    const { company_id: companyId } = await context.params;
    const body = await request.json();

    // Check territory permission
    const permission = await canActOnCompany(companyId);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: 403 }
      );
    }

    const { machine_id, quantity, location, notes, source, verified } = body;

    if (!machine_id) {
      return NextResponse.json({ error: 'Machine ID is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Check if this machine is already in the plant list
    const { data: existing } = await supabase
      .from('company_machine')
      .select('id')
      .eq('company_id', companyId)
      .eq('machine_id', machine_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This machine is already in the plant list' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('company_machine')
      .insert({
        company_id: companyId,
        machine_id,
        quantity: quantity || 1,
        location: location || null,
        notes: notes || null,
        source: source || 'manual',
        verified: verified || false,
      })
      .select(`
        id,
        machine_id,
        quantity,
        location,
        verified,
        source,
        notes,
        created_at,
        machine:machine_id (
          machine_id,
          brand,
          model,
          display_name,
          type
        )
      `)
      .single();

    if (error) {
      console.error('Add machine error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, machine: data });
  } catch (error: any) {
    console.error('Add machine error:', error);
    return NextResponse.json({ error: error.message || 'Failed to add machine' }, { status: 500 });
  }
}
