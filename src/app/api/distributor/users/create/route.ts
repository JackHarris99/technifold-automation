/**
 * POST /api/distributor/users/create
 * Create a new team member (distributor admin only)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentDistributor } from '@/lib/distributorAuth';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const currentDistributor = await getCurrentDistributor();
    if (!currentDistributor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (currentDistributor.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can add team members' },
        { status: 403 }
      );
    }

    const { company_id, email, full_name, role } = await request.json();

    // Verify they're adding users to their own company
    if (company_id !== currentDistributor.company_id) {
      return NextResponse.json(
        { error: 'You can only add users to your own company' },
        { status: 403 }
      );
    }

    if (!email || !full_name) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['admin', 'user', 'viewer'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from('distributor_users')
      .select('email')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 400 }
      );
    }

    // Generate invitation token (valid for 7 days)
    const invitation_token = crypto.randomBytes(32).toString('hex');
    const invitation_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Create user
    const { data: newUser, error: createError } = await supabase
      .from('distributor_users')
      .insert({
        company_id,
        email,
        full_name,
        role,
        invitation_token,
        invitation_expires_at,
        active: true,
      })
      .select()
      .single();

    if (createError) {
      console.error('[Create Team Member] Database error:', createError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Send invitation email
    if (resend) {
      const invitationUrl = `${process.env.NEXT_PUBLIC_URL || 'https://technifold.com'}/distributor/accept-invitation?token=${invitation_token}`;

      try {
        await resend.emails.send({
          from: 'Technifold Distributor Team <distributors@technifold.com>',
          to: email,
          subject: 'Welcome to Technifold Online Ordering Portal',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px;">Welcome to Technifold</h1>

              <p style="font-size: 16px;">Hi ${full_name},</p>

              <p style="font-size: 16px;">Great news! You've been added to <strong>${currentDistributor.company_name}'s</strong> Technifold Online Ordering Portal.</p>

              <div style="background-color: #f0f7ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">What You Can Do:</h3>
                <ul style="margin-bottom: 0;">
                  <li><strong>24/7 Ordering</strong> - Place orders anytime, anywhere</li>
                  <li><strong>Instant Pricing</strong> - See your distributor pricing in real-time</li>
                  <li><strong>Order History</strong> - View all your past invoices and orders</li>
                  <li><strong>Faster Processing</strong> - Orders go directly into our system</li>
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

              <p style="font-size: 14px;">Need help? Reply to this email or contact us at support@technifold.com</p>

              <p style="font-size: 14px;">Best regards,<br><strong>The Technifold Team</strong></p>
            </div>
          `,
        });

        console.log(`[Create Team Member] Invitation sent to ${email}`);
      } catch (emailError) {
        console.error('[Create Team Member] Email error:', emailError);
        // Don't fail the request if email fails - user is created
      }
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created and invitation sent',
    });
  } catch (error: any) {
    console.error('[Create Team Member] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
