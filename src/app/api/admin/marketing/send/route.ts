/**
 * POST /api/admin/marketing/send
 * Send marketing emails with tokenized links
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { generateToken } from '@/lib/tokens';
import { sendMarketingEmail, isResendConfigured } from '@/lib/resend-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      company_id,
      contact_ids,
      machine_slug,
      selected_problem_ids,
      curated_skus,
      campaign_key,
      offer_key
    } = body;

    if (!company_id || !contact_ids || !machine_slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!isResendConfigured()) {
      return NextResponse.json(
        { error: 'Email service not configured. Add RESEND_API_KEY to environment variables.' },
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

    // Get machine details
    const { data: machine } = await supabase
      .from('machines')
      .select('brand, model, display_name')
      .eq('slug', machine_slug)
      .single();

    if (!machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    // Get contacts
    const { data: contacts } = await supabase
      .from('contacts')
      .select('contact_id, email, full_name, first_name, last_name')
      .in('contact_id', contact_ids);

    if (!contacts || contacts.length === 0) {
      return NextResponse.json({ error: 'No valid contacts found' }, { status: 404 });
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
    const results = [];

    // Send email to each contact
    for (const contact of contacts) {
      // Generate tokenized link
      const token = generateToken({
        company_id,
        contact_id: contact.contact_id,
      });

      const tokenUrl = `${baseUrl}/m/${token}`;

      // Send email
      const result = await sendMarketingEmail({
        to: contact.email,
        contactName: contact.full_name || contact.first_name || '',
        companyName: company.company_name,
        tokenUrl,
        subject: `Solutions for your ${machine.brand} ${machine.model}`,
        preview: `We've identified solutions that can help improve quality and reduce waste on your ${machine.brand} ${machine.model}.`,
      });

      results.push({
        contact_id: contact.contact_id,
        email: contact.email,
        success: result.success,
        message_id: result.messageId,
        error: result.error,
      });

      // Track marketing send
      if (result.success) {
        await supabase.from('marketing_sends').insert({
          company_id,
          contact_id: contact.contact_id,
          machine_slug,
          problem_solution_ids: selected_problem_ids,
          curated_skus,
          campaign_key,
          offer_key,
          status: 'sent',
          sent_at: new Date().toISOString(),
          metadata: {
            token,
            message_id: result.messageId,
          },
        });

        // Track engagement event
        await supabase.from('engagement_events').insert({
          company_id,
          contact_id: contact.contact_id,
          source: 'vercel',
          event_type: 'email_sent',
          event_name: 'marketing_email_sent',
          campaign_key,
          offer_key,
          url: tokenUrl,
          meta: {
            machine_slug,
            problem_count: selected_problem_ids?.length || 0,
            message_id: result.messageId,
          },
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent ${successCount} email(s), ${failureCount} failed`,
      total: results.length,
      successful: successCount,
      failed: failureCount,
      results,
    });
  } catch (err) {
    console.error('[admin/marketing/send] Unexpected error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
