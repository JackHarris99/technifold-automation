/**
 * POST /api/admin/quote/send-email
 * Send quote link via email to customer
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { sendMarketingEmail, isResendConfigured } from '@/lib/resend-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, contact_id, quote_url } = body;

    if (!company_id || !contact_id || !quote_url) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check territory permission
    const { canActOnCompany } = await import('@/lib/auth');
    const permission = await canActOnCompany(company_id);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: 403 }
      );
    }

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

    // Send email with quote link
    const result = await sendMarketingEmail({
      to: contact.email,
      contactName: contact.full_name || contact.first_name || '',
      companyName: company.company_name,
      tokenUrl: quote_url,
      subject: `Your personalized quote from Technifold`,
      preview: `We've prepared a custom quote just for ${company.company_name}. View pricing and complete your order online.`,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to send email' }, { status: 500 });
    }

    // Track the send
    await supabase.from('engagement_events').insert({
      company_id,
      contact_id,
      source: 'vercel',
      event_type: 'email_sent',
      event_name: 'manual_quote_sent',
      campaign_key: 'manual_quote',
      url: quote_url,
      meta: {
        message_id: result.messageId,
        sent_by: 'admin_quote_generator'
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
