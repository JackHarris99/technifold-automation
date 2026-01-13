/**
 * POST /api/admin/quotes/create
 * Creates a quote with server-resolved pricing and enqueues Zoho Books job
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { verifyAdminAuth } from '@/lib/admin-auth';

interface QuoteItem {
  product_code: string;
  quantity: number;
}

export async function POST(request: NextRequest) {
  // Verify admin authentication
  const authError = verifyAdminAuth(request);
  if (authError) return authError;
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { company_id, items, discount_request, notes } = body;

    // Validate input
    if (!company_id || !items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'company_id and items array are required' },
        { status: 400 }
      );
    }

    // Check territory permission
    const { canActOnCompany } = await import('@/lib/auth');
    const permission = await canActOnCompany(company_id);
    if (!permission.allowed) {
      return NextResponse.json(
        { error: permission.error },
        { status: 403 }
      );
    }

    const supabase = getSupabaseClient();

    // Validate company exists
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('company_id, company_name, zoho_account_id')
      .eq('company_id', company_id)
      .single();

    if (companyError || !company) {
      return NextResponse.json({ error: 'Company not found' }, { status: 404 });
    }

    // Server-side resolve product codes to catalog entries
    const productCodes = items.map((item: QuoteItem) => item.product_code);
    const { data: catalogProducts, error: catalogError } = await supabase
      .from('catalog_products')
      .select('product_code, stripe_price_id, description, unit_price')
      .in('product_code', productCodes);

    if (catalogError) {
      console.error('[quotes-create] Error fetching catalog products:', catalogError);
      return NextResponse.json(
        { error: 'Failed to resolve product codes' },
        { status: 500 }
      );
    }

    // Map product codes to catalog data
    const productMap = new Map(
      catalogProducts?.map(p => [p.product_code, p]) || []
    );

    // Build line items with resolved pricing
    const lineItems = items.map((item: QuoteItem) => {
      const catalogProduct = productMap.get(item.product_code);
      if (!catalogProduct) {
        throw new Error(`Product code ${item.product_code} not found in catalog`);
      }

      return {
        product_code: item.product_code,
        description: catalogProduct.description,
        quantity: item.quantity,
        unit_price: catalogProduct.unit_price,
        stripe_price_id: catalogProduct.stripe_price_id,
      };
    });

    // Calculate subtotal
    const subtotal = lineItems.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );

    // Create outbox job for Zoho Books quote creation
    const jobPayload = {
      company_id: company.company_id,
      company_name: company.company_name,
      zoho_account_id: company.zoho_account_id,
      line_items: lineItems,
      subtotal,
      discount_request: discount_request || null,
      notes: notes || null,
    };

    const { data: job, error: jobError } = await supabase
      .from('outbox')
      .insert({
        job_type: 'zoho_create_quote',
        status: 'pending',
        payload: jobPayload,
      })
      .select('job_id')
      .single();

    if (jobError || !job) {
      console.error('[quotes-create] Error creating outbox job:', jobError);
      return NextResponse.json(
        { error: 'Failed to enqueue quote creation job' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      job_id: job.job_id,
      line_items: lineItems,
      subtotal,
    });
  } catch (err) {
    console.error('[quotes-create] Unexpected error:', err);
    const errorMessage = err instanceof Error ? err.message : 'Internal server error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
