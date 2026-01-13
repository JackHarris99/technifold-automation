/**
 * POST /api/admin/auth/forgot-password
 * Send password reset email to user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getResendClient } from '@/lib/resend-client';
import crypto from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Find user by email
    const { data: user, error: fetchError } = await supabase
      .from('users')
      .select('user_id, email, full_name')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .single();

    // For security: Always return success even if user doesn't exist
    // This prevents email enumeration attacks
    if (fetchError || !user) {
      console.log('[forgot-password] User not found:', email);
      return NextResponse.json({
        success: true,
        message: 'If an account exists, reset email will be sent'
      });
    }

    // Generate secure reset token (32 bytes = 64 hex characters)
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Store reset token in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires: expiresAt.toISOString()
      })
      .eq('user_id', user.user_id);

    if (updateError) {
      console.error('[forgot-password] Failed to store token:', updateError);
      return NextResponse.json(
        { error: 'Failed to generate reset link' },
        { status: 500 }
      );
    }

    // Send email with reset link
    const resend = getResendClient();
    if (!resend) {
      console.error('[forgot-password] Resend not configured');
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password/${resetToken}`;

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Logo Header -->
          <div style="padding: 30px 40px; background-color: #ffffff; border-bottom: 1px solid #e5e7eb;">
            <img
              src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
              alt="Technifold"
              style="height: 48px; display: block;"
            />
          </div>

          <!-- Email Content -->
          <div style="padding: 40px;">
            <h2 style="font-size: 24px; font-weight: bold; color: #111827; margin: 0 0 24px 0;">
              Password Reset Request
            </h2>

            <p style="font-size: 16px; color: #374151; margin: 0 0 16px 0; line-height: 24px;">
              Hi ${user.full_name},
            </p>

            <p style="font-size: 16px; color: #374151; margin: 0 0 24px 0; line-height: 24px;">
              We received a request to reset your password for your Technifold admin account. Click the button below to create a new password:
            </p>

            <!-- CTA Button -->
            <div style="text-align: center; margin: 32px 0;">
              <a href="${resetUrl}" style="display: inline-block; background-color: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px;">
                Reset Password
              </a>
            </div>

            <p style="font-size: 14px; color: #6b7280; margin: 24px 0 0 0; line-height: 20px;">
              This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.
            </p>

            <p style="font-size: 12px; color: #9ca3af; margin: 16px 0 0 0; line-height: 18px;">
              If the button doesn't work, copy and paste this link into your browser:<br/>
              <a href="${resetUrl}" style="color: #2563eb; word-break: break-all;">${resetUrl}</a>
            </p>
          </div>

          <!-- Footer -->
          <div style="padding: 24px 40px; background-color: #f9fafb; border-top: 1px solid #e5e7eb;">
            <p style="margin: 0; font-size: 12px; color: #6b7280; text-align: center;">
              Technifold International Limited
            </p>
          </div>
        </div>
      </body>
      </html>
    `;

    const fromEmail = process.env.RESEND_FROM_EMAIL_NOTIFICATIONS || process.env.RESEND_FROM_EMAIL || 'notifications@technifold.com';

    const { error: sendError } = await resend.emails.send({
      from: fromEmail,
      to: [user.email],
      subject: 'Reset Your Technifold Admin Password',
      html: emailHtml
    });

    if (sendError) {
      console.error('[forgot-password] Failed to send email:', sendError);
      return NextResponse.json(
        { error: 'Failed to send reset email' },
        { status: 500 }
      );
    }

    console.log(`[forgot-password] Reset email sent to ${user.email}`);

    return NextResponse.json({
      success: true,
      message: 'If an account exists, reset email will be sent'
    });

  } catch (err) {
    console.error('[forgot-password] Error:', err);
    return NextResponse.json(
      { error: 'Internal error' },
      { status: 500 }
    );
  }
}
