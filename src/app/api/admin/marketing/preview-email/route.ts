/**
 * POST /api/admin/marketing/preview-email
 * Generate HTML preview of marketing email
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { generateToken } from '@/lib/tokens';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { company_id, contact_id, machine_slug } = body;

    if (!company_id || !contact_id || !machine_slug) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get company details
    const { data: company } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('company_id', company_id)
      .single();

    if (!company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Get contact details
    const { data: contact } = await supabase
      .from('contacts')
      .select('contact_id, email, full_name, first_name')
      .eq('contact_id', contact_id)
      .single();

    if (!contact) {
      return NextResponse.json({ error: 'Contact not found' }, { status: 404 });
    }

    // Get machine details
    const { data: machine } = await supabase
      .from('machines')
      .select('brand, model, display_name')
      .eq('slug', machine_slug)
      .single();

    if (!machine) {
      return NextResponse.json({ error: 'Machine not found' }, { status: 404 });
    }

    // Generate token and URL
    const token = generateToken({ company_id, contact_id });
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://yourdomain.com';
    const tokenUrl = `${baseUrl}/m/${token}`;

    const contactName = contact.full_name || contact.first_name || '';
    const companyName = company.company_name;
    const subject = `Solutions for your ${machine.brand} ${machine.model}`;
    const preview = `We've identified solutions that can help improve quality and reduce waste on your ${machine.brand} ${machine.model}.`;

    // Generate email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background: #f9fafb;">
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
    `;

    return NextResponse.json({
      success: true,
      subject,
      html: emailHtml,
      tokenUrl,
      from: process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev',
      to: contact.email,
    });
  } catch (err) {
    console.error('[admin/marketing/preview-email] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
