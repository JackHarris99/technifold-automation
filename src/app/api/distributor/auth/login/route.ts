/**
 * POST /api/distributor/auth/login
 * Authenticate distributor users
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { cookies } from 'next/headers';
import { SignJWT } from 'jose';
import bcrypt from 'bcryptjs';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-change-this'
);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Look up distributor company by email
    // Distributors should have type='distributor'
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name, type, account_owner, distributor_email, distributor_password')
      .eq('distributor_email', email)
      .eq('type', 'distributor')
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password (supports both hashed and plaintext during migration)
    let passwordValid = false;

    // Check if password is already hashed (bcrypt hashes start with $2a$ or $2b$)
    if (company.distributor_password && company.distributor_password.startsWith('$2')) {
      // Verify hashed password
      passwordValid = await bcrypt.compare(password, company.distributor_password);
    } else {
      // Legacy plaintext comparison - should be migrated to hashed
      passwordValid = company.distributor_password === password;

      // Auto-upgrade to hashed password on successful login
      if (passwordValid) {
        const hashedPassword = await bcrypt.hash(password, 10);
        await supabase
          .from('companies')
          .update({ distributor_password: hashedPassword })
          .eq('company_id', company.company_id);

        console.log(`[Distributor Login] Auto-upgraded password hash for ${company.company_name}`);
      }
    }

    if (!passwordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await new SignJWT({
      company_id: company.company_id,
      company_name: company.company_name,
      type: 'distributor',
      account_owner: company.account_owner,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .setIssuedAt()
      .sign(JWT_SECRET);

    // Set HTTP-only cookie
    const cookieStore = await cookies();
    cookieStore.set('distributor_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      distributor: {
        company_id: company.company_id,
        company_name: company.company_name,
      },
    });
  } catch (error) {
    console.error('[Distributor Login] Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
