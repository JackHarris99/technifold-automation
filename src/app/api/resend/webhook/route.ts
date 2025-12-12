/**
 * Resend Webhook Handler
 * Handles email events: delivered, opened, clicked, bounced, complained
 *
 * Documentation: https://resend.com/docs/dashboard/webhooks/event-types
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { Resend } from 'resend';

// Initialize Resend client for sending notifications
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Resend webhook events we care about
type ResendEventType =
  | 'email.sent'
  | 'email.delivered'
  | 'email.delivery_delayed'
  | 'email.bounced'
  | 'email.complained'
  | 'email.opened'
  | 'email.clicked';

interface ResendWebhookPayload {
  type: ResendEventType;
  created_at: string;
  data: {
    email_id: string;
    from: string;
    to: string[];
    subject: string;
    created_at: string;
    html?: string;
    text?: string;
    // For clicks
    click?: {
      link: string;
      timestamp: string;
      ipAddress?: string;
      userAgent?: string;
    };
    // For bounces
    bounce?: {
      type: 'hard' | 'soft';
      message: string;
    };
    // For complaints
    complaint?: {
      feedback_type: string;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as ResendWebhookPayload;

    console.log('[resend-webhook] Received event:', body.type, 'for email:', body.data.email_id);

    const supabase = getSupabaseClient();

    // Extract contact email (Resend sends array, we use first)
    const contactEmail = body.data.to[0];

    // Find contact by email to get company_id and contact_id
    const { data: contact } = await supabase
      .from('contacts')
      .select('contact_id, company_id, email')
      .eq('email', contactEmail)
      .single();

    if (!contact) {
      console.warn('[resend-webhook] Contact not found for email:', contactEmail);
      // Still return 200 to acknowledge receipt
      return NextResponse.json({ received: true });
    }

    // Map Resend event type to our engagement event name
    let eventName: string;
    let meta: any = {
      resend_email_id: body.data.email_id,
      from: body.data.from,
      subject: body.data.subject,
    };

    switch (body.type) {
      case 'email.delivered':
        eventName = 'email_delivered';
        break;

      case 'email.opened':
        eventName = 'email_opened';
        break;

      case 'email.clicked':
        eventName = 'email_clicked';
        meta.link = body.data.click?.link;
        meta.clicked_at = body.data.click?.timestamp;
        meta.ip_address = body.data.click?.ipAddress;
        meta.user_agent = body.data.click?.userAgent;
        break;

      case 'email.bounced':
        eventName = 'email_bounced';
        meta.bounce_type = body.data.bounce?.type;
        meta.bounce_message = body.data.bounce?.message;

        // Update contact status to bounced
        await supabase
          .from('contacts')
          .update({
            email_status: 'bounced',
            updated_at: new Date().toISOString()
          })
          .eq('contact_id', contact.contact_id);
        break;

      case 'email.complained':
        eventName = 'email_complained';
        meta.complaint_type = body.data.complaint?.feedback_type;

        // Update contact consent - they complained, so unsubscribe them
        await supabase
          .from('contacts')
          .update({
            marketing_consent: false,
            email_status: 'complained',
            updated_at: new Date().toISOString()
          })
          .eq('contact_id', contact.contact_id);
        break;

      case 'email.delivery_delayed':
        eventName = 'email_delayed';
        break;

      case 'email.sent':
        // We already track this when we send the email
        // But we can still log it for idempotency
        eventName = 'email_sent';
        break;

      default:
        console.log('[resend-webhook] Unhandled event type:', body.type);
        return NextResponse.json({ received: true });
    }

    // Insert engagement event with idempotency (source + source_event_id unique)
    const { error } = await supabase
      .from('engagement_events')
      .insert({
        company_id: contact.company_id,
        contact_id: contact.contact_id,
        source: 'vercel',
        source_event_id: `resend_${body.data.email_id}_${body.type}`,
        event_name: eventName,
        occurred_at: body.created_at,
        url: body.data.click?.link || null,
        meta,
      });

    if (error) {
      // If it's a duplicate (idempotency constraint), that's fine
      if (error.code === '23505') {
        console.log('[resend-webhook] Duplicate event ignored (idempotency)');
      } else {
        console.error('[resend-webhook] Error inserting event:', error);
      }
    }

    // For high-value events (clicked, opened), notify the sales rep
    if (body.type === 'email.clicked' || body.type === 'email.opened') {
      console.log(`[resend-webhook] 🔥 High engagement: ${contact.email} ${body.type}`);

      // Look up the company's account owner (sales rep)
      const { data: company } = await supabase
        .from('companies')
        .select('company_name, account_owner')
        .eq('company_id', contact.company_id)
        .single();

      if (company?.account_owner) {
        // Look up the sales rep's email
        const { data: salesRep } = await supabase
          .from('users')
          .select('email, full_name')
          .eq('sales_rep_id', company.account_owner)
          .single();

        if (salesRep?.email && resend) {
          const eventType = body.type === 'email.clicked' ? 'clicked a link' : 'opened your email';
          const linkInfo = body.data.click?.link ? ` (${body.data.click.link})` : '';

          try {
            await resend.emails.send({
              from: process.env.RESEND_FROM_EMAIL || 'notifications@technifold.com',
              to: salesRep.email,
              subject: `🔥 ${contact.email} ${eventType}`,
              html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                  <div style="background: #f59e0b; color: white; padding: 16px; text-align: center;">
                    <h2 style="margin: 0; font-size: 18px;">Customer Engagement Alert</h2>
                  </div>
                  <div style="padding: 20px; background: #fff; border: 1px solid #e5e7eb;">
                    <p style="margin: 0 0 16px 0; font-size: 16px;">
                      <strong>${contact.email}</strong> from <strong>${company.company_name}</strong> just ${eventType}${linkInfo}.
                    </p>
                    <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
                      Subject: ${body.data.subject}
                    </p>
                    <p style="margin: 0; font-size: 14px;">
                      This could be a good time to follow up!
                    </p>
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/company/${contact.company_id}"
                         style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; display: inline-block; border-radius: 4px; font-size: 14px;">
                        View Company
                      </a>
                    </div>
                  </div>
                </div>
              `,
            });
            console.log(`[resend-webhook] Sales rep notification sent to ${salesRep.email}`);
          } catch (notifyErr) {
            console.error('[resend-webhook] Failed to send sales rep notification:', notifyErr);
          }
        }
      }
    }

    return NextResponse.json({
      received: true,
      event: eventName,
      contact: contact.email,
    });

  } catch (error) {
    console.error('[resend-webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
