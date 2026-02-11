/**
 * POST /api/admin/customer-users/create
 * Create a new customer user and send invitation email
 * Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { company_id, email, first_name, last_name, role = 'user' } = body;

    // Validate required fields
    if (!company_id || !email || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('customer_users')
      .select('email')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Verify company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name')
      .eq('company_id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Generate invitation token (valid for 7 days)
    const invitation_token = crypto.randomBytes(32).toString('hex');
    const invitation_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('customer_users')
      .insert({
        company_id,
        email: email.toLowerCase().trim(),
        first_name,
        last_name,
        role,
        invitation_token,
        invitation_expires_at,
        is_active: true,
      })
      .select()
      .single();

    if (createError) {
      console.error('[Create Customer User] Database error:', createError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Send invitation email
    if (resend) {
      const invitationUrl = `${process.env.NEXT_PUBLIC_URL || 'https://technifold.com'}/customer/accept-invitation?token=${invitation_token}`;

      try {
        await resend.emails.send({
          from: 'Technifold <orders@technifold.com>',
          to: email,
          subject: 'Welcome to Your Technifold Customer Portal',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px;">Welcome to Technifold</h1>

              <p style="font-size: 16px;">Hi ${first_name},</p>

              <p style="font-size: 16px;">Great news! You now have access to the <strong>Technifold Customer Portal</strong> for ${company.company_name}.</p>

              <div style="background-color: #f0f7ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">What You Can Do:</h3>
                <ul style="margin-bottom: 0;">
                  <li><strong>Quick Reordering</strong> - Reorder from your purchase history with one click</li>
                  <li><strong>Order Tracking</strong> - See your pending orders and invoices</li>
                  <li><strong>Manage Addresses</strong> - Save multiple shipping addresses</li>
                  <li><strong>View Invoices</strong> - Download PDFs and make payments</li>
                </ul>
              </div>

              <h3 style="color: #1e40af;">Get Started in 2 Easy Steps:</h3>
              <ol style="font-size: 16px;">
                <li>Click the button below to set your password</li>
                <li>Start browsing and ordering!</li>
              </ol>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${invitationUrl}" style="display: inline-block; padding: 15px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Set Up My Account</a>
              </div>

              <p style="font-size: 14px; color: #666;">Or copy this link: <a href="${invitationUrl}" style="color: #2563eb;">${invitationUrl}</a></p>

              <p style="font-size: 14px; color: #666; font-style: italic;">This invitation link expires in 7 days.</p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

              <p style="font-size: 14px;">Need help? Reply to this email or contact us at orders@technifold.com</p>

              <p style="font-size: 14px;">Best regards,<br><strong>The Technifold Team</strong></p>
            </div>
          `,
        });

        console.log(`[Create Customer User] Invitation sent to ${email}`);
      } catch (emailError) {
        console.error('[Create Customer User] Email error:', emailError);
        // Don't fail the request if email fails - user is created
      }
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created and invitation sent',
    });
  } catch (error: any) {
    console.error('[Create Customer User] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
