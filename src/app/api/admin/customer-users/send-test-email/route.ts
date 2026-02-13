/**
 * POST /api/admin/customer-users/send-test-email
 * Admin-only: Send test reminder email to customer user
 * Shows product images and portal access link
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getSupabaseClient } from '@/lib/supabase';
import { sendConsumableReminder } from '@/lib/emails';

// Category priority order for consumables in restock emails
// Shows variety (one per category) with smart splitting if few categories available
const CATEGORY_PRIORITY = [
  'Rubber Creasing Band',
  'Rubber Creasing Band (Inserts - older style)',
  'Rubber Creasing Matrix',
  'Micro-Perforation Blade',
  'Nylon Sleeve - CP Applicator',
  'Nylon Sleeve - Multi-Tool',
  'Nylon Sleeve - Perforation Device',
  'Cutting Boss',
  'Cutting Knife',
  'Waste-Stripper',
  'Rubber Creasing Band - Digital Version (Softer)',
  'Plastic Creasing Band',
  'Section Scoring Band',
  'Female Receiver Ring',
  'Gripper Band',
  'Pharma-Score Band',
];

/**
 * Select products for email with category variety and priority
 * Shows one product per category (in priority order), with smart splitting if few categories
 */
function selectProductsForEmail(
  allProducts: Array<{ product_code: string; description: string; image_url?: string | null; category?: string | null }>,
  maxProducts: number = 6
): Array<{ product_code: string; description: string; image_url?: string | null }> {
  // Group products by category (only priority categories)
  const productsByCategory = new Map<string, typeof allProducts>();

  for (const product of allProducts) {
    const category = product.category;
    if (!category || !CATEGORY_PRIORITY.includes(category)) continue;

    if (!productsByCategory.has(category)) {
      productsByCategory.set(category, []);
    }
    productsByCategory.get(category)!.push(product);
  }

  // Sort categories by priority
  const sortedCategories = Array.from(productsByCategory.keys()).sort(
    (a, b) => CATEGORY_PRIORITY.indexOf(a) - CATEGORY_PRIORITY.indexOf(b)
  );

  if (sortedCategories.length === 0) return [];

  // Calculate how many products to take from each category (smart splitting)
  const productsPerCategory = Math.ceil(maxProducts / sortedCategories.length);

  const selectedProducts: typeof allProducts = [];

  // Take products from each category in priority order
  for (const category of sortedCategories) {
    const categoryProducts = productsByCategory.get(category)!;
    const toTake = Math.min(productsPerCategory, categoryProducts.length);
    selectedProducts.push(...categoryProducts.slice(0, toTake));

    if (selectedProducts.length >= maxProducts) break;
  }

  return selectedProducts.slice(0, maxProducts);
}

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

    // Fetch company's CONSUMABLE products for email display
    // Order by most recently purchased to show relevant restocking suggestions
    const { data: productHistory } = await supabase
      .from('company_product_history')
      .select('product_code')
      .eq('company_id', company_id)
      .eq('product_type', 'consumable')
      .order('last_purchased_at', { ascending: false })
      .limit(50); // Fetch more to ensure variety across categories

    let allProducts: Array<{ product_code: string; description: string; image_url?: string | null; category?: string | null }> = [];

    if (productHistory && productHistory.length > 0) {
      const productCodes = productHistory.map(p => p.product_code);
      const { data: productDetails } = await supabase
        .from('products')
        .select('product_code, description, image_url, category')
        .in('product_code', productCodes)
        .eq('active', true)
        .eq('type', 'consumable');

      if (productDetails) {
        allProducts = productDetails;
      }
    }

    // FALLBACK: If no consumable history, suggest consumables for their tools
    if (allProducts.length === 0) {
      // Get tools they've purchased
      const { data: toolHistory } = await supabase
        .from('company_product_history')
        .select('product_code')
        .eq('company_id', company_id)
        .eq('product_type', 'tool')
        .order('last_purchased_at', { ascending: false })
        .limit(10);

      if (toolHistory && toolHistory.length > 0) {
        const toolCodes = toolHistory.map(t => t.product_code);

        // Get compatible consumables for these tools
        const { data: compatibleConsumables } = await supabase
          .from('tool_consumable_map')
          .select('consumable_code')
          .in('tool_code', toolCodes)
          .limit(50);

        if (compatibleConsumables && compatibleConsumables.length > 0) {
          const consumableCodes = [...new Set(compatibleConsumables.map(c => c.consumable_code))];

          // Fetch product details for these consumables
          const { data: productDetails } = await supabase
            .from('products')
            .select('product_code, description, image_url, category')
            .in('product_code', consumableCodes)
            .eq('active', true)
            .eq('type', 'consumable');

          if (productDetails) {
            allProducts = productDetails;
          }
        }
      }
    }

    // Select products with category variety and priority (max 6 for email)
    const products = selectProductsForEmail(allProducts, 6);

    // Don't send email if no products to show (no purchase history)
    if (products.length === 0) {
      return NextResponse.json(
        { error: 'No purchase history to generate restock suggestions' },
        { status: 400 }
      );
    }

    // Generate portal access URL using permanent token
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://www.technifold.com';
    const portalUrl = user.portal_token
      ? `${baseUrl}/customer/access?token=${user.portal_token}`
      : `${baseUrl}/customer/login`;

    // Transform products to match email template interface (sku, imageUrl)
    const emailProducts = products.map(p => ({
      sku: p.product_code,
      imageUrl: p.image_url,
    }));

    // Send test reminder email using React Email
    const emailResult = await sendConsumableReminder(user.email, {
      contactName: user.first_name,
      companyName,
      portalUrl,
      products: emailProducts,
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
