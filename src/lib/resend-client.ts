/**
 * Resend Email Client
 * Sends transactional and marketing emails
 *
 * All templates use table-based layouts for maximum compatibility
 * with Outlook desktop, Gmail, Apple Mail, and mobile clients.
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
 * Common email wrapper - table-based layout for all clients
 */
function emailWrapper(content: string): string {
  return `<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <title>Technifold</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    * { box-sizing: border-box; }
    body, table, td, p, a, li { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    a[x-apple-data-detectors] { color: inherit !important; text-decoration: none !important; font-size: inherit !important; font-family: inherit !important; font-weight: inherit !important; line-height: inherit !important; }
    @media only screen and (max-width: 620px) {
      .mobile-full { width: 100% !important; }
      .mobile-padding { padding: 20px !important; }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f4f5; font-family: Arial, Helvetica, sans-serif;">
  <!-- Outer wrapper table -->
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f5;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <!-- Inner content table -->
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" class="mobile-full" style="max-width: 600px; width: 100%;">
          ${content}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Bulletproof button that works in all email clients including Outlook
 */
function emailButton(text: string, url: string, bgColor: string = '#3b82f6'): string {
  return `<table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: 0 auto;">
  <tr>
    <td style="border-radius: 6px; background-color: ${bgColor};">
      <a href="${url}" target="_blank" style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #ffffff; text-decoration: none; border-radius: 6px; background-color: ${bgColor}; font-family: Arial, sans-serif;">
        <!--[if mso]>
        <i style="letter-spacing: 28px; mso-font-width: -100%; mso-text-raise: 26pt;">&nbsp;</i>
        <![endif]-->
        <span style="mso-text-raise: 13pt;">${text}</span>
        <!--[if mso]>
        <i style="letter-spacing: 28px; mso-font-width: -100%;">&nbsp;</i>
        <![endif]-->
      </a>
    </td>
  </tr>
</table>`;
}

/**
 * Email header section with solid background color
 */
function emailHeader(title: string, subtitle: string | null, bgColor: string): string {
  return `<tr>
  <td style="background-color: ${bgColor}; padding: 30px 40px;" class="mobile-padding">
    <h1 style="margin: 0; font-size: 26px; line-height: 32px; font-weight: 700; color: #ffffff; font-family: Arial, sans-serif;">${title}</h1>
    ${subtitle ? `<p style="margin: 8px 0 0 0; font-size: 16px; line-height: 24px; color: rgba(255,255,255,0.85); font-family: Arial, sans-serif;">${subtitle}</p>` : ''}
  </td>
</tr>`;
}

/**
 * Email footer with company info
 */
function emailFooter(): string {
  return `<tr>
  <td style="padding: 30px 40px 0 40px;" class="mobile-padding">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 1px solid #e5e7eb;">
      <tr>
        <td style="padding-top: 24px;">
          <p style="margin: 0 0 12px 0; font-size: 14px; line-height: 20px; color: #666666; font-family: Arial, sans-serif;">
            Questions? Contact our team:<br>
            Email: <a href="mailto:info@technifold.co.uk" style="color: #2563eb; text-decoration: none;">info@technifold.co.uk</a><br>
            Phone: +44 (0)1455 554491
          </p>
          <p style="margin: 0; font-size: 12px; line-height: 18px; color: #999999; font-family: Arial, sans-serif;">
            Technifold Ltd<br>
            Unit 2D Tungsten Park<br>
            Lutterworth, Leicestershire, LE17 4JA, UK<br>
            <a href="https://technifold.co.uk" style="color: #2563eb; text-decoration: none;">technifold.co.uk</a>
          </p>
        </td>
      </tr>
    </table>
  </td>
</tr>
<tr>
  <td style="padding: 20px 40px 30px 40px;" class="mobile-padding">&nbsp;</td>
</tr>`;
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
  preview,
  unsubscribeUrl
}: {
  to: string;
  contactName: string;
  companyName: string;
  tokenUrl: string;
  subject: string;
  preview: string;
  unsubscribeUrl?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const html = emailWrapper(`
      ${emailHeader(`Solutions for ${companyName}`, null, '#2563eb')}
      <tr>
        <td style="background-color: #ffffff; padding: 30px 40px;" class="mobile-padding">
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Hi${contactName ? ` ${contactName}` : ''},
          </p>
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            ${preview}
          </p>
          <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            We've prepared personalized solutions based on your interests:
          </p>
          ${emailButton('View Your Solutions', tokenUrl, '#2563eb')}
          <p style="margin: 30px 0 0 0; font-size: 14px; line-height: 20px; color: #666666; font-family: Arial, sans-serif;">
            This link is personalized for you and expires in 30 days.
          </p>
        </td>
      </tr>
      ${emailFooter()}
      ${unsubscribeUrl ? `
      <tr>
        <td align="center" style="padding: 0 40px 20px 40px;">
          <p style="margin: 0; font-size: 11px; color: #999999; font-family: Arial, sans-serif;">
            <a href="${unsubscribeUrl}" style="color: #999999; text-decoration: underline;">Unsubscribe from marketing emails</a>
          </p>
        </td>
      </tr>
      ` : ''}
    `);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject,
      html
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

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation({
  to,
  contactName,
  companyName,
  orderId,
  orderItems,
  subtotal,
  taxAmount,
  totalAmount,
  currency,
  shippingAddress,
  isRental
}: {
  to: string;
  contactName: string;
  companyName: string;
  orderId: string;
  orderItems: Array<{ product_code: string; description: string; quantity: number; unit_price: number; total_price: number }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  shippingAddress: { address_line_1: string; address_line_2?: string; city: string; postal_code: string; country: string };
  isRental?: boolean;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const currencySymbol = currency === 'GBP' ? '£' : currency;

    const itemsHtml = orderItems.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Arial, sans-serif;">
          <strong style="color: #333333;">${item.product_code}</strong><br>
          <span style="font-size: 14px; color: #666666;">${item.description}</span>
        </td>
        <td align="center" style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Arial, sans-serif; color: #333333;">${item.quantity}</td>
        <td align="right" style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Arial, sans-serif; color: #333333;">${currencySymbol}${item.unit_price.toFixed(2)}</td>
        <td align="right" style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Arial, sans-serif; color: #333333; font-weight: 600;">${currencySymbol}${item.total_price.toFixed(2)}</td>
      </tr>
    `).join('');

    const html = emailWrapper(`
      ${emailHeader(isRental ? '✓ Rental Agreement Confirmed' : '✓ Order Confirmed', null, '#16a34a')}
      <tr>
        <td style="background-color: #ffffff; padding: 30px 40px;" class="mobile-padding">
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Hi${contactName ? ` ${contactName}` : ''},
          </p>
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Thank you for your ${isRental ? 'rental agreement' : 'order'}! We've received your payment and are processing your ${isRental ? 'equipment rental' : 'order'}.
          </p>

          ${isRental ? `
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 20px;">
            <tr>
              <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; font-family: Arial, sans-serif;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #92400e; font-size: 14px;">30-Day Free Trial</p>
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                  Your 30-day trial begins upon delivery. Monthly rental payments will start automatically after the trial period unless you return the equipment.
                </p>
              </td>
            </tr>
          </table>
          ` : ''}

          <!-- Order ID Box -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #f9fafb; padding: 16px; font-family: Arial, sans-serif;">
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #666666;">Order ID</p>
                <p style="margin: 0; font-family: monospace; font-size: 14px; color: #111111;">${orderId}</p>
              </td>
            </tr>
          </table>

          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333333; font-family: Arial, sans-serif;">Order Details</h2>

          <!-- Order Items Table -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr style="background-color: #f9fafb;">
              <th align="left" style="padding: 12px; font-size: 12px; color: #666666; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600;">Item</th>
              <th align="center" style="padding: 12px; font-size: 12px; color: #666666; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600;">Qty</th>
              <th align="right" style="padding: 12px; font-size: 12px; color: #666666; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600;">Price</th>
              <th align="right" style="padding: 12px; font-size: 12px; color: #666666; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600;">Total</th>
            </tr>
            ${itemsHtml}
          </table>

          <!-- Totals -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 2px solid #e5e7eb; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px 0; font-family: Arial, sans-serif;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="color: #666666; font-size: 14px;">Subtotal:</td>
                    <td align="right" style="font-weight: 600; color: #333333; font-size: 14px;">${currencySymbol}${subtotal.toFixed(2)}</td>
                  </tr>
                  ${taxAmount > 0 ? `
                  <tr>
                    <td style="color: #666666; font-size: 14px; padding-top: 8px;">VAT:</td>
                    <td align="right" style="font-weight: 600; color: #333333; font-size: 14px; padding-top: 8px;">${currencySymbol}${taxAmount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                </table>
              </td>
            </tr>
            <tr>
              <td style="border-top: 2px solid #e5e7eb; padding: 16px 0; font-family: Arial, sans-serif;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="font-size: 18px; font-weight: 700; color: #333333;">Total${isRental ? ' (First Payment)' : ''}:</td>
                    <td align="right" style="font-size: 18px; font-weight: 700; color: #16a34a;">${currencySymbol}${totalAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333333; font-family: Arial, sans-serif;">Shipping Address</h2>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #f9fafb; padding: 16px; font-family: Arial, sans-serif;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #333333;">${companyName}</p>
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 20px;">
                  ${shippingAddress.address_line_1}<br>
                  ${shippingAddress.address_line_2 ? `${shippingAddress.address_line_2}<br>` : ''}
                  ${shippingAddress.city}, ${shippingAddress.postal_code}<br>
                  ${shippingAddress.country}
                </p>
              </td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                ${emailButton('Track Your Order', `${process.env.NEXT_PUBLIC_BASE_URL}/track-order`, '#3b82f6')}
                <p style="margin: 8px 0 0 0; font-size: 12px; color: #666666; font-family: Arial, sans-serif;">Order ID: ${orderId}</p>
              </td>
            </tr>
          </table>

          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333333; font-family: Arial, sans-serif;">What's Next?</h2>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 0 0 8px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                1. We're preparing your ${isRental ? 'equipment' : 'order'} for shipment
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 8px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                2. You'll receive a shipping confirmation email with tracking details
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 8px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                3. Delivery typically takes 3-5 business days
              </td>
            </tr>
            ${isRental ? `
            <tr>
              <td style="padding: 0 0 8px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                4. Your 30-day trial begins upon delivery
              </td>
            </tr>
            ` : ''}
          </table>
        </td>
      </tr>
      ${emailFooter()}
    `);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `${isRental ? 'Rental Agreement' : 'Order'} Confirmation - Technifold`,
      html
    });

    if (error) {
      console.error('[Resend] Order confirmation error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[Resend] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send shipping notification email
 */
export async function sendShippingNotification({
  to,
  contactName,
  companyName,
  orderId,
  trackingNumber,
  carrier,
  trackingUrl,
  estimatedDelivery
}: {
  to: string;
  contactName: string;
  companyName: string;
  orderId: string;
  trackingNumber: string;
  carrier: 'Royal Mail' | 'DHL' | string;
  trackingUrl?: string;
  estimatedDelivery?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const html = emailWrapper(`
      ${emailHeader('Your Order Has Shipped!', null, '#7c3aed')}
      <tr>
        <td style="background-color: #ffffff; padding: 30px 40px;" class="mobile-padding">
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Hi${contactName ? ` ${contactName}` : ''},
          </p>
          <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Great news! Your order has been shipped and is on its way to ${companyName}.
          </p>

          <!-- Tracking Info Box -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1e40af;">Tracking Information</h2>

                <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Tracking Number</p>
                <p style="margin: 0 0 16px 0; font-family: monospace; font-size: 18px; font-weight: 700; color: #1e293b;">${trackingNumber}</p>

                <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Carrier</p>
                <p style="margin: 0 0 ${estimatedDelivery ? '16px' : '0'}; font-size: 16px; font-weight: 600; color: #1e293b;">${carrier}</p>

                ${estimatedDelivery ? `
                <p style="margin: 0 0 4px 0; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Delivery</p>
                <p style="margin: 0; font-size: 16px; font-weight: 600; color: #1e293b;">${estimatedDelivery}</p>
                ` : ''}

                ${trackingUrl ? `
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-top: 20px;">
                  <tr>
                    <td align="center">
                      ${emailButton('Track Your Package', trackingUrl, '#3b82f6')}
                    </td>
                  </tr>
                </table>
                ` : ''}
              </td>
            </tr>
          </table>

          <!-- Order ID Box -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #f9fafb; padding: 16px; font-family: Arial, sans-serif;">
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #666666;">Order ID</p>
                <p style="margin: 0; font-family: monospace; font-size: 14px; color: #111111;">${orderId}</p>
              </td>
            </tr>
          </table>

          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333333; font-family: Arial, sans-serif;">Delivery Tips</h2>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="padding: 0 0 8px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                • Someone should be available to sign for the delivery
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 8px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                • Keep your tracking number handy for any inquiries
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 8px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                • Inspect the package upon delivery for any damage
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 8px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                • Contact us immediately if there are any issues
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${emailFooter()}
    `);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Your order has shipped - Technifold`,
      html
    });

    if (error) {
      console.error('[Resend] Shipping notification error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[Resend] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send invoice email when Stripe invoice is created
 */
export async function sendInvoiceEmail({
  to,
  contactName,
  companyName,
  invoiceNumber,
  invoiceUrl,
  invoicePdfUrl,
  items,
  subtotal,
  taxAmount,
  totalAmount,
  currency,
  vatExemptReason,
  invoiceId,
  companyId,
  contactId
}: {
  to: string;
  contactName: string;
  companyName: string;
  invoiceNumber: string;
  invoiceUrl: string;
  invoicePdfUrl?: string | null;
  items: Array<{ product_code: string; description: string; quantity: number; unit_price: number }>;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  currency: string;
  vatExemptReason?: string | null;
  invoiceId?: string;
  companyId?: string;
  contactId?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const currencySymbol = currency.toUpperCase() === 'GBP' ? '£' : currency.toUpperCase();

    const itemsHtml = items.map(item => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Arial, sans-serif;">
          <strong style="color: #333333;">${item.product_code}</strong><br>
          <span style="font-size: 14px; color: #666666;">${item.description}</span>
        </td>
        <td align="center" style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Arial, sans-serif; color: #333333;">${item.quantity}</td>
        <td align="right" style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Arial, sans-serif; color: #333333;">${currencySymbol}${item.unit_price.toFixed(2)}</td>
        <td align="right" style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-family: Arial, sans-serif; color: #333333; font-weight: 600;">${currencySymbol}${(item.unit_price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = emailWrapper(`
      ${emailHeader('Invoice from Technifold', `Invoice #${invoiceNumber}`, '#2563eb')}
      <tr>
        <td style="background-color: #ffffff; padding: 30px 40px;" class="mobile-padding">
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Hi${contactName ? ` ${contactName}` : ''},
          </p>
          <p style="margin: 0 0 20px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Thank you for your order! An invoice for ${companyName} is ready for payment.
          </p>

          <!-- Invoice Number Box -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #f9fafb; padding: 16px; font-family: Arial, sans-serif;">
                <p style="margin: 0 0 4px 0; font-size: 14px; color: #666666;">Invoice Number</p>
                <p style="margin: 0; font-family: monospace; font-size: 16px; font-weight: 700; color: #111111;">${invoiceNumber}</p>
              </td>
            </tr>
          </table>

          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333333; font-family: Arial, sans-serif;">Invoice Details</h2>

          <!-- Invoice Items Table -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr style="background-color: #f9fafb;">
              <th align="left" style="padding: 12px; font-size: 12px; color: #666666; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600;">Item</th>
              <th align="center" style="padding: 12px; font-size: 12px; color: #666666; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600;">Qty</th>
              <th align="right" style="padding: 12px; font-size: 12px; color: #666666; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600;">Price</th>
              <th align="right" style="padding: 12px; font-size: 12px; color: #666666; text-transform: uppercase; font-family: Arial, sans-serif; font-weight: 600;">Total</th>
            </tr>
            ${itemsHtml}
          </table>

          <!-- Totals -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="border-top: 2px solid #e5e7eb; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px 0; font-family: Arial, sans-serif;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="color: #666666; font-size: 14px;">Subtotal:</td>
                    <td align="right" style="font-weight: 600; color: #333333; font-size: 14px;">${currencySymbol}${subtotal.toFixed(2)}</td>
                  </tr>
                  ${taxAmount > 0 ? `
                  <tr>
                    <td style="color: #666666; font-size: 14px; padding-top: 8px;">VAT (20%):</td>
                    <td align="right" style="font-weight: 600; color: #333333; font-size: 14px; padding-top: 8px;">${currencySymbol}${taxAmount.toFixed(2)}</td>
                  </tr>
                  ` : ''}
                  ${vatExemptReason ? `
                  <tr>
                    <td colspan="2" style="color: #666666; font-size: 12px; padding-top: 4px; font-style: italic;">
                      ${vatExemptReason}
                    </td>
                  </tr>
                  ` : ''}
                </table>
              </td>
            </tr>
            <tr>
              <td style="border-top: 2px solid #e5e7eb; padding: 16px 0; font-family: Arial, sans-serif;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="font-size: 18px; font-weight: 700; color: #333333;">Total Due:</td>
                    <td align="right" style="font-size: 18px; font-weight: 700; color: #2563eb;">${currencySymbol}${totalAmount.toFixed(2)}</td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <!-- Payment Info Box -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1e40af; font-family: Arial, sans-serif;">Payment Methods</h3>
                <p style="margin: 0; color: #1e40af; font-size: 14px; line-height: 20px;">
                  • Pay by card (Visa, Mastercard, Amex)<br>
                  • Bank transfer (BACS - 3-5 days)<br>
                  • Apple Pay / Google Pay
                </p>
              </td>
            </tr>
          </table>

          <!-- Payment Button -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                ${emailButton('View and Pay Invoice', invoiceUrl, '#16a34a')}
                <p style="margin: 12px 0 0 0; font-size: 12px; color: #666666; font-family: Arial, sans-serif;">
                  Payment due on receipt
                </p>
              </td>
            </tr>
          </table>

          ${invoicePdfUrl ? `
          <p style="margin: 0 0 16px 0; font-size: 14px; line-height: 20px; color: #666666; text-align: center; font-family: Arial, sans-serif;">
            <a href="${invoicePdfUrl}" style="color: #2563eb; text-decoration: none;">Download PDF Invoice</a>
          </p>
          ` : ''}

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; font-family: Arial, sans-serif;">
                <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 20px;">
                  <strong>B2B Friendly:</strong> You can forward this invoice to your accounts department. The payment link works for anyone in your organization.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${emailFooter()}
    `);

    // Build tracking tags
    const tags: { name: string; value: string }[] = [
      { name: 'email_type', value: 'invoice' },
    ];
    if (invoiceId) tags.push({ name: 'invoice_id', value: invoiceId });
    if (companyId) tags.push({ name: 'company_id', value: companyId });
    if (contactId) tags.push({ name: 'contact_id', value: contactId });

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Invoice ${invoiceNumber} from Technifold - ${currencySymbol}${totalAmount.toFixed(2)}`,
      html,
      tags
    });

    if (error) {
      console.error('[Resend] Invoice email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[Resend] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send quote email with link to view and accept quote
 */
export async function sendQuoteEmail({
  to,
  contactName,
  companyName,
  quoteUrl,
  quoteType,
  expiryDate,
  totalAmount,
  currency,
  itemCount,
  quoteId,
  companyId,
  contactId
}: {
  to: string;
  contactName: string;
  companyName: string;
  quoteUrl: string;
  quoteType: 'interactive' | 'static';
  expiryDate?: Date | null;
  totalAmount?: number;
  currency?: string;
  itemCount?: number;
  quoteId?: string;
  companyId?: string;
  contactId?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const currencySymbol = currency === 'GBP' ? '£' : currency || 'GBP';
    const expiryFormatted = expiryDate
      ? expiryDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : '30 days';

    const isInteractive = quoteType === 'interactive';
    const subtitle = isInteractive
      ? 'Adjust quantities and see live pricing updates'
      : 'Custom pricing prepared just for you';

    const descriptionText = isInteractive
      ? "We've prepared a personalized quote with flexible pricing. You can adjust quantities to see how volume pricing affects your total."
      : "We've prepared a custom quote with special pricing locked in just for you. Review the products and request an invoice when ready.";

    const html = emailWrapper(`
      ${emailHeader(`Your Quote from Technifold`, subtitle, '#2563eb')}
      <tr>
        <td style="background-color: #ffffff; padding: 30px 40px;" class="mobile-padding">
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Hi${contactName ? ` ${contactName}` : ''},
          </p>
          <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            ${descriptionText}
          </p>

          <!-- View Quote Button -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                ${emailButton('View Your Quote', quoteUrl, '#16a34a')}
              </td>
            </tr>
          </table>

          <!-- Quote Features -->
          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333333; font-family: Arial, sans-serif;">What's Included:</h2>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            ${isInteractive ? `
            <tr>
              <td style="padding: 0 0 12px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                ✓ Interactive quantity controls - adjust on the fly
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 12px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                ✓ Live pricing updates based on volume
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 12px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                ✓ Transparent tiered pricing discounts
              </td>
            </tr>
            ` : `
            <tr>
              <td style="padding: 0 0 12px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                ✓ Fixed pricing locked in just for you
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 12px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                ✓ Adjust quantities if needed
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 12px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                ✓ Special pricing negotiated for your order
              </td>
            </tr>
            `}
            <tr>
              <td style="padding: 0 0 12px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                ✓ Request an invoice instantly when ready
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 12px 20px; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">
                ✓ Secure payment via Stripe (card or bank transfer)
              </td>
            </tr>
          </table>

          ${expiryDate ? `
          <!-- Expiry Notice -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
            <tr>
              <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; font-family: Arial, sans-serif;">
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                  <strong>Valid until ${expiryFormatted}</strong> - This quote link will expire after this date.
                </p>
              </td>
            </tr>
          </table>
          ` : ''}

          <p style="margin: 24px 0 0 0; font-size: 14px; line-height: 20px; color: #666666; font-family: Arial, sans-serif; text-align: center;">
            This quote is personalized for ${companyName}. Have questions? Just reply to this email.
          </p>
        </td>
      </tr>
      ${emailFooter()}
    `);

    // Build tags for webhook tracking
    const tags: { name: string; value: string }[] = [
      { name: 'email_type', value: 'quote' },
    ];
    if (quoteId) tags.push({ name: 'quote_id', value: quoteId });
    if (companyId) tags.push({ name: 'company_id', value: companyId });
    if (contactId) tags.push({ name: 'contact_id', value: contactId });

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Your Custom Quote from Technifold`,
      html,
      tags
    });

    if (error) {
      console.error('[Resend] Quote email error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[Resend] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send trial confirmation email when subscription is created
 */
export async function sendTrialConfirmation({
  to,
  contactName,
  companyName,
  monthlyPrice,
  currency,
  trialEndDate,
  machineName,
}: {
  to: string;
  contactName: string;
  companyName: string;
  monthlyPrice: number;
  currency: string;
  trialEndDate: Date | null;
  machineName?: string;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL_TRIALS || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const currencySymbol = currency === 'GBP' ? '£' : currency;
    const trialEndFormatted = trialEndDate
      ? trialEndDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })
      : '30 days from delivery';

    const html = emailWrapper(`
      ${emailHeader('Your Trial Has Started!', '30 days to experience the difference', '#3b82f6')}
      <tr>
        <td style="background-color: #ffffff; padding: 30px 40px;" class="mobile-padding">
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Hi ${contactName || 'there'},
          </p>
          <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Great news! Your 30-day free trial${machineName ? ` for your <strong>${machineName}</strong>` : ''} is now active. You won't be charged during the trial period.
          </p>

          <!-- Trial Active Box -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #f0fdf4; border: 2px solid #22c55e; padding: 20px; font-family: Arial, sans-serif;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td width="40" valign="top">
                      <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                        <tr>
                          <td style="background-color: #22c55e; width: 32px; height: 32px; text-align: center; font-weight: bold; color: #ffffff; font-size: 18px; font-family: Arial, sans-serif;">✓</td>
                        </tr>
                      </table>
                    </td>
                    <td valign="top" style="padding-left: 12px;">
                      <p style="margin: 0 0 8px 0; font-size: 18px; font-weight: 700; color: #166534;">Trial Active</p>
                      <p style="margin: 0; color: #166534; font-size: 14px; line-height: 20px;">
                        <strong>Trial ends:</strong> ${trialEndFormatted}<br>
                        <strong>Then:</strong> ${currencySymbol}${monthlyPrice.toFixed(2)}/month
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333333; font-family: Arial, sans-serif;">What Happens Next?</h2>

          <!-- Steps -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px; border-left: 3px solid #3b82f6;">
            <tr>
              <td style="padding: 0 0 20px 20px;">
                <p style="margin: 0 0 4px 0; font-weight: 700; color: #1e40af; font-size: 14px; font-family: Arial, sans-serif;">1. We'll Ship Your Equipment</p>
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">Your tools will be dispatched within 1-2 business days. You'll receive tracking information by email.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 20px 20px;">
                <p style="margin: 0 0 4px 0; font-weight: 700; color: #1e40af; font-size: 14px; font-family: Arial, sans-serif;">2. Try It Risk-Free</p>
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">Use the equipment on your machine for 30 days. See the results for yourself.</p>
              </td>
            </tr>
            <tr>
              <td style="padding: 0 0 0 20px;">
                <p style="margin: 0 0 4px 0; font-weight: 700; color: #1e40af; font-size: 14px; font-family: Arial, sans-serif;">3. Keep It or Return It</p>
                <p style="margin: 0; color: #666666; font-size: 14px; line-height: 20px; font-family: Arial, sans-serif;">Love it? Do nothing - your subscription continues automatically. Not for you? Contact us to arrange a free return.</p>
              </td>
            </tr>
          </table>

          <!-- Warning Box -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; font-family: Arial, sans-serif;">
                <p style="margin: 0 0 4px 0; font-weight: 600; color: #92400e; font-size: 14px;">No Payment Until Trial Ends</p>
                <p style="margin: 0; color: #92400e; font-size: 14px; line-height: 20px;">
                  Your card will not be charged until ${trialEndFormatted}. Cancel anytime before then at no cost.
                </p>
              </td>
            </tr>
          </table>

          <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333333; font-family: Arial, sans-serif;">Your Subscription Details</h2>

          <!-- Details Table -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9fafb; margin-bottom: 24px;">
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px; font-family: Arial, sans-serif;">Company</td>
              <td align="right" style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #333333; font-size: 14px; font-family: Arial, sans-serif;">${companyName}</td>
            </tr>
            ${machineName ? `
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px; font-family: Arial, sans-serif;">Machine</td>
              <td align="right" style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #333333; font-size: 14px; font-family: Arial, sans-serif;">${machineName}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; color: #666666; font-size: 14px; font-family: Arial, sans-serif;">Monthly Price (after trial)</td>
              <td align="right" style="padding: 12px 16px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #333333; font-size: 14px; font-family: Arial, sans-serif;">${currencySymbol}${monthlyPrice.toFixed(2)}</td>
            </tr>
            <tr>
              <td style="padding: 12px 16px; color: #666666; font-size: 14px; font-family: Arial, sans-serif;">Trial Ends</td>
              <td align="right" style="padding: 12px 16px; font-weight: 600; color: #333333; font-size: 14px; font-family: Arial, sans-serif;">${trialEndFormatted}</td>
            </tr>
          </table>

          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td align="center">
                ${emailButton('Contact Support', `${process.env.NEXT_PUBLIC_BASE_URL}/contact`, '#3b82f6')}
              </td>
            </tr>
          </table>
        </td>
      </tr>
      ${emailFooter()}
    `);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Your 30-Day Free Trial Has Started - Technifold`,
      html
    });

    if (error) {
      console.error('[Resend] Trial confirmation error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[Resend] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send portal reminder email with product images
 * Beautiful HTML email showing previously ordered products
 */
export async function sendPortalReminderEmail({
  to,
  contactName,
  companyName,
  portalUrl,
  products
}: {
  to: string;
  contactName: string;
  companyName: string;
  portalUrl: string;
  products: Array<{ product_code: string; description: string; image_url?: string | null }>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // Build product grid (max 6 products)
    const displayProducts = products.slice(0, 6);

    let productsHtml = '';

    if (displayProducts.length > 0) {
      const productCards = displayProducts.map(product => {
        const imageUrl = product.image_url || 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/placeholder.jpg';

        return `
          <div style="width: 48%; display: inline-block; vertical-align: top; margin-bottom: 16px; padding: 12px; box-sizing: border-box;">
            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
              <div style="background-color: #f9fafb; padding: 16px; text-align: center; height: 160px; display: flex; align-items: center; justify-content: center;">
                <img src="${imageUrl}" alt="${product.description}" style="max-width: 140px; max-height: 140px; width: auto; height: auto; object-fit: contain; image-orientation: from-image;" />
              </div>
              <div style="padding: 16px;">
                <div style="font-family: 'Courier New', monospace; font-size: 14px; font-weight: 700; color: #2563eb; margin-bottom: 4px;">${product.product_code}</div>
                <div style="font-size: 13px; line-height: 1.4; color: #666666;">${product.description}</div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      productsHtml = `
        <h2 style="margin: 0 0 20px 0; font-size: 20px; color: #0a0a0a; font-weight: 700;">Your Products</h2>
        <div style="margin-bottom: 24px;">
          ${productCards}
        </div>
        ${products.length > 6 ? `<p style="text-align: center; color: #666666; font-size: 14px; margin-bottom: 24px;">+ ${products.length - 6} more products available in your portal</p>` : ''}
      `;
    }

    const html = emailWrapper(`
      ${emailHeader('Time to Restock?', 'Your personalized product catalog is ready', '#2563eb')}
      <tr>
        <td style="background-color: #ffffff; padding: 30px 40px;" class="mobile-padding">
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Hi${contactName ? ` ${contactName}` : ''},
          </p>
          <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            It's been a while since your last order with Technifold. We thought you might need to restock some of your usual products.
          </p>

          ${productsHtml}

          <!-- CTA Button -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                ${emailButton('View Your Catalog & Reorder', portalUrl, '#16a34a')}
              </td>
            </tr>
          </table>

          <!-- Benefits Box -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #eff6ff; border-left: 4px solid #3b82f6; padding: 20px; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1e40af; font-family: Arial, sans-serif;">Why Order from Your Portal?</h3>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 0 0 8px 0; color: #1e40af; font-size: 14px; line-height: 20px;">
                      ✓ See your complete order history
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 8px 0; color: #1e40af; font-size: 14px; line-height: 20px;">
                      ✓ Personalized pricing for your company
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 8px 0; color: #1e40af; font-size: 14px; line-height: 20px;">
                      ✓ Fast reordering with saved addresses
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0; color: #1e40af; font-size: 14px; line-height: 20px;">
                      ✓ Secure payment via card or bank transfer
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin: 0; font-size: 14px; line-height: 20px; color: #666666; text-align: center; font-family: Arial, sans-serif;">
            This portal is personalized for ${companyName}. Your link never expires.
          </p>
        </td>
      </tr>
      ${emailFooter()}
    `);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Time to restock? - Technifold`,
      html
    });

    if (error) {
      console.error('[Resend] Portal reminder error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[Resend] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Send team member invitation email
 * Invitation to join company portal with personalized access link
 */
export async function sendTeamMemberInvitation({
  to,
  contactName,
  companyName,
  portalUrl,
  invitedBy,
  products
}: {
  to: string;
  contactName: string;
  companyName: string;
  portalUrl: string;
  invitedBy: string;
  products: Array<{ product_code: string; description: string; image_url?: string | null }>;
}): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const resend = getResendClient();

  if (!resend) {
    return { success: false, error: 'Resend not configured' };
  }

  try {
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    // Show max 4 products for invitation email
    const displayProducts = products.slice(0, 4);

    let productsSection = '';

    if (displayProducts.length > 0) {
      const productCards = displayProducts.map(product => {
        const imageUrl = product.image_url || 'https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/products/placeholder.jpg';

        return `
          <div style="width: 48%; display: inline-block; vertical-align: top; margin-bottom: 12px; padding: 8px; box-sizing: border-box;">
            <div style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; overflow: hidden;">
              <div style="background-color: #f9fafb; padding: 12px; text-align: center; height: 120px; display: flex; align-items: center; justify-content: center;">
                <img src="${imageUrl}" alt="${product.description}" style="max-width: 100px; max-height: 100px; width: auto; height: auto; object-fit: contain; image-orientation: from-image;" />
              </div>
              <div style="padding: 12px; text-align: center;">
                <div style="font-family: 'Courier New', monospace; font-size: 12px; font-weight: 700; color: #2563eb;">${product.product_code}</div>
              </div>
            </div>
          </div>
        `;
      }).join('');

      productsSection = `
        <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #333333; text-align: center; font-family: Arial, sans-serif;">Products Available</h2>
        <div style="margin-bottom: 24px;">
          ${productCards}
        </div>
      `;
    }

    const html = emailWrapper(`
      ${emailHeader('You\'ve Been Invited', `Join ${companyName}'s portal`, '#7c3aed')}
      <tr>
        <td style="background-color: #ffffff; padding: 30px 40px;" class="mobile-padding">
          <p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            Hi${contactName ? ` ${contactName}` : ''},
          </p>
          <p style="margin: 0 0 24px 0; font-size: 16px; line-height: 24px; color: #333333; font-family: Arial, sans-serif;">
            ${invitedBy} has invited you to access ${companyName}'s Technifold portal. You can now view your company's product catalog and place orders on their behalf.
          </p>

          <!-- CTA Button -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td align="center">
                ${emailButton('Access Your Portal', portalUrl, '#16a34a')}
              </td>
            </tr>
          </table>

          ${productsSection}

          <!-- Info Box -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="background-color: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; font-family: Arial, sans-serif;">
                <h3 style="margin: 0 0 12px 0; font-size: 16px; color: #1e40af; font-family: Arial, sans-serif;">Your Portal Access</h3>
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="padding: 0 0 8px 0; color: #1e40af; font-size: 14px; line-height: 20px;">
                      ✓ Your access link never expires
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 8px 0; color: #1e40af; font-size: 14px; line-height: 20px;">
                      ✓ View complete order history for ${companyName}
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0 0 8px 0; color: #1e40af; font-size: 14px; line-height: 20px;">
                      ✓ Place orders that require approval
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 0; color: #1e40af; font-size: 14px; line-height: 20px;">
                      ✓ Optionally set a password for direct login
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>

          <p style="margin: 0; font-size: 14px; line-height: 20px; color: #666666; text-align: center; font-family: Arial, sans-serif;">
            Save this email - your portal link works anytime, no password needed.
          </p>
        </td>
      </tr>
      ${emailFooter()}
    `);

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `You've been invited to ${companyName}'s portal - Technifold`,
      html
    });

    if (error) {
      console.error('[Resend] Team invitation error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[Resend] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}
