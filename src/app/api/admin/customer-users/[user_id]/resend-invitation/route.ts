/**
 * POST /api/admin/customer-users/[user_id]/resend-invitation
 * Send portal access link to customer user (passwordless)
 * Admin only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { Resend } from 'resend';

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ user_id: string }> }
) {
  try {
    // Check authentication
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id } = await context.params;
    const supabase = getSupabaseClient();

    // Get user with company info and portal token
    const { data: user, error: userError } = await supabase
      .from('customer_users')
      .select(`
        user_id,
        email,
        first_name,
        last_name,
        company_id,
        is_active,
        portal_token,
        companies (
          company_id,
          company_name
        )
      `)
      .eq('user_id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!user.is_active) {
      return NextResponse.json(
        { error: 'User is not active' },
        { status: 400 }
      );
    }

    if (!user.portal_token) {
      return NextResponse.json(
        { error: 'User does not have a portal token' },
        { status: 400 }
      );
    }

    // Send portal access email
    if (!resend) {
      return NextResponse.json(
        { error: 'Email service not configured' },
        { status: 500 }
      );
    }

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_URL || 'https://www.technifold.com';
    const portalUrl = `${baseUrl}/customer/access?token=${user.portal_token}`;

    try {
      await resend.emails.send({
        from: 'Technifold <orders@technifold.com>',
        to: user.email,
        subject: 'Your Technifold Customer Portal Access',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1e40af; border-bottom: 3px solid #1e40af; padding-bottom: 10px;">Access Your Customer Portal</h1>

            <p style="font-size: 16px;">Hi ${user.first_name},</p>

            <p style="font-size: 16px;">Your <strong>Technifold Customer Portal</strong> is ready for ${user.companies.company_name}.</p>

            <div style="background-color: #f0f7ff; border-left: 4px solid #2563eb; padding: 15px; margin: 20px 0;">
              <h3 style="margin-top: 0; color: #1e40af;">What You Can Do:</h3>
              <ul style="margin-bottom: 0;">
                <li><strong>Quick Reordering</strong> - Reorder from your purchase history with one click</li>
                <li><strong>Order Tracking</strong> - See your pending orders and invoices</li>
                <li><strong>Manage Addresses</strong> - Save multiple shipping addresses</li>
                <li><strong>View Invoices</strong> - Download PDFs and make payments</li>
              </ul>
            </div>

            <h3 style="color: #1e40af;">Access Your Portal:</h3>
            <p style="font-size: 16px;">Click the button below to access your portal instantly - no password needed!</p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${portalUrl}" style="display: inline-block; padding: 15px 30px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">Access Portal</a>
            </div>

            <p style="font-size: 14px; color: #666;">Or copy this link: <a href="${portalUrl}" style="color: #2563eb;">${portalUrl}</a></p>

            <p style="font-size: 14px; color: #16a34a; font-weight: bold;">💡 Tip: Bookmark this link for instant access anytime!</p>

            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">

            <p style="font-size: 14px;">Need help? Reply to this email or contact us at orders@technifold.com</p>

            <p style="font-size: 14px;">Best regards,<br><strong>The Technifold Team</strong></p>
          </div>
        `,
      });

      console.log(`[Send Portal Link] Portal access sent to ${user.email}`);
    } catch (emailError) {
      console.error('[Send Portal Link] Email error:', emailError);
      return NextResponse.json(
        { error: 'Failed to send portal access email' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Portal access link sent successfully',
    });
  } catch (error: any) {
    console.error('[Resend Invitation] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
