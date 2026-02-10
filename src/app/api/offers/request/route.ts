/**
 * POST /api/offers/request
 * Handle Smart Modal offer requests
 * Creates offer intent and queues personalized offer email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { generateToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      // Contact info
      email,
      full_name,
      company_name,
      phone,

      // Offer details
      machine_ids, // Array of machine UUIDs
      problem_slug,

      // Source tracking
      source, // 'website', 'email', 'admin', 'sales_rep'
      source_url,
      source_campaign_id,
      source_template_id,
      token, // If triggered from email click (contains contact context)
    } = body;

    // Validation
    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'Email and name are required' },
        { status: 400 }
      );
    }

    if (!machine_ids || !Array.isArray(machine_ids) || machine_ids.length === 0) {
      return NextResponse.json(
        { error: 'At least one machine must be selected' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // 1. Upsert company
    let companyId: string;

    if (company_name) {
      // Check if company exists
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('company_id')
        .ilike('company_name', company_name)
        .maybeSingle();

      if (existingCompany) {
        companyId = existingCompany.company_id;
      } else {
        // Create new company
        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            company_name,
            customer_status: 'prospect',
            lifecycle_stage: 'lead',
          })
          .select('company_id')
          .single();

        if (companyError || !newCompany) {
          console.error('[Offer Request] Failed to create company:', companyError);
          return NextResponse.json(
            { error: 'Failed to create company' },
            { status: 500 }
          );
        }

        companyId = newCompany.company_id;
      }
    } else {
      // No company name - create generic one
      const { data: newCompany, error: companyError } = await supabase
        .from('companies')
        .insert({
          company_name: `${full_name}'s Company`,
          customer_status: 'prospect',
          lifecycle_stage: 'lead',
        })
        .select('company_id')
        .single();

      if (companyError || !newCompany) {
        console.error('[Offer Request] Failed to create company:', companyError);
        return NextResponse.json(
          { error: 'Failed to create company' },
          { status: 500 }
        );
      }

      companyId = newCompany.company_id;
    }

    // 2. Upsert contact
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('contact_id')
      .eq('email', email.toLowerCase())
      .maybeSingle();

    let contactId: string;

    if (existingContact) {
      contactId = existingContact.contact_id;

      // Update contact info if changed
      await supabase
        .from('contacts')
        .update({
          first_name: full_name.split(' ')[0],
          last_name: full_name.split(' ').slice(1).join(' ') || null,
          phone,
          company_id: companyId,
        })
        .eq('contact_id', contactId);
    } else {
      // Create new contact
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          email: email.toLowerCase(),
          first_name: full_name.split(' ')[0],
          last_name: full_name.split(' ').slice(1).join(' ') || null,
          phone,
          company_id: companyId,
          contact_status: 'active',
        })
        .select('contact_id')
        .single();

      if (contactError || !newContact) {
        console.error('[Offer Request] Failed to create contact:', contactError);
        return NextResponse.json(
          { error: 'Failed to create contact' },
          { status: 500 }
        );
      }

      contactId = newContact.contact_id;
    }

    // 3. Fetch machine details for token
    const { data: machines } = await supabase
      .from('machines')
      .select('machine_id, slug, display_name, brand, model, type')
      .in('machine_id', machine_ids);

    if (!machines || machines.length === 0) {
      return NextResponse.json(
        { error: 'Selected machines not found' },
        { status: 404 }
      );
    }

    // 4. Generate offer token
    const offerToken = generateToken(
      {
        company_id: companyId,
        contact_id: contactId,
        object_type: 'offer',
        // Store machine slugs and problem in token
        machine_slug: machines[0].slug, // Primary machine
        offer_key: `${machines[0].slug}_${problem_slug || 'general'}`,
      } as any,
      168 // 7 days TTL
    );

    // 5. Create offer intent record
    const { data: offerIntent, error: intentError } = await supabase
      .from('offer_intents')
      .insert({
        contact_id: contactId,
        company_id: companyId,
        machine_ids,
        problem_slug,
        source,
        source_url,
        source_campaign_id,
        source_template_id,
        token: offerToken,
        token_expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        metadata: {
          machines: machines.map(m => ({
            id: m.machine_id,
            slug: m.slug,
            name: m.display_name,
          })),
          contact_name: full_name,
          contact_email: email,
        },
      })
      .select()
      .single();

    if (intentError || !offerIntent) {
      console.error('[Offer Request] Failed to create offer intent:', intentError);
      return NextResponse.json(
        { error: 'Failed to create offer intent' },
        { status: 500 }
      );
    }

    // 6. Queue offer email via outbox
    const offerUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'https://technifold.com'}/offer/${offerToken}`;

    const { error: outboxError } = await supabase.from('outbox').insert({
      job_type: 'send_offer_email',
      recipient_email: email,
      recipient_name: full_name,
      payload: {
        contact_id: contactId,
        company_id: companyId,
        offer_intent_id: offerIntent.offer_intent_id,
        machines: machines.map(m => ({
          slug: m.slug,
          name: m.display_name,
          brand: m.brand,
          model: m.model,
          type: m.type,
        })),
        problem_slug,
        offer_url: offerUrl,
        token: offerToken,
      },
      priority: 1,
      status: 'pending',
    });

    if (outboxError) {
      console.error('[Offer Request] Failed to queue email:', outboxError);
      // Don't fail the request, just log
    }

    // 7. Track engagement event
    try {
      await supabase.from('engagement_events').insert({
        contact_id: contactId,
        company_id: companyId,
        occurred_at: new Date().toISOString(),
        event_type: 'offer_requested',
        event_name: 'Offer requested via Smart Modal',
        source,
        meta: {
          offer_intent_id: offerIntent.offer_intent_id,
          machines: machines.map(m => m.display_name),
          problem: problem_slug,
          source_url,
        },
      });
    } catch (eventError) {
      console.error('[Offer Request] Failed to log event:', eventError);
      // Don't fail the request
    }

    return NextResponse.json({
      success: true,
      offer_intent_id: offerIntent.offer_intent_id,
      message: 'Success! Check your email for your personalized offer.',
      offer_url: offerUrl, // Return for immediate redirect option
    });
  } catch (error) {
    console.error('[Offer Request] Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}
