/**
 * Email Sending Functions using React Email
 * Modern, component-based email system
 */

import { getResendClient } from './resend-client';
import { renderEmail } from '@/emails/utils/render';
import ConsumableReminderEmail, { ConsumableReminderEmailProps } from '@/emails/templates/ConsumableReminderEmail';

/**
 * Send consumable reorder reminder email
 */
export async function sendConsumableReminder(
  to: string,
  props: Omit<ConsumableReminderEmailProps, 'unsubscribeUrl'> & { unsubscribeUrl?: string },
  tracking?: { companyId?: string; contactId?: string; userId?: string }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'sales@technifold.com';

    // Render email to HTML and plain text
    const { html, text } = await renderEmail(
      ConsumableReminderEmail(props)
    );

    // Build tracking tags
    const tags: { name: string; value: string }[] = [
      { name: 'email_type', value: 'reorder_reminder' },
    ];
    if (tracking?.companyId) tags.push({ name: 'company_id', value: tracking.companyId });
    if (tracking?.contactId) tags.push({ name: 'contact_id', value: tracking.contactId });
    if (tracking?.userId) tags.push({ name: 'user_id', value: tracking.userId });

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: 'Time to restock your consumables - Technifold',
      html,
      text,
      tags
    });

    if (error) {
      console.error('[Email] Consumable reminder error:', error);
      return { success: false, error: error.message };
    }

    console.log('[Email] Consumable reminder sent:', {
      to,
      messageId: data?.id,
      productCount: props.products.length,
    });

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[Email] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}
