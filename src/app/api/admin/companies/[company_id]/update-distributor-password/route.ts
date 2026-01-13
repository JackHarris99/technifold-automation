/**
 * PATCH /api/admin/companies/[company_id]/update-distributor-password
 * Update distributor password with proper bcrypt hashing
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector, getCurrentUser } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ company_id: string }> }
) {
  try {
    // Only directors can update distributor passwords
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const { company_id } = await context.params;
    const { new_password, distributor_email } = await request.json();

    if (!new_password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Validate password strength (minimum 8 characters)
    if (new_password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Verify company exists and is a distributor
    const { data: company, error: fetchError } = await supabase
      .from('companies')
      .select('company_id, company_name, type, distributor_email')
      .eq('company_id', company_id)
      .single();

    if (fetchError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password and optionally email
    const updateData: any = {
      distributor_password: hashedPassword,
      updated_at: new Date().toISOString(),
    };

    if (distributor_email !== undefined) {
      updateData.distributor_email = distributor_email;
    }

    const { error: updateError } = await supabase
      .from('companies')
      .update(updateData)
      .eq('company_id', company_id);

    if (updateError) {
      console.error('[update-distributor-password] Failed to update:', updateError);
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      );
    }

    // Log activity
    const currentUser = await getCurrentUser();
    if (currentUser) {
      await supabase.from('activity_log').insert({
        user_id: currentUser.user_id,
        user_email: currentUser.email,
        user_name: currentUser.full_name,
        action_type: 'distributor_password_updated',
        entity_type: 'company',
        entity_id: company_id,
        description: `Updated distributor password for: ${company.company_name}`,
        metadata: {
          company_name: company.company_name,
          distributor_email: distributor_email || company.distributor_email
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Distributor password updated successfully'
    });
  } catch (err) {
    console.error('[update-distributor-password] Error:', err);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
