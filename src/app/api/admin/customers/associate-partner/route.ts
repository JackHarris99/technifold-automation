/**
 * POST /api/admin/customers/associate-partner
 * Link a customer to a partner distributor for commission tracking
 * Directors only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Directors only
    const user = await getCurrentUser();
    if (!user || user.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized - Directors only' }, { status: 403 });
    }

    const body = await request.json();
    const {
      customer_id,
      distributor_id,
      tool_commission_rate,
      consumable_commission_rate,
      notes
    } = body;

    if (!customer_id || !distributor_id) {
      return NextResponse.json(
        { error: 'customer_id and distributor_id are required' },
        { status: 400 }
      );
    }

    // Default commission rates (20% tools, 10% consumables)
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

    // Verify customer exists and is type='customer'
    const { data: customer, error: customerError } = await supabase
      .from('companies')
      .select('company_id, company_name, type')
      .eq('company_id', customer_id)
      .single();

    if (customerError || !customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    if (customer.type !== 'customer') {
      return NextResponse.json(
        { error: 'Can only associate customers (not prospects/distributors)' },
        { status: 400 }
      );
    }

    // Verify partner exists and is distributor_type='partner'
    const { data: partner, error: partnerError } = await supabase
      .from('companies')
      .select('company_id, company_name, type, distributor_type')
      .eq('company_id', distributor_id)
      .single();

    if (partnerError || !partner) {
      return NextResponse.json(
        { error: 'Partner distributor not found' },
        { status: 404 }
      );
    }

    if (partner.type !== 'distributor' || partner.distributor_type !== 'partner') {
      return NextResponse.json(
        { error: 'Can only associate with partner distributors' },
        { status: 400 }
      );
    }

    // Check if relationship already exists
    const { data: existing } = await supabase
      .from('distributor_customers')
      .select('id')
      .eq('distributor_id', distributor_id)
      .eq('customer_id', customer_id)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This customer is already associated with this partner' },
        { status: 400 }
      );
    }

    // Create the association
    const { data: association, error: associationError } = await supabase
      .from('distributor_customers')
      .insert({
        distributor_id,
        customer_id,
        tool_commission_rate: toolRate,
        consumable_commission_rate: consumableRate,
        status: 'active',
        relationship_started_at: new Date().toISOString(),
        notes: notes || null,
      })
      .select()
      .single();

    if (associationError) {
      console.error('[Associate Partner] Error creating association:', associationError);
      return NextResponse.json(
        { error: associationError.message },
        { status: 500 }
      );
    }

    // Create activity log entry on customer
    await supabase
      .from('company_activities')
      .insert({
        company_id: customer_id,
        activity_type: 'partner_association',
        activity_title: 'Associated with Partner',
        activity_description: `Customer associated with partner "${partner.company_name}". Commission rates: ${toolRate}% on tools, ${consumableRate}% on consumables.`,
        performed_by: user.user_id,
        performed_at: new Date().toISOString(),
      });

    console.log(`[Associate Partner] Linked customer ${customer.company_name} to partner ${partner.company_name}`);

    return NextResponse.json({
      success: true,
      association,
      customer: {
        id: customer.company_id,
        name: customer.company_name,
      },
      partner: {
        id: partner.company_id,
        name: partner.company_name,
      },
      commission_rates: {
        tools: toolRate,
        consumables: consumableRate,
      },
      message: `"${customer.company_name}" successfully associated with partner "${partner.company_name}"`,
    });

  } catch (error: any) {
    console.error('[Associate Partner] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/customers/associate-partner
 * Remove partner association from a customer
 */
export async function DELETE(request: NextRequest) {
  try {
    // SECURITY: Directors only
    const user = await getCurrentUser();
    if (!user || user.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized - Directors only' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const customer_id = searchParams.get('customer_id');
    const distributor_id = searchParams.get('distributor_id');

    if (!customer_id || !distributor_id) {
      return NextResponse.json(
        { error: 'customer_id and distributor_id are required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Mark relationship as inactive
    const { error: updateError } = await supabase
      .from('distributor_customers')
      .update({
        status: 'inactive',
        relationship_ended_at: new Date().toISOString(),
      })
      .eq('distributor_id', distributor_id)
      .eq('customer_id', customer_id);

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // Create activity log
    await supabase
      .from('company_activities')
      .insert({
        company_id: customer_id,
        activity_type: 'partner_dissociation',
        activity_title: 'Partner Association Removed',
        activity_description: 'Customer dissociated from partner distributor.',
        performed_by: user.user_id,
        performed_at: new Date().toISOString(),
      });

    return NextResponse.json({
      success: true,
      message: 'Partner association removed',
    });

  } catch (error: any) {
    console.error('[Dissociate Partner] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
