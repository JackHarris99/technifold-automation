/**
 * Custom Distributor Pricing API
 * Manage company-specific distributor pricing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_id, product_code, price } = await request.json();

    if (!company_id || !product_code || price === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Upsert custom pricing
    const { error } = await supabase
      .from('company_distributor_pricing')
      .upsert(
        {
          company_id,
          product_code,
          price: parseFloat(price),
        },
        {
          onConflict: 'company_id,product_code',
        }
      );

    if (error) {
      console.error('Error upserting custom pricing:', error);
      return NextResponse.json(
        { error: 'Failed to update pricing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in custom pricing API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { company_id, product_code } = await request.json();

    if (!company_id || !product_code) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Delete custom pricing
    const { error } = await supabase
      .from('company_distributor_pricing')
      .delete()
      .eq('company_id', company_id)
      .eq('product_code', product_code);

    if (error) {
      console.error('Error deleting custom pricing:', error);
      return NextResponse.json(
        { error: 'Failed to remove pricing' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in custom pricing API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
