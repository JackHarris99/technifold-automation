/**
 * PATCH /api/admin/companies/[companyId]/contacts/[contactId]
 * Update contact details
 *
 * DELETE /api/admin/companies/[companyId]/contacts/[contactId]
 * Delete contact
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ companyId: string; contactId: string }> }
) {
  try {
    const { companyId, contactId } = await context.params;
    const body = await request.json();

    // Check territory permission
    const { canActOnCompany } = await import('@/lib/auth');
    const permission = await canActOnCompany(companyId);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: 403 }
      );
    }

    const updateData: any = {};

    if (body.first_name !== undefined) updateData.first_name = body.first_name;
    if (body.last_name !== undefined) updateData.last_name = body.last_name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.role !== undefined) updateData.role = body.role;
    if (body.marketing_status !== undefined) {
      updateData.marketing_status = body.marketing_status;

      // Set gdpr_consent_at if subscribing
      if (body.marketing_status === 'subscribed' && !body.gdpr_consent_at) {
        updateData.gdpr_consent_at = new Date().toISOString();
      }
    }

    // Update full_name if first or last name changed
    if (body.first_name || body.last_name) {
      const { data: contact } = await supabase
        .from('contacts')
        .select('first_name, last_name')
        .eq('contact_id', contactId)
        .single();

      const firstName = body.first_name || contact?.first_name || '';
      const lastName = body.last_name || contact?.last_name || '';
      updateData.full_name = `${firstName} ${lastName}`.trim();
    }

    const { error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('contact_id', contactId);

    if (error) {
      console.error('Update contact error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Update contact error:', error);
    return NextResponse.json({ error: error.message || 'Failed to update contact' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ companyId: string; contactId: string }> }
) {
  try {
    const { companyId, contactId } = await context.params;

    // Check territory permission
    const { canActOnCompany } = await import('@/lib/auth');
    const permission = await canActOnCompany(companyId);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: 403 }
      );
    }

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('contact_id', contactId);

    if (error) {
      console.error('Delete contact error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Delete contact error:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete contact' }, { status: 500 });
  }
}
