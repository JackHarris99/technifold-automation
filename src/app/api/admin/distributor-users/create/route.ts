/**
 * POST /api/admin/distributor-users/create
 * Create a new distributor user and send invitation email
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

    const { company_id, email, full_name, role } = await request.json();

    if (!company_id || !email || !full_name) {
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
      console.error('[Create Distributor User] Database error:', createError);
      return NextResponse.json(
        { error: 'Failed to create user' },
        { status: 500 }
      );
    }

    // Get company name for email
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('company_id', company_id)
      .single();

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
            <p>You've been invited to access the distributor portal for <strong>${company?.company_name}</strong>.</p>
            <p>Click the link below to set your password and get started:</p>
            <p><a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Accept Invitation</a></p>
            <p>Or copy this link: ${invitationUrl}</p>
            <p>This invitation expires in 7 days.</p>
            <p>Best regards,<br>Technifold Team</p>
          `,
        });

        console.log(`[Create Distributor User] Invitation sent to ${email}`);
      } catch (emailError) {
        console.error('[Create Distributor User] Email error:', emailError);
        // Don't fail the request if email fails - user is created
      }
    }

    return NextResponse.json({
      success: true,
      user: newUser,
      message: 'User created and invitation sent',
    });
  } catch (error: any) {
    console.error('[Create Distributor User] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
