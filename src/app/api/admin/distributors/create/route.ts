/**
 * POST /api/admin/distributors/create
 * Create a new distributor company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { company_name, country, account_owner, contact_name, contact_email } = body;

    if (!company_name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Generate company_id (e.g., "DIST-001", "DIST-002", etc.)
    const { data: existingDistributors } = await supabase
      .from('companies')
      .select('company_id')
      .eq('type', 'distributor')
      .like('company_id', 'DIST-%')
      .order('company_id', { ascending: false })
      .limit(1);

    let nextNumber = 1;
    if (existingDistributors && existingDistributors.length > 0) {
      const lastId = existingDistributors[0].company_id;
      const match = lastId.match(/DIST-(\d+)/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
      }
    }

    const company_id = `DIST-${String(nextNumber).padStart(3, '0')}`;

    // Create company record
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .insert({
        company_id,
        company_name,
        type: 'distributor',
        country: country || null,
        account_owner: account_owner || null,
        status: 'active',
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (companyError) {
      console.error('[Create Distributor] Company insert error:', companyError);
      return NextResponse.json({ error: 'Failed to create distributor company' }, { status: 500 });
    }

    // Create contact if provided
    if (contact_name && contact_email) {
      const { error: contactError } = await supabase
        .from('contacts')
        .insert({
          company_id,
          full_name: contact_name,
          email: contact_email,
          role: 'Primary Contact',
          created_at: new Date().toISOString(),
        });

      if (contactError) {
        console.error('[Create Distributor] Contact insert error:', contactError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      company_id,
      message: 'Distributor created successfully',
    });
  } catch (error: any) {
    console.error('[Create Distributor] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
