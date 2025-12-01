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
    // Use test mode if domain not verified
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: fromEmail,
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
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <div style="font-weight: 600;">${item.product_code}</div>
          <div style="font-size: 14px; color: #666;">${item.description}</div>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">${currencySymbol}${item.unit_price.toFixed(2)}</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; font-weight: 600;">${currencySymbol}${item.total_price.toFixed(2)}</td>
      </tr>
    `).join('');

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `${isRental ? 'Rental Agreement' : 'Order'} Confirmation - Technifold`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">${isRental ? '✓ Rental Agreement Confirmed' : '✓ Order Confirmed'}</h1>
            </div>

            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; margin-top: 0;">Hi${contactName ? ` ${contactName}` : ''},</p>

              <p style="font-size: 16px;">Thank you for your ${isRental ? 'rental agreement' : 'order'}! We've received your payment and are processing your ${isRental ? 'equipment rental' : 'order'}.</p>

              ${isRental ? `
                <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0; border-radius: 4px;">
                  <p style="margin: 0; font-weight: 600; color: #92400e;">30-Day Free Trial</p>
                  <p style="margin: 8px 0 0 0; color: #92400e; font-size: 14px;">
                    Your 30-day trial begins upon delivery. Monthly rental payments will start automatically after the trial period unless you return the equipment.
                  </p>
                </div>
              ` : ''}

              <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">Order ID</p>
                <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 12px; color: #111;">${orderId}</p>
              </div>

              <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 16px;">Order Details</h2>

              <table style="width: 100%; border-collapse: collapse;">
                <thead>
                  <tr style="background: #f9fafb;">
                    <th style="padding: 12px; text-align: left; font-size: 12px; color: #666; text-transform: uppercase;">Item</th>
                    <th style="padding: 12px; text-align: center; font-size: 12px; color: #666; text-transform: uppercase;">Qty</th>
                    <th style="padding: 12px; text-align: right; font-size: 12px; color: #666; text-transform: uppercase;">Price</th>
                    <th style="padding: 12px; text-align: right; font-size: 12px; color: #666; text-transform: uppercase;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>

              <div style="margin-top: 24px; padding-top: 16px; border-top: 2px solid #e5e7eb;">
                <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                  <span style="color: #666;">Subtotal:</span>
                  <span style="font-weight: 600;">${currencySymbol}${subtotal.toFixed(2)}</span>
                </div>
                ${taxAmount > 0 ? `
                  <div style="display: flex; justify-content: space-between; padding: 8px 0;">
                    <span style="color: #666;">VAT:</span>
                    <span style="font-weight: 600;">${currencySymbol}${taxAmount.toFixed(2)}</span>
                  </div>
                ` : ''}
                <div style="display: flex; justify-content: space-between; padding: 16px 0; border-top: 2px solid #e5e7eb; margin-top: 8px;">
                  <span style="font-size: 18px; font-weight: 700;">Total${isRental ? ' (First Payment)' : ''}:</span>
                  <span style="font-size: 18px; font-weight: 700; color: #16a34a;">${currencySymbol}${totalAmount.toFixed(2)}</span>
                </div>
              </div>

              <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 16px;">Shipping Address</h2>

              <div style="background: #f9fafb; padding: 16px; border-radius: 8px;">
                <p style="margin: 0; font-weight: 600;">${companyName}</p>
                <p style="margin: 4px 0 0 0; color: #666;">${shippingAddress.address_line_1}</p>
                ${shippingAddress.address_line_2 ? `<p style="margin: 4px 0 0 0; color: #666;">${shippingAddress.address_line_2}</p>` : ''}
                <p style="margin: 4px 0 0 0; color: #666;">${shippingAddress.city}, ${shippingAddress.postal_code}</p>
                <p style="margin: 4px 0 0 0; color: #666;">${shippingAddress.country}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_BASE_URL}/track-order" style="background: #3b82f6; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; display: inline-block;">
                  Track Your Order
                </a>
                <p style="font-size: 12px; color: #666; margin-top: 8px;">Order ID: ${orderId}</p>
              </div>

              <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 16px;">What's Next?</h2>

              <ol style="padding-left: 20px; color: #666;">
                <li style="margin-bottom: 8px;">We're preparing your ${isRental ? 'equipment' : 'order'} for shipment</li>
                <li style="margin-bottom: 8px;">You'll receive a shipping confirmation email with tracking details</li>
                <li style="margin-bottom: 8px;">Delivery typically takes 3-5 business days</li>
                ${isRental ? '<li style="margin-bottom: 8px;">Your 30-day trial begins upon delivery</li>' : ''}
              </ol>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="font-size: 14px; color: #666;">
                Questions? Contact our support team:<br>
                Email: <a href="mailto:support@technifold.com" style="color: #2563eb;">support@technifold.com</a><br>
                Phone: +44 (0) 1707 393700
              </p>

              <p style="font-size: 12px; color: #999; margin-top: 24px;">
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

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [to],
      subject: `Your order has shipped - Technifold`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); padding: 30px; border-radius: 12px 12px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 28px;">📦 Your Order Has Shipped!</h1>
            </div>

            <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <p style="font-size: 16px; margin-top: 0;">Hi${contactName ? ` ${contactName}` : ''},</p>

              <p style="font-size: 16px;">Great news! Your order has been shipped and is on its way to ${companyName}.</p>

              <div style="background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; border-radius: 4px;">
                <h2 style="margin: 0 0 16px 0; font-size: 18px; color: #1e40af;">Tracking Information</h2>

                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Tracking Number</div>
                  <div style="font-family: monospace; font-size: 18px; font-weight: 700; color: #1e293b; margin-top: 4px;">${trackingNumber}</div>
                </div>

                <div style="margin-bottom: 12px;">
                  <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Carrier</div>
                  <div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-top: 4px;">${carrier}</div>
                </div>

                ${estimatedDelivery ? `
                  <div style="margin-bottom: 12px;">
                    <div style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px;">Estimated Delivery</div>
                    <div style="font-size: 16px; font-weight: 600; color: #1e293b; margin-top: 4px;">${estimatedDelivery}</div>
                  </div>
                ` : ''}

                ${trackingUrl ? `
                  <div style="text-align: center; margin-top: 20px;">
                    <a href="${trackingUrl}" style="background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px; display: inline-block;">
                      Track Your Package
                    </a>
                  </div>
                ` : ''}
              </div>

              <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0; font-size: 14px; color: #666;">Order ID</p>
                <p style="margin: 4px 0 0 0; font-family: monospace; font-size: 12px; color: #111;">${orderId}</p>
              </div>

              <h2 style="font-size: 18px; margin-top: 30px; margin-bottom: 16px;">Delivery Tips</h2>

              <ul style="padding-left: 20px; color: #666;">
                <li style="margin-bottom: 8px;">Someone should be available to sign for the delivery</li>
                <li style="margin-bottom: 8px;">Keep your tracking number handy for any inquiries</li>
                <li style="margin-bottom: 8px;">Inspect the package upon delivery for any damage</li>
                <li style="margin-bottom: 8px;">Contact us immediately if there are any issues</li>
              </ul>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="font-size: 14px; color: #666;">
                Questions about your delivery?<br>
                Email: <a href="mailto:support@technifold.com" style="color: #2563eb;">support@technifold.com</a><br>
                Phone: +44 (0) 1707 393700
              </p>

              <p style="font-size: 12px; color: #999; margin-top: 24px;">
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
      console.error('[Resend] Shipping notification error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data?.id };
  } catch (err: any) {
    console.error('[Resend] Unexpected error:', err);
    return { success: false, error: err.message };
  }
}
