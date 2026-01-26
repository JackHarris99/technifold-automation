/**
 * POST /api/trial/create-intent
 *
 * Creates a trial intent:
 * 1. Find or create company
 * 2. Find or create contact
 * 3. Insert trial_intent with secure token
 * 4. Send email with offer link
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase-server';
import { getResendClient } from '@/lib/resend-client';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      company: companyName,
      phone,
      machine_id,
      machine_brand,
      machine_model,
      machine_type,
    } = body;

    // Validate required fields
    if (!name || !email || !machine_id) {
      return NextResponse.json(
        { error: 'Name, email, and machine are required' },
        { status: 400 }
      );
    }

    const supabase = createServerClient();

    // 1. Find or create company
    let company_id: string;

    // Try to find company by name first (if provided)
    if (companyName?.trim()) {
      const { data: existingCompany } = await supabase
        .from('companies')
        .select('company_id')
        .ilike('company_name', companyName.trim())
        .single();

      if (existingCompany) {
        company_id = existingCompany.company_id;
      } else {
        // Create new company
        const newCompanyId = crypto.randomUUID();

        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            company_id: newCompanyId,
            company_name: companyName.trim(),
            source: 'website_trial',
            category: 'prospect',
          })
          .select('company_id')
          .single();

        if (companyError || !newCompany) {
          console.error('Company creation error:', companyError);
          return NextResponse.json({ error: 'Failed to create company record' }, { status: 500 });
        }
        company_id = newCompany.company_id;
      }
    } else {
      // No company name provided - try to derive from email domain
      const emailDomain = email.split('@')[1];
      const derivedCompanyName = emailDomain?.split('.')[0] || 'Unknown';

      // Check if company exists by email domain (simplified matching)
      const { data: existingByDomain } = await supabase
        .from('companies')
        .select('company_id')
        .ilike('company_name', `%${derivedCompanyName}%`)
        .limit(1)
        .single();

      if (existingByDomain) {
        company_id = existingByDomain.company_id;
      } else {
        // Create company with derived name
        const newCompanyId = crypto.randomUUID();

        const { data: newCompany, error: companyError } = await supabase
          .from('companies')
          .insert({
            company_id: newCompanyId,
            company_name: derivedCompanyName.charAt(0).toUpperCase() + derivedCompanyName.slice(1),
            source: 'website_trial',
            category: 'prospect',
          })
          .select('company_id')
          .single();

        if (companyError || !newCompany) {
          console.error('Company creation error:', companyError);
          return NextResponse.json({ error: 'Failed to create company record' }, { status: 500 });
        }
        company_id = newCompany.company_id;
      }
    }

    // 2. Find or create contact
    let contact_id: string;

    const { data: existingContact } = await supabase
      .from('contacts')
      .select('contact_id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingContact) {
      contact_id = existingContact.contact_id;

      // Update contact with latest info if needed
      await supabase
        .from('contacts')
        .update({
          company_id, // Link to company if not already
          phone: phone || undefined,
        })
        .eq('contact_id', contact_id);
    } else {
      // Parse name into first/last (best effort)
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          company_id,
          full_name: name.trim(),
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase().trim(),
          phone: phone || null,
          status: 'active',
          source: 'website_trial',
          marketing_status: 'subscribed',
        })
        .select('contact_id')
        .single();

      if (contactError || !newContact) {
        console.error('Contact creation error:', contactError);
        return NextResponse.json({ error: 'Failed to create contact record' }, { status: 500 });
      }
      contact_id = newContact.contact_id;
    }

    // 3. Link machine to company (if not already linked)
    const { data: existingLink } = await supabase
      .from('company_machine')
      .select('id')
      .eq('company_id', company_id)
      .eq('machine_id', machine_id)
      .single();

    if (!existingLink) {
      const { error: linkError } = await supabase
        .from('company_machine')
        .insert({
          company_id,
          machine_id,
          source: 'trial_request',
        });

      if (linkError) {
        console.warn('[trial/create-intent] Failed to link machine to company:', linkError);
        // Don't fail the request - this is non-critical
      }
    }

    // 4. Generate secure token and insert trial_intent
    const token = crypto.randomBytes(32).toString('base64url');

    const { error: intentError } = await supabase
      .from('trial_intents')
      .insert({
        token,
        company_id,
        contact_id,
        machine_id,
      });

    if (intentError) {
      console.error('Trial intent creation error:', intentError);
      return NextResponse.json({ error: 'Failed to create trial intent' }, { status: 500 });
    }

    // 4. Send email with offer link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.technifold.com';
    const offerUrl = `${baseUrl}/offer?token=${token}`;
    const machineName = `${machine_brand} ${machine_model}`.trim();

    const resend = getResendClient();
    if (resend) {
      // Use trial-specific from address, fall back to general, then Resend default
      const fromEmail = process.env.RESEND_FROM_EMAIL_TRIALS || process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

      try {
        await resend.emails.send({
          from: fromEmail,
          to: [email],
          subject: `Your ${machineName} finishing trial offer`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 30px; border-radius: 12px 12px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Your Personalized Trial Offer</h1>
                  <p style="color: #94a3b8; margin: 8px 0 0 0;">Technifold Finishing Solutions</p>
                </div>

                <div style="background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
                  <p style="font-size: 16px; margin-top: 0;">Hi ${name.split(' ')[0]},</p>

                  <p style="font-size: 16px;">
                    Thank you for your interest in improving the finishing quality on your
                    <strong>${machineName}</strong>.
                  </p>

                  <p style="font-size: 16px;">
                    We've prepared a personalized offer based on your machine type. Click below to see
                    your options and start your <strong>30-day free trial</strong>:
                  </p>

                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${offerUrl}" style="background: #0891b2; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 18px; display: inline-block;">
                      View My Trial Offer
                    </a>
                  </div>

                  <div style="background: #f0fdfa; border-left: 4px solid #0891b2; padding: 20px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0 0 12px 0; font-weight: 600; color: #0f766e;">What's included:</p>
                    <ul style="margin: 0; padding-left: 20px; color: #475569;">
                      <li style="margin-bottom: 6px;">30-day free trial period</li>
                      <li style="margin-bottom: 6px;">Full installation support</li>
                      <li style="margin-bottom: 6px;">Training included</li>
                      <li style="margin-bottom: 6px;">Return at no cost if not satisfied</li>
                    </ul>
                  </div>

                  <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 24px 0; border-radius: 4px;">
                    <p style="margin: 0; font-size: 14px; color: #92400e;">
                      <strong>Note:</strong> This link is personalized for you and will expire in 7 days.
                    </p>
                  </div>

                  <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

                  <p style="font-size: 14px; color: #64748b;">
                    Questions? Call us at <strong>+44 (0)1455 381 538</strong> or reply to this email.
                  </p>

                  <p style="font-size: 12px; color: #999; margin-top: 24px;">
                    Technifold Ltd<br>
                    Unit 2, St John's Business Park<br>
                    Lutterworth, Leicestershire, LE17 4HB, UK<br>
                    <a href="https://technifold.com" style="color: #0891b2;">technifold.com</a>
                  </p>
                </div>
              </body>
            </html>
          `,
        });

        console.log(`[trial/create-intent] Email sent to ${email} for machine ${machine_id}`);
      } catch (emailError) {
        console.error('[trial/create-intent] Email send error:', emailError);
        // Don't fail the request if email fails - the trial_intent is already created
      }
    } else {
      console.warn('[trial/create-intent] Resend not configured, skipping email');
    }

    // 5. Log engagement event
    const { error: engagementError } = await supabase.from('engagement_events').insert({
      company_id,
      contact_id,
      event_type: 'trial_signup',
      event_name: 'trial_intent_created',
      source: 'website',
      meta: {
        machine_id,
        machine_brand,
        machine_model,
        machine_type,
      },
    });

    if (engagementError) {
      console.error('[trial/create-intent] Engagement event error:', engagementError);
    }

    return NextResponse.json({
      success: true,
      message: 'Trial offer email sent',
    });

  } catch (error: any) {
    console.error('[trial/create-intent] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to process request' },
      { status: 500 }
    );
  }
}
