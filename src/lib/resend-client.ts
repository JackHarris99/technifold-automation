/**
 * Resend Email Client
 * Sends transactional and marketing emails
 */

import { Resend } from 'resend';

let resendClient: Resend | null = null;

export function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) {
    console.warn('[Resend] RESEND_API_KEY not configured');
    return null;
  }

  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY);
  }

  return resendClient;
}

export function isResendConfigured(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/**
 * Send marketing email with tokenized link
 */
export async function sendMarketingEmail({
  to,
  contactName,
  companyName,
  tokenUrl,
  subject,
  preview
}: {
  to: string;
  contactName: string;
  companyName: string;
  tokenUrl: string;
  subject: string;
  preview: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: 'Technifold Solutions <solutions@technifold.com>',
      to: [to],
      subject,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Solutions for ${companyName}</h1>
            </div>

            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; margin-top: 0;">Hi${contactName ? ` ${contactName}` : ''},</p>

              <p style="font-size: 16px;">${preview}</p>

              <p style="font-size: 16px;">We've prepared personalized solutions based on your interests:</p>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${tokenUrl}" style="background: #2563eb; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
                  View Your Solutions
                </a>
              </div>

              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                This link is personalized for you and expires in 30 days.
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="font-size: 12px; color: #999;">
                Technifold Ltd<br>
                Unit 2, St John's Business Park<br>
                Lutterworth, Leicestershire, LE17 4HB, UK<br>
                <a href="https://technifold.com" style="color: #2563eb;">technifold.com</a>
              </p>
            </div>
          </body>
        </html>
      `
    });

    if (error) {
      console.error('[Resend] Send error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[Resend] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}
