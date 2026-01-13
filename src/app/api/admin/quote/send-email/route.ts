/**
 * POST /api/admin/quote/send-email
 * Send quote link via email to customer
 * Expects quote_id to fetch quote details, or quote_url if quote already generated
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { sendQuoteEmail, isResendConfigured } from '@/lib/resend-client';

export async function POST(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { company_id, contact_id, quote_id, quote_url } = body;

    if (!company_id || !contact_id) {
      return NextResponse.json({ error: 'company_id and contact_id are required' }, { status: 400 });
    }

    if (!quote_id && !quote_url) {
      return NextResponse.json({ error: 'Either quote_id or quote_url is required' }, { status: 400 });
    }

    // Territory restriction removed - all sales reps can help each other
    // No permission check needed

    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const supabase = getSupabaseClient();

    // Get company details
    const { data: company } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('company_id', company_id)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get contact details
    const { data: contact } = await supabase
      .from('contacts')
      .select('contact_id, email, full_name, first_name')
      .eq('contact_id', contact_id)
      .single();

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Get quote details if quote_id provided
    let quoteDetails = null;
    let finalQuoteUrl = quote_url;

    if (quote_id) {
      const { data: quote } = await supabase
        .from('quotes')
        .select('quote_id, quote_type, total_amount, currency, expires_at')
        .eq('quote_id', quote_id)
        .single();

      if (quote) {
        quoteDetails = quote;

        // Get quote items count
        const { count } = await supabase
          .from('quote_items')
          .select('*', { count: 'exact', head: true })
          .eq('quote_id', quote_id);

        quoteDetails.itemCount = count || 0;

        // If no quote_url provided, we need the token to construct it
        // This assumes the quote was already generated and has a token
        // If not, the quote_url must be provided
        if (!finalQuoteUrl) {
          return NextResponse.json({ error: 'quote_url required when using quote_id' }, { status: 400 });
        }
      }
    }

    // Send professional quote email
    const result = await sendQuoteEmail({
      to: contact.email,
      contactName: contact.full_name || contact.first_name || '',
      companyName: company.company_name,
      quoteUrl: finalQuoteUrl,
      quoteType: quoteDetails?.quote_type || 'interactive',
      expiryDate: quoteDetails?.expires_at ? new Date(quoteDetails.expires_at) : null,
      totalAmount: quoteDetails?.total_amount,
      currency: quoteDetails?.currency,
      itemCount: quoteDetails?.itemCount
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
    }

    // Update quote status to 'sent' if we have quote_id
    if (quote_id) {
      await supabase
        .from('quotes')
        .update({ status: 'sent', sent_at: new Date().toISOString() })
        .eq('quote_id', quote_id);
    }

    // Track the send
    await supabase.from('engagement_events').insert({
      company_id,
      contact_id,
      source: 'vercel',
      event_type: 'email_sent',
      event_name: 'quote_sent',
      campaign_key: 'quote_builder',
      url: finalQuoteUrl,
      meta: {
        message_id: result.messageId,
        sent_by: 'admin_quote_builder',
        quote_id: quote_id || null,
        quote_type: quoteDetails?.quote_type || null
      },
    });

    return NextResponse.json({
      success: true,
      message_id: result.messageId
    });
  } catch (err) {
    console.error('[quote/send-email] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
