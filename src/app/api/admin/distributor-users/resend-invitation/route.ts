/**
 * POST /api/admin/distributor-users/resend-invitation
 * Resend invitation email to a distributor user
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
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id } = await request.json();

    if (!user_id) {
      return NextResponse.json({ error: 'user_id required' }, { status: 400 });
    }

    const supabase = getSupabaseClient();

    // Get user details
    const { data: user, error: userError } = await supabase
      .from('distributor_users')
      .select('*, companies(company_name)')
      .eq('user_id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Generate new invitation token
    const invitation_token = crypto.randomBytes(32).toString('hex');
    const invitation_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    // Update user with new token
    const { error: updateError } = await supabase
      .from('distributor_users')
      .update({
        invitation_token,
        invitation_expires_at,
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('[Resend Invitation] Update error:', updateError);
      return NextResponse.json({ error: 'Failed to update invitation' }, { status: 500 });
    }

    // Send invitation email
    if (resend) {
      const invitationUrl = `${process.env.NEXT_PUBLIC_URL || 'https://technifold-automation.vercel.app'}/distributor/accept-invitation?token=${invitation_token}`;

      try {
        await resend.emails.send({
          from: 'Technifold Distributor Team <distributors@technifold.com>',
          to: user.email,
          subject: 'Welcome to Technifold Online Ordering Portal',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px;">Welcome to Technifold</h1>

              <p style="font-size: 16px;">Hi ${user.full_name},</p>

              <p style="font-size: 16px;">Great news! We've upgraded our ordering system and you now have access to the <strong>Technifold Online Ordering Portal</strong>.</p>

              <div style="background-color: #f0f7ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
                <h3 style="margin-top: 0; color: #1e40af;">What This Means for You:</h3>
                <ul style="margin-bottom: 0;">
                  <li><strong>24/7 Ordering</strong> - Place orders anytime, anywhere</li>
                  <li><strong>Instant Pricing</strong> - See your distributor pricing in real-time</li>
                  <li><strong>Order History</strong> - View all your past invoices and orders</li>
                  <li><strong>Faster Processing</strong> - Orders go directly into our system</li>
                </ul>
              </div>

              <p style="font-size: 16px;"><strong>This is now the primary way to place orders with Technifold.</strong></p>

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

        console.log(`[Resend Invitation] Sent to ${user.email}`);
      } catch (emailError) {
        console.error('[Resend Invitation] Email error:', emailError);
        return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
      }
    } else {
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Invitation resent',
    });
  } catch (error: any) {
    console.error('[Resend Invitation] Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
