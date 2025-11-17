/**
 * API: Create Lead from Marketing Tab
 * Creates a quote request entry when customer shows interest via marketing preview
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      company_name,
      machine_id,
      machine_name,
      solution_id,
      solution_name,
      notes
    } = body;

    if (!company_id || !company_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get company details to find account owner
    const { data: company } = await supabase
      .from('companies')
      .select('account_owner')
      .eq('company_id', company_id)
      .single();

    // Create quote request entry
    const { data: quoteRequest, error } = await supabase
      .from('quote_requests')
      .insert({
        company_id,
        company_name,
        machine_id: machine_id || null,
        machine_name: machine_name || null,
        solution_interest: solution_name || null,
        notes: notes || `Interest via Marketing Tab: ${solution_name || 'General inquiry'}`,
        status: 'new',
        source: 'marketing_tab',
        assigned_to: company?.account_owner || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('[create-from-marketing] Error:', error);
      return NextResponse.json(
        { error: 'Failed to create quote request' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      quote_request: quoteRequest,
      message: 'Quote request created successfully'
    });

  } catch (error) {
    console.error('[create-from-marketing] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
