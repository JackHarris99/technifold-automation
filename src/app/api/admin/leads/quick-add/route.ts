/**
 * POST /api/admin/leads/quick-add
 * Comprehensive lead entry with auto territory assignment
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_name,
      company_website,
      contact_name,
      email,
      phone,
      job_title,
      machine_id,
      tool_codes,
      problem_solution_ids,
      source,
      notes
    } = body;

    if (!company_name || !contact_name || !email) {
      return NextResponse.json(
        { error: 'Company name, contact name, and email required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Generate next Sage-style company ID
    const prefix = company_name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '') || 'COM';
    const { data: existingIds } = await supabase
      .from('companies')
      .select('company_id')
      .like('company_id', `${prefix}%`)
      .order('company_id', { ascending: false })
      .limit(1);

    let nextNum = 1;
    if (existingIds && existingIds.length > 0) {
      const lastId = existingIds[0].company_id;
      const numPart = lastId.substring(prefix.length);
      nextNum = parseInt(numPart) + 1;
    }

    const company_id = `${prefix}${String(nextNum).padStart(3, '0')}`;

    // Auto-assign sales rep using counter function
    const { data: assignedRep, error: repError } = await supabase
      .rpc('assign_next_sales_rep');

    if (repError || !assignedRep) {
      console.error('[quick-add] Rep assignment failed:', repError);
      return NextResponse.json({ error: 'Failed to assign rep' }, { status: 500 });
    }

    const sales_rep_id = assignedRep as string;

    // Get rep name for response
    const { data: rep } = await supabase
      .from('sales_reps')
      .select('rep_name')
      .eq('rep_id', sales_rep_id)
      .single();

    // Create company
    const domain = email.split('@')[1]?.toLowerCase();
    const { error: companyError } = await supabase
      .from('companies')
      .insert({
        company_id,
        company_name,
        website: company_website || null,
        domain,
        category: 'customer',
        type: 'prospect',
        source: source || 'manual_entry',
        sales_rep_id,
        sales_rep_assigned_at: new Date().toISOString()
      });

    if (companyError) {
      console.error('[quick-add] Company error:', companyError);
      return NextResponse.json({ error: 'Company creation failed' }, { status: 500 });
    }

    // Create contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .insert({
        company_id,
        full_name: contact_name,
        email: email.toLowerCase(),
        phone: phone || null,
        role: job_title || null,
        source: source || 'manual_entry',
        status: 'active',
        marketing_status: 'subscribed',
        sales_rep_id
      })
      .select('contact_id')
      .single();

    if (contactError || !contact) {
      console.error('[quick-add] Contact error:', contactError);
      return NextResponse.json({ error: 'Contact creation failed' }, { status: 500 });
    }

    // Add machines if provided (multi-select)
    if (machine_ids && machine_ids.length > 0) {
      const machineInserts = machine_ids.map((machine_id: string) => ({
        company_id,
        machine_id,
        verified: true,  // Manual entry = verified
        source: 'sales_team_entry'
      }));

      await supabase.from('company_machine').insert(machineInserts);
    }

    // Add tools if provided
    if (tool_codes && tool_codes.length > 0) {
      const toolInserts = tool_codes.map((tool_code: string) => ({
        company_id,
        tool_code,
        total_units: 1,
        first_seen_at: new Date().toISOString().split('T')[0],
        last_seen_at: new Date().toISOString().split('T')[0]
      }));

      await supabase.from('company_tool').insert(toolInserts);
    }

    // Add interests if provided
    if (problem_solution_ids && problem_solution_ids.length > 0) {
      const interestInserts = problem_solution_ids.map((ps_id: string) => ({
        company_id,
        problem_solution_id: ps_id,
        status: 'interested',
        added_by_contact_id: contact.contact_id,
        source: 'sales_team_entry'
      }));

      await supabase.from('company_interests').insert(interestInserts);
    }

    // Track the manual entry
    await supabase.from('contact_interactions').insert({
      contact_id: contact.contact_id,
      company_id,
      interaction_type: source === 'phone_call' ? 'phone_call' : 'trade_show_meeting',
      metadata: {
        added_by: 'sales_team',
        notes: notes || null,
        tools_count: tool_codes?.length || 0,
        interests_count: problem_solution_ids?.length || 0
      },
      sales_rep_id
    });

    return NextResponse.json({
      success: true,
      company_id,
      contact_id: contact.contact_id,
      sales_rep_id,
      sales_rep_name: rep?.rep_name || 'Unknown'
    });

  } catch (err) {
    console.error('[quick-add] Error:', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
