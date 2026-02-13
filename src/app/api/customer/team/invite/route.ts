/**
 * POST /api/customer/team/invite
 * Invite a team member to access the company portal
 * Creates contact + customer_user with permanent portal access link
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCustomerSession } from '@/lib/customerAuth';
import { getSupabaseClient } from '@/lib/supabase';
import crypto from 'node:crypto';

export async function POST(request: NextRequest) {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { email, first_name, last_name } = body;

    // Validate required fields
    if (!email || !first_name || !last_name) {
      return NextResponse.json(
        { error: 'Email, first name, and last name are required' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    const supabase = getSupabaseClient();

    // Check if email already has a customer_users account
    const { data: existingUser } = await supabase
      .from('customer_users')
      .select('user_id, email')
      .eq('email', normalizedEmail)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'This email already has a portal account' },
        { status: 400 }
      );
    }

    // Check if contact exists in this company
    const { data: existingContact } = await supabase
      .from('contacts')
      .select('contact_id, email')
      .eq('company_id', session.company_id)
      .eq('email', normalizedEmail)
      .single();

    let contact_id = existingContact?.contact_id;

    // If contact doesn't exist, create it
    if (!contact_id) {
      const { data: newContact, error: contactError } = await supabase
        .from('contacts')
        .insert({
          company_id: session.company_id,
          email: normalizedEmail,
          first_name: first_name.trim(),
          last_name: last_name.trim(),
        })
        .select('contact_id')
        .single();

      if (contactError) {
        console.error('[Team Invite] Error creating contact:', contactError);
        return NextResponse.json(
          { error: 'Failed to create contact record' },
          { status: 500 }
        );
      }

      contact_id = newContact.contact_id;
    }

    // Generate permanent portal token (1 year expiry)
    const portal_token = crypto.randomBytes(32).toString('hex');
    const portal_token_expires_at = new Date();
    portal_token_expires_at.setFullYear(portal_token_expires_at.getFullYear() + 1);

    // Create customer_user account with NULL password
    const { data: newUser, error: userError } = await supabase
      .from('customer_users')
      .insert({
        company_id: session.company_id,
        contact_id,
        email: normalizedEmail,
        first_name: first_name.trim(),
        last_name: last_name.trim(),
        role: 'user',
        is_active: true,
        password_hash: null, // NULL password - uses portal token for access
        portal_token,
        portal_token_expires_at: portal_token_expires_at.toISOString(),
      })
      .select('user_id, portal_token')
      .single();

    if (userError) {
      console.error('[Team Invite] Error creating customer_user:', userError);
      return NextResponse.json(
        { error: 'Failed to create portal account' },
        { status: 500 }
      );
    }

    // Generate the portal access URL
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.technifold.com';
    const portalAccessUrl = `${baseUrl}/customer/access?token=${newUser.portal_token}`;

    console.log('[Team Invite] Created team member account:', {
      user_id: newUser.user_id,
      email: normalizedEmail,
      company_id: session.company_id,
      portal_url: portalAccessUrl,
    });

    // Get company name for email
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('company_id', session.company_id)
      .single();

    const companyName = company?.company_name || 'Your Company';

    // Fetch company's CONSUMABLE products only for email display (max 6 products with images)
    const { data: productHistory } = await supabase
      .from('company_product_history')
      .select('product_code')
      .eq('company_id', session.company_id)
      .eq('product_type', 'consumable')
      .limit(10);

    let products: Array<{ product_code: string; description: string; image_url?: string | null }> = [];

    if (productHistory && productHistory.length > 0) {
      const productCodes = productHistory.map(p => p.product_code);
      const { data: productDetails } = await supabase
        .from('products')
        .select('product_code, description, image_url')
        .in('product_code', productCodes)
        .eq('active', true)
        .eq('type', 'consumable')
        .limit(6);

      if (productDetails) {
        products = productDetails;
      }
    }

    // Send invitation email
    const { sendTeamMemberInvitation } = await import('@/lib/resend-client');
    const emailResult = await sendTeamMemberInvitation({
      to: normalizedEmail,
      contactName: first_name.trim(),
      companyName,
      portalUrl: portalAccessUrl,
      invitedBy: session.first_name,
      products,
    });

    if (!emailResult.success) {
      console.error('[Team Invite] Email send failed:', emailResult.error);
      // Don't fail the request - account was still created
    }

    return NextResponse.json({
      success: true,
      message: 'Team member invited successfully',
      portal_url: portalAccessUrl,
      user_id: newUser.user_id,
      email_sent: emailResult.success,
    });
  } catch (error: any) {
    console.error('[Team Invite] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
