/**
 * POST /api/leads/capture
 * Handle CaptureModal form submissions
 * Creates/updates company, contact, interests, and sends personalized marketing
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_name,
      contact_name,
      email,
      job_title,
      machine_id,
      problem_solution_ids
    } = body;

    // Validation
    if (!company_name || !contact_name || !email || !machine_id || !problem_solution_ids?.length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Extract email domain for company matching
    const emailDomain = email.split('@')[1]?.toLowerCase();

    // 1. Find or create company
    let company_id: string;

    // Try to find existing company by domain or name
    const { data: existingCompanies } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .or(`company_name.ilike.%${company_name}%,domain.eq.${emailDomain}`)
      .limit(1);

    if (existingCompanies && existingCompanies.length > 0) {
      // Existing company
      company_id = existingCompanies[0].company_id;
      console.log(`[leads/capture] Found existing company: ${company_id}`);
    } else {
      // Create new company with next available Sage-style ID
      const prefix = company_name.substring(0, 3).toUpperCase().replace(/[^A-Z]/g, '');

      // Find next number for this prefix
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

      company_id = `${prefix}${String(nextNum).padStart(3, '0')}`;

      const { error: companyError } = await supabase
        .from('companies')
        .insert({
          company_id,
          company_name,
          domain: emailDomain,
          type: 'prospect',
          source: 'website_form',
          category: 'prospect'
        });

      if (companyError) {
        console.error('[leads/capture] Company creation error:', companyError);
        return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
      }

      console.log(`[leads/capture] Created new company: ${company_id}`);
    }

    // 2. Find or create contact
    const { data: existingContacts } = await supabase
      .from('contacts')
      .select('contact_id')
      .eq('email', email.toLowerCase())
      .eq('company_id', company_id)
      .limit(1);

    let contact_id: string;

    if (existingContacts && existingContacts.length > 0) {
      // Update existing contact
      contact_id = existingContacts[0].contact_id;

      await supabase
        .from('contacts')
        .update({
          full_name: contact_name,
          role: job_title || null,
          status: 'active',
          marketing_status: 'subscribed'
        })
        .eq('contact_id', contact_id);

      console.log(`[leads/capture] Updated existing contact: ${contact_id}`);
    } else {
      // Create new contact
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          company_id,
          full_name: contact_name,
          email: email.toLowerCase(),
          role: job_title || null,
          source: 'website_form',
          status: 'active',
          marketing_status: 'subscribed'
        })
        .select('contact_id')
        .single();

      if (contactError || !newContact) {
        console.error('[leads/capture] Contact creation error:', contactError);
        return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
      }

      contact_id = newContact.contact_id;
      console.log(`[leads/capture] Created new contact: ${contact_id}`);
    }

    // 3. Record machine ownership
    if (machine_id) {
      await supabase
        .from('company_machine')
        .upsert({
          company_id,
          machine_id,
          verified: false,
          source: 'website_form'
        }, {
          onConflict: 'company_id,machine_id',
          ignoreDuplicates: false
        });
    }

    // 4. Record problem/solution interests
    for (const problem_solution_id of problem_solution_ids) {
      await supabase
        .from('company_interests')
        .upsert({
          company_id,
          problem_solution_id,
          status: 'interested',
          added_by_contact_id: contact_id,
          source: 'website_form'
        }, {
          onConflict: 'company_id,problem_solution_id',
          ignoreDuplicates: true
        });
    }

    // 5. Track the form submission
    await supabase
      .from('contact_interactions')
      .insert({
        contact_id,
        company_id,
        interaction_type: 'form_submit',
        url: request.nextUrl.pathname,
        metadata: {
          machine_id,
          problem_count: problem_solution_ids.length,
          source: 'website_capture_modal'
        }
      });

    // 6. Enqueue marketing email (will be processed by outbox worker)
    const { data: job } = await supabase
      .from('outbox')
      .insert({
        job_type: 'send_offer_email',
        status: 'pending',
        payload: {
          company_id,
          contact_ids: [contact_id],
          offer_key: 'machine_solutions',
          campaign_key: 'website_lead_capture'
        }
      })
      .select('job_id')
      .single();

    return NextResponse.json({
      success: true,
      company_id,
      contact_id,
      job_id: job?.job_id
    });

  } catch (err) {
    console.error('[leads/capture] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
