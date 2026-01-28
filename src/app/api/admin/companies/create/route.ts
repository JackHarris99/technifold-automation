/**
 * POST /api/admin/companies/create
 * Create new company with automatic round-robin assignment to sales rep
 * Assignment logic: Rotate through sales reps in order (rep 1, rep 2, rep 3, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { validateCompanyCreation, sanitizeString } from '@/lib/request-validation';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = getSupabaseClient();

    const body = await request.json();

    // VALIDATION: Validate request body
    const validation = validateCompanyCreation(body);
    if (!validation.isValid) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          errors: validation.errors,
        },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const {
      company_name,
      website,
      country,
      billing_address_line_1,
      billing_address_line_2,
      billing_city,
      billing_state_province,
      billing_postal_code,
      billing_country,
      vat_number,
      company_reg_number,
    } = body;

    // 1. Fetch all ACTIVE sales reps only
    const { data: salesReps, error: repsError } = await supabase
      .from('users')
      .select('sales_rep_id, full_name, is_active')
      .eq('role', 'sales_rep')
      .eq('is_active', true)  // ONLY active sales reps
      .order('sales_rep_id');

    if (repsError || !salesReps || salesReps.length === 0) {
      console.error('[companies/create] Error fetching sales reps:', repsError);
      return NextResponse.json(
        { error: 'No active sales reps available for assignment' },
        { status: 500 }
      );
    }

    console.log('[companies/create] Active sales reps found:', salesReps.map(r => `${r.full_name} (${r.sales_rep_id})`));

    // 2. Count total companies to determine round-robin position
    const { count: totalCompaniesCount, error: countError } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('[companies/create] Error counting companies:', countError);
      return NextResponse.json(
        { error: 'Failed to calculate assignment' },
        { status: 500 }
      );
    }

    // 3. Use round-robin: next rep = (total_companies % number_of_reps)
    const totalCompanies = totalCompaniesCount || 0;
    const repIndex = totalCompanies % salesReps.length;
    const assignedRep = salesReps[repIndex].sales_rep_id;

    console.log('[companies/create] ===== ROUND-ROBIN ASSIGNMENT =====');
    console.log('[companies/create] Total companies:', totalCompanies);
    console.log('[companies/create] Number of sales reps:', salesReps.length);
    console.log('[companies/create] Next rep index:', repIndex);
    console.log('[companies/create] Assigned to:', `${salesReps[repIndex].full_name} (${assignedRep})`);

    // 4. Generate unique company_id (UUID for new companies)
    const companyId = randomUUID();

    // 5. Create company with assigned rep (with sanitized inputs)
    const { data: newCompany, error: createError } = await supabase
      .from('companies')
      .insert({
        company_id: companyId,
        company_name: sanitizeString(company_name),
        website: sanitizeString(website),
        country: sanitizeString(country),
        billing_address_line_1: sanitizeString(billing_address_line_1),
        billing_address_line_2: sanitizeString(billing_address_line_2),
        billing_city: sanitizeString(billing_city),
        billing_state_province: sanitizeString(billing_state_province),
        billing_postal_code: sanitizeString(billing_postal_code),
        billing_country: sanitizeString(billing_country),
        vat_number: sanitizeString(vat_number),
        company_reg_number: sanitizeString(company_reg_number),
        account_owner: assignedRep,
        type: 'customer',
        source: 'manual_entry',
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      console.error('[companies/create] Error creating company:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    // 6. Get assigned rep name for response
    const assignedRepData = salesReps.find(r => r.sales_rep_id === assignedRep);

    return NextResponse.json({
      success: true,
      company: newCompany,
      assigned_to: {
        sales_rep_id: assignedRep,
        full_name: assignedRepData?.full_name || assignedRep,
      },
    });
  } catch (error) {
    console.error('[companies/create] Exception:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
