/**
 * POST /api/admin/distributors/create
 * Create a new distributor company
 * SECURITY: Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { isDirector } from '@/lib/auth';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Directors only
    const director = await isDirector();
    if (!director) {
      return NextResponse.json(
        { error: 'Unauthorized - Directors only' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { company_name, country, account_owner, contact_name, contact_email } = body;

    if (!company_name) {
      return NextResponse.json({ error: 'Company name is required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Generate unique company_id (UUID for new companies)
    const company_id = randomUUID();

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
