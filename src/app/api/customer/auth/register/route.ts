/**
 * POST /api/customer/auth/register
 * Customer registration endpoint
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { createCustomerSession, hashPassword } from '@/lib/customerAuth';

export async function POST(request: NextRequest) {
  try {
    const { email, password, first_name, last_name, company_id } = await request.json();

    // Validation
    if (!email || !password || !first_name || !last_name || !company_id) {
      return NextResponse.json(
        { error: 'All fields required' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('customer_users')
      .select('user_id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Verify company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('company_id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Invalid company' },
        { status: 400 }
      );
    }

    // Hash password
    const password_hash = await hashPassword(password);

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('customer_users')
      .insert({
        email: email.toLowerCase().trim(),
        password_hash,
        first_name,
        last_name,
        company_id,
        role: 'user', // Default role
      })
      .select()
      .single();

    if (createError || !newUser) {
      console.error('[Customer Register] Error creating user:', createError);
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      );
    }

    // Create session (auto-login)
    await createCustomerSession({
      user_id: newUser.user_id,
      company_id: newUser.company_id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role,
    });

    return NextResponse.json({
      success: true,
      user: {
        user_id: newUser.user_id,
        email: newUser.email,
        first_name: newUser.first_name,
        last_name: newUser.last_name,
      },
    });
  } catch (error: any) {
    console.error('[Customer Register] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
