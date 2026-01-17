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
          from: 'Technifold <noreply@technifold.com>',
          to: user.email,
          subject: 'Invitation to Technifold Distributor Portal',
          html: `
            <h2>Welcome to Technifold Distributor Portal</h2>
            <p>Hi ${user.full_name},</p>
            <p>You've been invited to access the distributor portal for <strong>${user.companies?.company_name}</strong>.</p>
            <p>Click the link below to set your password and get started:</p>
            <p><a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a></p>
            <p>Or copy this link: ${invitationUrl}</p>
            <p>This invitation expires in 7 days.</p>
            <p>Best regards,<br>Technifold Team</p>
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
