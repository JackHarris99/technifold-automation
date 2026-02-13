/**
 * POST /api/admin/customer-users/send-test-email
 * Admin-only: Send test reminder email to customer user
 * Shows product images and portal access link
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { sendConsumableReminder } from '@/lib/emails';

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { user_id, company_id } = await request.json();

    if (!user_id || !company_id) {
      return NextResponse.json(
        { error: 'user_id and company_id required' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Get customer user details
    const { data: user, error: userError } = await supabase
      .from('customer_users')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (userError || !user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.is_active) {
      return NextResponse.json({ error: 'User is not active' }, { status: 400 });
    }

    // Get company name
    const { data: company } = await supabase
      .from('companies')
      .select('company_name')
      .eq('company_id', company_id)
      .single();

    const companyName = company?.company_name || 'Your Company';

    // Fetch company's CONSUMABLE products only for email display (max 10 for selection, email will show top 6)
    const { data: productHistory } = await supabase
      .from('company_product_history')
      .select('product_code')
      .eq('company_id', company_id)
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
        .eq('type', 'consumable');

      if (productDetails) {
        products = productDetails;
      }
    }

    // Generate portal access URL using permanent token
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.technifold.com';
    const portalUrl = user.portal_token
      ? `${baseUrl}/customer/access?token=${user.portal_token}`
      : `${baseUrl}/customer/login`;

    // Send test reminder email using React Email
    const emailResult = await sendConsumableReminder(user.email, {
      contactName: user.first_name,
      companyName,
      portalUrl,
      products,
    });

    if (!emailResult.success) {
      console.error('[Test Email] Send failed:', emailResult.error);
      return NextResponse.json(
        { error: `Failed to send email: ${emailResult.error}` },
        { status: 500 }
      );
    }

    console.log('[Test Email] Sent successfully:', {
      to: user.email,
      messageId: emailResult.messageId,
      productCount: products.length,
    });

    return NextResponse.json({
      success: true,
      message: `Test email sent to ${user.email}`,
      messageId: emailResult.messageId,
      productCount: products.length,
    });
  } catch (error: any) {
    console.error('[Test Email] Error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
