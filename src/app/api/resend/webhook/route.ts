/**
 * Resend Webhook Handler
 * Handles email events: delivered, opened, clicked, bounced, complained
 *
 * Documentation: https://resend.com/docs/dashboard/webhooks/event-types
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';

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

    // For high-value events (clicked), check if we should notify the sales rep
    if (body.type === 'email.clicked' || body.type === 'email.opened') {
      // TODO: Trigger sales rep notification
      // For now, just log it
      console.log(`[resend-webhook] 🔥 High engagement: ${contact.email} ${body.type}`);
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
