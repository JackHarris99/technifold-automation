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
      const invitationUrl = `${process.env.NEXT_PUBLIC_URL || 'https://technifold-automation.vercel.app'}/distributor/accept-invitation?token=${invitation_token}`;

      try {
        await resend.emails.send({
          from: 'Technifold <noreply@technifold.com>',
          to: email,
          subject: 'Invitation to Technifold Distributor Portal',
          html: `
            <h2>Welcome to Technifold Distributor Portal</h2>
            <p>Hi ${full_name},</p>
            <p>You've been invited to access the distributor portal for <strong>${currentDistributor.company_name}</strong>.</p>
            <p>Click the link below to set your password and get started:</p>
            <p><a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a></p>
            <p>Or copy this link: ${invitationUrl}</p>
            <p>This invitation expires in 7 days.</p>
            <p>Best regards,<br>Technifold Team</p>
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
