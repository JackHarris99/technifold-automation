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

    // Get company and first contact for the quote request
    const { data: contacts } = await supabase
      .from('contacts')
      .select('contact_id')
      .eq('company_id', company_id)
      .limit(1);

    const contact_id = contacts && contacts.length > 0 ? contacts[0].contact_id : null;

    // Get machine slug if machine_id provided
    let machine_slug = null;
    if (machine_id) {
      const { data: machine } = await supabase
        .from('machines')
        .select('slug')
        .eq('machine_id', machine_id)
        .single();
      machine_slug = machine?.slug || null;
    }

    // Create quote request entry
    const { data: quoteRequest, error } = await supabase
      .from('quote_requests')
      .insert({
        company_id,
        contact_id,
        machine_slug,
        status: 'requested',
        source: 'marketing_tab',
        marketing_token: null,
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
