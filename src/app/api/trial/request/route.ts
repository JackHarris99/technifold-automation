/**
 * Trial Request API
 *
 * Flow:
 * 1. Create/update company + contact
 * 2. Generate HMAC tokenized link
 * 3. Queue email with trial link via outbox
 * 4. Trial link goes to /r/[token] → Stripe checkout
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { generateTrialToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const {
      machine_slug,
      offer_price,
      company_name,
      contact_name,
      email,
      phone,
    } = await request.json();

    const supabase = createServerClient();

    // Create or update company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert({
        company_name,
        source: 'trial_request',
        category: 'prospect',
      }, {
        onConflict: 'company_name',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (companyError || !company) {
      console.error('Company creation error:', companyError);
      return NextResponse.json({ error: 'Failed to create company' }, { status: 500 });
    }

    // Create or update contact
    const { data: contact, error: contactError } = await supabase
      .from('contacts')
      .upsert({
        company_id: company.company_id,
        full_name: contact_name,
        email,
        phone,
        marketing_status: 'subscribed'
      }, {
        onConflict: 'email',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (contactError || !contact) {
      console.error('Contact creation error:', contactError);
      return NextResponse.json({ error: 'Failed to create contact' }, { status: 500 });
    }

    // Get machine details
    const { data: machine } = await supabase
      .from('machines')
      .select('*')
      .eq('slug', machine_slug)
      .single();

    // Generate HMAC tokenized link for this trial
    const token = generateTrialToken({
      company_id: company.company_id,
      contact_id: contact.contact_id,
      machine_slug,
      offer_price,
      email,
      company_name,
      contact_name,
    });

    const trialLink = `${process.env.NEXT_PUBLIC_BASE_URL}/t/${token}`;

    // Queue email via outbox
    await supabase.from('outbox').insert({
      job_type: 'send_trial_email',
      status: 'pending',
      attempts: 0,
      payload: {
        contact_id: contact.contact_id,
        email,
        contact_name,
        company_name,
        machine_name: machine ? `${machine.brand} ${machine.model}` : 'your machine',
        machine_slug,
        offer_price,
        trial_link: trialLink,
        token,
      }
    });

    // Log engagement event
    await supabase.from('engagement_events').insert({
      company_id: company.company_id,
      contact_id: contact.contact_id,
      event_type: 'trial_requested',
      event_data: {
        machine_slug,
        machine_name: machine ? `${machine.brand} ${machine.model}` : null,
        offer_price,
        source: 'website',
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Trial email queued'
    });

  } catch (error: any) {
    console.error('Trial request error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process trial request' },
      { status: 500 }
    );
  }
}
