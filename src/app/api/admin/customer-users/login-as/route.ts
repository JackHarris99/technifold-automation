/**
 * POST /api/admin/customer-users/login-as
 * Admin-only: Generate a temporary session to preview customer portal
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { createCustomerSession } from '@/lib/customerAuth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get customer user details including contact_id
    const { data: user, error: userError } = await supabase
      .from('customer_users')
      .select('*, companies(company_name)')
      .eq('user_id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'User is not active' }, { status: 400 });
    }

    // Create customer session using the same helper as regular login
    // Mark as internal preview so engagement events are filtered out
    await createCustomerSession({
      user_id: user.user_id,
      company_id: user.company_id,
      contact_id: user.contact_id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role || 'user',
      internal_preview: true, // Admin preview session
    });

    return NextResponse.json({
      success: true,
      message: `Preview session created for ${user.first_name} ${user.last_name}`,
      redirect: '/customer/portal',
    });
  } catch (error: any) {
    console.error('[Customer Login As] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
