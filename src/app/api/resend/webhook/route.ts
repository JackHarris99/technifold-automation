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
    tags?: { name: string; value: string }[];
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
    const recipientEmail = body.data.to[0];

    // Extract tracking metadata from Resend tags
    const tags = body.data.tags || [];
    const getTag = (name: string) => tags.find(t => t.name === name)?.value;

    const tagQuoteId = getTag('quote_id');
    const tagInvoiceId = getTag('invoice_id');
    const tagUserId = getTag('user_id');
    const tagCompanyId = getTag('company_id');
    const tagContactId = getTag('contact_id');
    const emailType = getTag('email_type');

    // Find recipient by email - check multiple tables
    // Priority: contacts (customers) > prospect_contacts (leads) > customer_users > distributor_users

    // Try contacts table (existing customers)
    let { data: contact } = await supabase
      .from('contacts')
      .select('contact_id, company_id, email, first_name, last_name')
      .eq('email', recipientEmail)
      .single();

    let company_id = contact?.company_id;
    let contact_id = contact?.contact_id;
    let prospect_contact_id = null;
    let prospect_company_id = null;

    // If not found, try prospect_contacts table (marketing leads)
    if (!contact) {
      const { data: prospectContact } = await supabase
        .from('prospect_contacts')
        .select('contact_id, prospect_company_id, email')
        .eq('email', recipientEmail)
        .single();

      if (prospectContact) {
        prospect_contact_id = prospectContact.contact_id;
        prospect_company_id = prospectContact.prospect_company_id;
        contact = {
          contact_id: null,
          company_id: null,
          email: prospectContact.email,
          first_name: null,
          last_name: null,
        };
      }
    }

    // If still not found, try customer_users table
    if (!contact && !prospect_contact_id) {
      const { data: customerUser } = await supabase
        .from('customer_users')
        .select('user_id, company_id, email, contact_id')
        .eq('email', recipientEmail)
        .single();

      if (customerUser) {
        company_id = customerUser.company_id;
        contact_id = customerUser.contact_id;
        contact = {
          contact_id: customerUser.contact_id,
          company_id: customerUser.company_id,
          email: customerUser.email,
          first_name: null,
          last_name: null,
        };
      }
    }

    // If STILL not found, try distributor_users table
    if (!contact && !prospect_contact_id) {
      const { data: distributorUser } = await supabase
        .from('distributor_users')
        .select('user_id, company_id, email')
        .eq('email', recipientEmail)
        .single();

      if (distributorUser) {
        company_id = distributorUser.company_id;
        contact = {
          contact_id: null,
          company_id: distributorUser.company_id,
          email: distributorUser.email,
          first_name: null,
          last_name: null,
        };
      }
    }

    if (!contact && !prospect_contact_id) {
      console.warn('[resend-webhook] Recipient not found for email:', recipientEmail);
      // Still return 200 to acknowledge receipt
      return NextResponse.json({ received: true });
    }

    // Map Resend event type to our engagement event type and name
    let eventType: string;
    let eventName: string;
    let meta: any = {
      resend_email_id: body.data.email_id,
      from: body.data.from,
      subject: body.data.subject,
      recipient_email: recipientEmail,
      email_type: emailType,
    };

    // Include tracking IDs from tags if available (for linking events to quotes, invoices, orders, etc.)
    if (tagQuoteId) meta.quote_id = tagQuoteId;
    if (tagInvoiceId) meta.invoice_id = tagInvoiceId;
    if (tagUserId) meta.user_id = tagUserId;
    if (tagCompanyId && !company_id) company_id = tagCompanyId; // Use tag if not found via email lookup
    if (tagContactId && !contact_id) contact_id = tagContactId;

    switch (body.type) {
      case 'email.delivered':
        eventType = 'email_delivered';
        eventName = 'Email delivered';
        break;

      case 'email.opened':
        eventType = 'email_open';
        eventName = 'Email opened';
        break;

      case 'email.clicked':
        eventType = 'email_click';
        eventName = 'Email link clicked';
        meta.link = body.data.click?.link;
        meta.clicked_at = body.data.click?.timestamp;
        meta.ip_address = body.data.click?.ipAddress;
        meta.user_agent = body.data.click?.userAgent;
        break;

      case 'email.bounced':
        eventType = 'email_bounced';
        eventName = 'Email bounced';
        meta.bounce_type = body.data.bounce?.type;
        meta.bounce_message = body.data.bounce?.message;

        // Update contact/prospect status to bounced
        if (contact_id) {
          await supabase
            .from('contacts')
            .update({
              email_status: 'bounced',
              updated_at: new Date().toISOString()
            })
            .eq('contact_id', contact_id);
        }
        if (prospect_contact_id) {
          await supabase
            .from('prospect_contacts')
            .update({
              email_status: 'bounced',
              updated_at: new Date().toISOString()
            })
            .eq('contact_id', prospect_contact_id);
        }
        break;

      case 'email.complained':
        eventType = 'email_complained';
        eventName = 'Email marked as spam';
        meta.complaint_type = body.data.complaint?.feedback_type;

        // Update contact/prospect consent - they complained, so unsubscribe them
        if (contact_id) {
          await supabase
            .from('contacts')
            .update({
              marketing_consent: false,
              email_status: 'complained',
              updated_at: new Date().toISOString()
            })
            .eq('contact_id', contact_id);
        }
        if (prospect_contact_id) {
          await supabase
            .from('prospect_contacts')
            .update({
              marketing_consent: false,
              email_status: 'complained',
              updated_at: new Date().toISOString()
            })
            .eq('contact_id', prospect_contact_id);
        }
        break;

      case 'email.delivery_delayed':
        eventType = 'email_delayed';
        eventName = 'Email delivery delayed';
        break;

      case 'email.sent':
        // We already track this when we send the email
        // But we can still log it for idempotency
        eventType = 'email_sent';
        eventName = 'Email sent';
        break;

      default:
        console.log('[resend-webhook] Unhandled event type:', body.type);
        return NextResponse.json({ received: true });
    }

    // Insert engagement event with idempotency (source + source_event_id unique)
    const { error } = await supabase
      .from('engagement_events')
      .insert({
        company_id: company_id || null,
        contact_id: contact_id || null,
        prospect_contact_id: prospect_contact_id || null,
        prospect_company_id: prospect_company_id || null,
        source: 'resend_webhook',
        source_event_id: `resend_${body.data.email_id}_${body.type}`,
        event_type: eventType,
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
    if ((body.type === 'email.clicked' || body.type === 'email.opened') && company_id) {
      console.log(`[resend-webhook] 🔥 High engagement: ${recipientEmail} ${body.type}`);

      // Look up the company's account owner (sales rep)
      const { data: company } = await supabase
        .from('companies')
        .select('company_name, account_owner')
        .eq('company_id', company_id)
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
                      <strong>${recipientEmail}</strong> from <strong>${company.company_name}</strong> just ${eventType}${linkInfo}.
                    </p>
                    <p style="margin: 0 0 16px 0; color: #666; font-size: 14px;">
                      Subject: ${body.data.subject}
                    </p>
                    <p style="margin: 0; font-size: 14px;">
                      This could be a good time to follow up!
                    </p>
                    <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid #e5e7eb;">
                      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin/company/${company_id}"
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
      event_type: eventType,
      event_name: eventName,
      recipient: recipientEmail,
    });

  } catch (error) {
    console.error('[resend-webhook] Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
