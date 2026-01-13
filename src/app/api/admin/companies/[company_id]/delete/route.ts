/**
 * DELETE /api/admin/companies/[company_id]/delete
 * Permanently delete a company (directors only)
 * DANGEROUS: This is irreversible
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector, getCurrentUser } from '@/lib/auth';

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ company_id: string }> }
) {
  try {
    // SECURITY: Only directors can delete companies
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const { company_id } = await context.params;

    if (!company_id) {
      return NextResponse.json(
        { error: 'company_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get company name for logging
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('company_id', company_id)
      .single();

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Delete company (CASCADE will delete related records based on foreign keys)
    const { error: deleteError } = await supabase
      .from('companies')
      .delete()
      .eq('company_id', company_id);

    if (deleteError) {
      console.error('[delete-company] Error:', deleteError);
      return NextResponse.json(
        { error: 'Failed to delete company: ' + deleteError.message },
        { status: 500 }
      );
    }

    // Log the deletion
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await supabase.from('activity_log').insert({
        user_id: currentUser.user_id,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        action_type: 'company_deleted',
        entity_type: 'company',
        entity_id: company_id,
        description: `Permanently deleted company: ${company.company_name}`,
      });
    }

    console.log(`[delete-company] Company ${company.company_name} (${company_id}) deleted by ${currentUser?.full_name}`);

    return NextResponse.json({
      success: true,
      message: 'Company deleted successfully'
    });

  } catch (err: any) {
    console.error('[delete-company] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
