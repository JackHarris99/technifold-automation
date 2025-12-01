/**
 * Quick Test: Create Sample Subscription
 * POST /api/admin/subscriptions/test-create
 *
 * Creates a test subscription with real data for verification
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  const supabase = getSupabaseClient();

  try {
    // Get first customer company with contacts
    const { data: company } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('category', 'customer')
      .limit(1)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'No customer companies found' }, { status: 404 });
    }

    // Get a contact for this company
    const { data: contact } = await supabase
      .from('contacts')
      .select('contact_id, email, full_name')
      .eq('company_id', company.company_id)
      .limit(1)
      .single();

    // Create test subscription
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 30); // 30-day trial

    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        company_id: company.company_id,
        contact_id: contact?.contact_id || null,
        monthly_price: 159.00,
        currency: 'GBP',
        tools: ['TRI-CREASER-FF-OR', 'TRI-CREASER-FF-BL'],
        status: 'trial',
        trial_start_date: new Date().toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        ratchet_max: 159.00,
        created_by: 'test-api',
        notes: 'Test subscription created via API'
      })
      .select()
      .single();

    if (subError) {
      console.error('[test-create] Subscription error:', subError);
      return NextResponse.json({ error: subError.message }, { status: 500 });
    }

    // Create event
    await supabase
      .from('subscription_events')
      .insert({
        subscription_id: subscription.subscription_id,
        event_type: 'created',
        event_name: 'subscription_created',
        new_value: {
          monthly_price: 159.00,
          tools: ['TRI-CREASER-FF-OR', 'TRI-CREASER-FF-BL'],
          status: 'trial'
        },
        performed_by: 'test-api',
        notes: 'Test subscription created'
      });

    return NextResponse.json({
      success: true,
      subscription,
      company: company.company_name,
      contact: contact?.email || 'No contact',
      view_url: `/admin/subscriptions/${subscription.subscription_id}`
    });
  } catch (error) {
    console.error('[test-create] Error:', error);
    return NextResponse.json({
      error: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}
