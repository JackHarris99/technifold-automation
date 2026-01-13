/**
 * GET /api/admin/subscriptions/[id]
 * Fetch a single subscription with company and contact data
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptionId = params.id;

    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'subscription_id is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Load subscription
    const { data: subscription, error: subError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('subscription_id', subscriptionId)
      .single();

    if (subError || !subscription) {
      console.error('[subscriptions/[id]] Error:', subError);
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      );
    }

    // Load company
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_name, billing_address')
      .eq('company_id', subscription.company_id)
      .single();

    if (companyError) {
      console.error('[subscriptions/[id]] Company error:', companyError);
    }

    // Load contact if exists
    let contact = null;
    if (subscription.contact_id) {
      const { data: contactData, error: contactError } = await supabase
        .from('contacts')
        .select('full_name, email')
        .eq('contact_id', subscription.contact_id)
        .single();

      if (contactError) {
        console.error('[subscriptions/[id]] Contact error:', contactError);
      } else {
        contact = contactData;
      }
    }

    return NextResponse.json({
      success: true,
      subscription,
      company: company || null,
      contact,
    });
  } catch (error) {
    console.error('[subscriptions/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
