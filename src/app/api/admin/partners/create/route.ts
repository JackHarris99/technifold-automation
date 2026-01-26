/**
 * POST /api/admin/partners/create
 * Create a new partner distributor (commission-based model)
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { randomUUID } from 'crypto';
import { validateCompanyCreation, sanitizeString } from '@/lib/request-validation';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Directors only
    const user = await getCurrentUser();
    if (!user || user.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized - Directors only' }, { status: 403 });
    }

    const body = await request.json();

    // Validate basic company fields
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
      tool_commission_rate,
      consumable_commission_rate,
    } = body;

    // Default commission rates
    const toolRate = tool_commission_rate !== undefined ? tool_commission_rate : 20.00;
    const consumableRate = consumable_commission_rate !== undefined ? consumable_commission_rate : 10.00;

    // Validate commission rates
    if (toolRate < 0 || toolRate > 100) {
      return NextResponse.json(
        { error: 'Tool commission rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    if (consumableRate < 0 || consumableRate > 100) {
      return NextResponse.json(
        { error: 'Consumable commission rate must be between 0 and 100' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Generate unique company_id
    const companyId = randomUUID();

    // Create partner distributor company
    const { data: newPartner, error: createError } = await supabase
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
        type: 'distributor',
        distributor_type: 'partner',
        account_owner: 'Jack', // All distributors assigned to Jack
        source: 'manual_entry',
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      console.error('[Partner Create] Error creating partner:', createError);
      return NextResponse.json(
        { error: createError.message },
        { status: 500 }
      );
    }

    // Create activity log entry
    await supabase
      .from('company_activities')
      .insert({
        company_id: companyId,
        activity_type: 'creation',
        activity_title: 'Partner Distributor Created',
        activity_description: `New partner distributor created. Default commission rates: ${toolRate}% on tools, ${consumableRate}% on consumables.`,
        performed_by: user.user_id,
        performed_at: new Date().toISOString(),
      });

    console.log(`[Partner Create] Created partner distributor: ${company_name} (${companyId})`);

    return NextResponse.json({
      success: true,
      partner: newPartner,
      default_commission_rates: {
        tools: toolRate,
        consumables: consumableRate,
      },
      message: `Partner distributor "${company_name}" created successfully`,
    });

  } catch (error: any) {
    console.error('[Partner Create] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
