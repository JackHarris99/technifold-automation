/**
 * POST /api/admin/marketing/send-emails
 * Process campaign_sends queue and send emails via Resend
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user || user.role !== 'director') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { campaign_id, batch_size = 200 } = body;

    const supabase = getSupabaseClient();

    // Fetch campaign
    const { data: campaign, error: campaignError } = await supabase
      .from('marketing_campaigns')
      .select('*')
      .eq('campaign_id', campaign_id)
      .single();

    if (campaignError || !campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Fetch queued sends for this campaign (limited by batch_size)
    const { data: sends, error: sendsError } = await supabase
      .from('campaign_sends')
      .select(`
        send_id,
        token,
        email_address,
        prospect_contact_id,
        prospect_company_id,
        prospect_contacts (
          first_name,
          last_name,
          full_name,
          prospect_companies (
            company_name
          )
        )
      `)
      .eq('campaign_id', campaign_id)
      .eq('send_status', 'queued')
      .limit(batch_size);

    if (sendsError || !sends || sends.length === 0) {
      return NextResponse.json({
        success: true,
        sent: 0,
        message: 'No emails to send'
      });
    }

    let successCount = 0;
    let errorCount = 0;
    const errors: any[] = [];

    // Send emails
    for (const send of sends) {
      try {
        const contact = send.prospect_contacts;
        const company = contact?.prospect_companies;

        // Prepare personalization data
        const firstName = contact?.first_name || contact?.full_name?.split(' ')[0] || 'there';
        const lastName = contact?.last_name || contact?.full_name?.split(' ').slice(1).join(' ') || '';
        const fullName = contact?.full_name || `${firstName} ${lastName}`.trim() || 'there';
        const companyName = company?.company_name || 'your company';

        // Replace variables in subject and body
        let subject = campaign.email_subject;
        let body = campaign.email_body_html;

        const replacements: Record<string, string> = {
          '{{first_name}}': firstName,
          '{{last_name}}': lastName,
          '{{full_name}}': fullName,
          '{{company_name}}': companyName,
          '{{unsubscribe_link}}': `${process.env.NEXT_PUBLIC_BASE_URL || 'https://technifold.com'}/unsubscribe?token=${send.token}`,
        };

        for (const [key, value] of Object.entries(replacements)) {
          subject = subject.replace(new RegExp(key, 'g'), value);
          body = body.replace(new RegExp(key, 'g'), value);
        }

        // Add tracking pixel and enhance links with tokens
        const trackingPixel = `<img src="${process.env.NEXT_PUBLIC_BASE_URL || 'https://technifold.com'}/api/track/open?ct=${send.token}" width="1" height="1" style="display:none" />`;

        // Add tracking tokens to all links
        body = body.replace(
          /href="(https?:\/\/[^"]+)"/g,
          (match, url) => {
            const separator = url.includes('?') ? '&' : '?';
            return `href="${url}${separator}pt=${contact?.token || ''}&ct=${send.token}"`;
          }
        );

        // Add tracking pixel before closing body tag
        body = body.replace('</body>', `${trackingPixel}</body>`);

        // Send via Resend
        const { data: emailData, error: emailError } = await resend.emails.send({
          from: `Technifold <marketing@${campaign.sending_domain || 'technifold.com'}>`,
          to: send.email_address,
          subject,
          html: body,
        });

        if (emailError) {
          throw emailError;
        }

        // Update send record
        await supabase
          .from('campaign_sends')
          .update({
            send_status: 'sent',
            sent_at: new Date().toISOString(),
            resend_email_id: emailData?.id,
          })
          .eq('send_id', send.send_id);

        successCount++;

      } catch (error: any) {
        console.error(`[SendEmails] Failed to send to ${send.email_address}:`, error);

        // Update send record with error
        await supabase
          .from('campaign_sends')
          .update({
            send_status: 'failed',
            error_message: error.message || 'Unknown error',
          })
          .eq('send_id', send.send_id);

        errorCount++;
        errors.push({
          email: send.email_address,
          error: error.message
        });
      }
    }

    // Update campaign stats
    await supabase
      .from('marketing_campaigns')
      .update({
        total_sent: supabase.raw(`total_sent + ${successCount}`),
        updated_at: new Date().toISOString(),
      })
      .eq('campaign_id', campaign_id);

    // If no more queued sends, mark campaign as completed
    const { data: remainingSends } = await supabase
      .from('campaign_sends')
      .select('send_id', { count: 'exact', head: true })
      .eq('campaign_id', campaign_id)
      .eq('send_status', 'queued');

    if (!remainingSends || remainingSends.length === 0) {
      await supabase
        .from('marketing_campaigns')
        .update({
          status: 'completed',
          sent_at: new Date().toISOString(),
        })
        .eq('campaign_id', campaign_id);
    }

    return NextResponse.json({
      success: true,
      sent: successCount,
      failed: errorCount,
      errors: errors.length > 0 ? errors : undefined,
      remaining: remainingSends?.length || 0,
    });

  } catch (error: any) {
    console.error('[SendEmails] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
