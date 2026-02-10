/**
 * Offer Email Template
 * Sent when someone requests an offer via Smart Modal
 * Personalized per machine + problem
 */

interface Machine {
  slug: string;
  name: string;
  brand: string;
  model: string;
  type: string;
}

interface OfferEmailData {
  contact_name: string;
  contact_email: string;
  company_name?: string;
  machines: Machine[];
  problem_slug?: string;
  offer_url: string;
  unsubscribe_url: string;
}

/**
 * Generate personalized offer email HTML
 */
export function generateOfferEmail(data: OfferEmailData): { subject: string; html: string } {
  const {
    contact_name,
    machines,
    problem_slug,
    offer_url,
    company_name,
  } = data;

  const primaryMachine = machines[0];
  const machineName = primaryMachine.name;
  const multipleMachines = machines.length > 1;

  // Problem-specific messaging
  const problemMessaging: Record<string, { headline: string; benefit: string }> = {
    cracking: {
      headline: 'Eliminate Cracking & Scoring Issues',
      benefit: 'Reduce cracking by up to 90% with proven creasing technology',
    },
    misregistration: {
      headline: 'Fix Misregistration Problems',
      benefit: 'Achieve perfect registration every time with precision tools',
    },
    jamming: {
      headline: 'Stop Paper Jamming',
      benefit: 'Increase productivity with smooth, jam-free folding',
    },
    spine_cracking: {
      headline: 'Eliminate Spine Cracking',
      benefit: 'Produce perfect-bound books with crack-free spines',
    },
    wire_jam: {
      headline: 'End Wire Jamming Issues',
      benefit: 'Achieve consistent, jam-free stitching operation',
    },
    default: {
      headline: 'Optimize Your Machine Performance',
      benefit: 'Proven solutions for better quality and productivity',
    },
  };

  const messaging = problemMessaging[problem_slug || 'default'] || problemMessaging.default;

  // Generate subject line
  const subject = `Your Custom Offer: ${messaging.headline} on ${multipleMachines ? 'Your Machines' : machineName}`;

  // Machine list HTML
  const machineListHtml = machines
    .map(
      (m) => `
    <div style="padding: 12px; background-color: #f8fafc; border-left: 4px solid #1e40af; margin-bottom: 8px; border-radius: 4px;">
      <div style="font-weight: 600; color: #0a0a0a; font-size: 16px;">${m.name}</div>
      <div style="color: #64748b; font-size: 13px; margin-top: 4px;">${m.brand} • ${m.model}</div>
    </div>
  `
    )
    .join('');

  // Full HTML email
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f8fafc;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">

    <!-- Header with Logos -->
    <div style="background-color: #ffffff; padding: 32px 32px 24px; border-bottom: 1px solid #e8e8e8;">
      <div style="display: flex; align-items: center; justify-content: center; gap: 32px; margin-bottom: 24px;">
        <img src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png" alt="Technifold" style="height: 40px; width: auto;">
        <img src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technicrease.png" alt="TechniCrease" style="height: 40px; width: auto;">
        <img src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/creasestream.png" alt="CreaseStream" style="height: 40px; width: auto;">
      </div>
      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1e40af; text-align: center;">Your Custom Offer</h1>
      <p style="margin: 8px 0 0; font-size: 14px; color: #64748b; text-align: center;">Personalized solution for ${company_name || 'your print shop'}</p>
    </div>

    <!-- Main Content -->
    <div style="padding: 32px;">
      <p style="margin: 0 0 24px; font-size: 16px; color: #0a0a0a; line-height: 1.6;">
        Hi ${contact_name},
      </p>

      <p style="margin: 0 0 24px; font-size: 16px; color: #0a0a0a; line-height: 1.6;">
        Thank you for your interest! Here's your personalized offer to ${messaging.headline.toLowerCase()} on ${multipleMachines ? 'your machines' : 'your ' + machineName}.
      </p>

      <!-- Benefit Box -->
      <div style="background-color: #dbeafe; border-left: 4px solid #1e40af; padding: 20px; margin: 24px 0; border-radius: 4px;">
        <p style="margin: 0; font-size: 18px; color: #1e3a8a; font-weight: 600; line-height: 1.5;">
          ${messaging.benefit}
        </p>
      </div>

      <!-- Your Machines -->
      <h2 style="margin: 32px 0 16px; font-size: 18px; font-weight: 600; color: #0a0a0a;">Your Machine${multipleMachines ? 's' : ''}</h2>
      ${machineListHtml}

      <!-- What's Included -->
      <h2 style="margin: 32px 0 16px; font-size: 18px; font-weight: 600; color: #0a0a0a;">What's Included</h2>

      <table style="width: 100%; margin-bottom: 24px;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e8;">
            <div style="display: flex; align-items: start; gap: 12px;">
              <span style="color: #16a34a; font-size: 24px; line-height: 1;">✓</span>
              <div>
                <div style="font-weight: 600; color: #0a0a0a; font-size: 15px;">30-Day Free Trial</div>
                <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Test on your machine with no commitment</div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e8;">
            <div style="display: flex; align-items: start; gap: 12px;">
              <span style="color: #16a34a; font-size: 24px; line-height: 1;">✓</span>
              <div>
                <div style="font-weight: 600; color: #0a0a0a; font-size: 15px;">Money-Back Guarantee</div>
                <div style="color: #64748b; font-size: 13px; margin-top: 4px;">100% refund if it doesn't solve your problem</div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #e8e8e8;">
            <div style="display: flex; align-items: start; gap: 12px;">
              <span style="color: #16a34a; font-size: 24px; line-height: 1;">✓</span>
              <div>
                <div style="font-weight: 600; color: #0a0a0a; font-size: 15px;">Proven Results</div>
                <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Used by print shops worldwide with documented success</div>
              </div>
            </div>
          </td>
        </tr>
        <tr>
          <td style="padding: 12px 0;">
            <div style="display: flex; align-items: start; gap: 12px;">
              <span style="color: #16a34a; font-size: 24px; line-height: 1;">✓</span>
              <div>
                <div style="font-weight: 600; color: #0a0a0a; font-size: 15px;">Expert Support</div>
                <div style="color: #64748b; font-size: 13px; margin-top: 4px;">Direct access to our technical team</div>
              </div>
            </div>
          </td>
        </tr>
      </table>

      <!-- CTA Button -->
      <div style="text-align: center; margin: 40px 0;">
        <a href="${offer_url}" style="display: inline-block; background: linear-gradient(to right, #1e40af, #0d9488); color: #ffffff; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 700; font-size: 18px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          View Your Complete Offer →
        </a>
      </div>

      <p style="margin: 24px 0 0; font-size: 14px; color: #64748b; text-align: center; font-style: italic;">
        Your personalized offer includes pricing, case studies, and video demonstrations specific to your machine.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f8fafc; padding: 24px 32px; border-top: 1px solid #e8e8e8;">
      <p style="margin: 0 0 8px; font-size: 14px; color: #0a0a0a;">
        Questions? We're here to help:
      </p>
      <p style="margin: 0; font-size: 14px; color: #1e40af;">
        Email: <a href="mailto:info@technifold.co.uk" style="color: #1e40af; text-decoration: none;">info@technifold.co.uk</a><br>
        Phone: +44 (0)1455 554491
      </p>
      <p style="margin: 16px 0 0; font-size: 12px; color: #64748b;">
        © ${new Date().getFullYear()} Technifold International Ltd. All rights reserved.
      </p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}
