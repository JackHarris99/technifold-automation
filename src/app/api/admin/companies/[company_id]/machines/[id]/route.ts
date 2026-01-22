/**
 * PATCH /api/admin/companies/[company_id]/machines/[id]
 * Update machine details (quantity, location, notes, verified status)
 *
 * DELETE /api/admin/companies/[company_id]/machines/[id]
 * Remove machine from company's plant list
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { canActOnCompany } from '@/lib/auth';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ company_id: string; id: string }> }
) {
  try {
    const { company_id: companyId, id } = await context.params;
    const body = await request.json();

    // Check territory permission
    const permission = await canActOnCompany(companyId);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();

    // Build update object with only provided fields
    const updates: any = {};
    if (body.quantity !== undefined) updates.quantity = body.quantity;
    if (body.location !== undefined) updates.location = body.location || null;
    if (body.notes !== undefined) updates.notes = body.notes || null;
    if (body.verified !== undefined) updates.verified = body.verified;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('company_machine')
      .update(updates)
      .eq('id', id)
      .eq('company_id', companyId)
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
      console.error('Update machine error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, machine: data });
  } catch (error: any) {
    console.error('Update machine error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update machine' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ company_id: string; id: string }> }
) {
  try {
    const { company_id: companyId, id } = await context.params;

    // Check territory permission
    const permission = await canActOnCompany(companyId);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();

    const { error } = await supabase
      .from('company_machine')
      .delete()
      .eq('id', id)
      .eq('company_id', companyId);

    if (error) {
      console.error('Delete machine error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete machine error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete machine' }, { status: 500 });
  }
}
