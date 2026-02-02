/**
 * POST /api/admin/distributors/send-invitations
 * Admin: Create distributor users and send invitations for companies
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

interface InvitationRequest {
  company_id: string;
  sage_customer_code: string;
  company_name: string;
  contacts: Array<{
    email: string;
    full_name: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const { invitations }: { invitations: InvitationRequest[] } = await request.json();

    if (!invitations || !Array.isArray(invitations)) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();
    const results: any[] = [];

    for (const inv of invitations) {
      const companyResults = [];

      for (const contact of inv.contacts) {
        if (!contact.email || !contact.full_name) {
          companyResults.push({
            email: contact.email,
            success: false,
            error: 'Missing email or name'
          });
          continue;
        }

        // Check if user already exists
        const { data: existingUser } = await supabase
          .from('distributor_users')
          .select('user_id, email, active, invitation_token')
          .eq('email', contact.email)
          .single();

        if (existingUser) {
          // User exists - check if they need a new invitation
          if (existingUser.invitation_token) {
            // Has pending invitation - resend
            const invitationUrl = `${process.env.NEXT_PUBLIC_URL || 'https://technifold.com'}/distributor/accept-invitation?token=${existingUser.invitation_token}`;

            if (resend) {
              try {
                await resend.emails.send({
                  from: 'Technifold Distributor Team <distributors@technifold.com>',
                  to: contact.email,
                  subject: 'Reminder: Complete Your Technifold Account Setup',
                  html: generateInvitationEmail(contact.full_name, inv.company_name, invitationUrl, true),
                });

                companyResults.push({
                  email: contact.email,
                  success: true,
                  action: 'resent_invitation'
                });
              } catch (emailError) {
                companyResults.push({
                  email: contact.email,
                  success: false,
                  error: 'Failed to send email'
                });
              }
            }
          } else {
            // Already has account
            companyResults.push({
              email: contact.email,
              success: false,
              error: 'User already has an active account'
            });
          }
          continue;
        }

        // Create new user
        const invitation_token = crypto.randomBytes(32).toString('hex');
        const invitation_expires_at = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

        const { data: newUser, error: createError } = await supabase
          .from('distributor_users')
          .insert({
            company_id: inv.company_id,
            email: contact.email,
            full_name: contact.full_name,
            role: 'admin', // First user is admin
            invitation_token,
            invitation_expires_at,
            active: true,
          })
          .select()
          .single();

        if (createError) {
          console.error('[Send Invitations] Create error:', createError);
          companyResults.push({
            email: contact.email,
            success: false,
            error: createError.message
          });
          continue;
        }

        // Send invitation email
        if (resend) {
          const invitationUrl = `${process.env.NEXT_PUBLIC_URL || 'https://technifold.com'}/distributor/accept-invitation?token=${invitation_token}`;

          try {
            await resend.emails.send({
              from: 'Technifold Distributor Team <distributors@technifold.com>',
              to: contact.email,
              subject: 'Welcome to Technifold Online Ordering Portal',
              html: generateInvitationEmail(contact.full_name, inv.company_name, invitationUrl, false),
            });

            companyResults.push({
              email: contact.email,
              success: true,
              action: 'sent_invitation'
            });
          } catch (emailError) {
            console.error('[Send Invitations] Email error:', emailError);
            companyResults.push({
              email: contact.email,
              success: false,
              error: 'User created but email failed'
            });
          }
        } else {
          companyResults.push({
            email: contact.email,
            success: true,
            action: 'user_created_no_email'
          });
        }
      }

      results.push({
        company: inv.company_name,
        sage_code: inv.sage_customer_code,
        contacts: companyResults
      });
    }

    return NextResponse.json({
      success: true,
      results
    });
  } catch (error: any) {
    console.error('[Send Invitations] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateInvitationEmail(fullName: string, companyName: string, invitationUrl: string, isReminder: boolean): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px;">
        ${isReminder ? 'Reminder: ' : ''}Welcome to Technifold
      </h1>

      <p style="font-size: 16px;">Hi ${fullName},</p>

      ${isReminder
        ? '<p style="font-size: 16px;">This is a reminder to complete your account setup for the <strong>Technifold Online Ordering Portal</strong>.</p>'
        : `<p style="font-size: 16px;">Great news! You've been added to <strong>${companyName}'s</strong> Technifold Online Ordering Portal.</p>`
      }

      <div style="background-color: #f0f7ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1e40af;">What You Can Do:</h3>
        <ul style="margin-bottom: 0;">
          <li><strong>24/7 Ordering</strong> - Place orders anytime, anywhere</li>
          <li><strong>Instant Pricing</strong> - See your distributor pricing in real-time (Tier 1: 40% off, Tier 2: 30% off, Tier 3: 20% off)</li>
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
  `;
}
