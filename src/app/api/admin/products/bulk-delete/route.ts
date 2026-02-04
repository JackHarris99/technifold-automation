/**
 * Bulk Product Delete API
 * Permanently deletes multiple products from the database
 * Handles foreign key constraints by checking references first
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Check authorization - only allow admin users
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { product_codes } = body;

    if (!Array.isArray(product_codes) || product_codes.length === 0) {
      return NextResponse.json(
        { error: 'Invalid product_codes array' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseClient();

    // Check for references in invoice_items (blocks deletion to preserve historical data)
    const { data: invoiceRefs } = await supabase
      .from('invoice_items')
      .select('product_code')
      .in('product_code', product_codes);

    // Check for references in quote_items
    const { data: quoteRefs } = await supabase
      .from('quote_items')
      .select('product_code')
      .in('product_code', product_codes);

    const referencedInInvoices = new Set(invoiceRefs?.map(r => r.product_code) || []);
    const referencedInQuotes = new Set(quoteRefs?.map(r => r.product_code) || []);

    // Products that can't be deleted due to references
    const cannotDelete = product_codes.filter(code =>
      referencedInInvoices.has(code) || referencedInQuotes.has(code)
    );

    // Products that can be safely deleted
    const canDelete = product_codes.filter(code =>
      !referencedInInvoices.has(code) && !referencedInQuotes.has(code)
    );

    let deletedCount = 0;
    const errors: string[] = [];

    // Delete products that have no references
    if (canDelete.length > 0) {
      const { error, count } = await supabase
        .from('products')
        .delete()
        .in('product_code', canDelete);

      if (error) {
        console.error('Delete error for safe products:', error);
        errors.push(`Failed to delete ${canDelete.length} products: ${error.message}`);
      } else {
        deletedCount = count || canDelete.length;
      }
    }

    // Build detailed response
    const response: any = {
      deleted: deletedCount,
      skipped: cannotDelete.length,
      total: product_codes.length,
    };

    if (cannotDelete.length > 0) {
      const reasons: string[] = [];

      cannotDelete.forEach(code => {
        const reasons_list: string[] = [];
        if (referencedInInvoices.has(code)) reasons_list.push('used in invoices');
        if (referencedInQuotes.has(code)) reasons_list.push('used in quotes');
        reasons.push(`${code} (${reasons_list.join(', ')})`);
      });

      response.message = `✓ Deleted ${deletedCount} products. ⚠️ Skipped ${cannotDelete.length} products that are referenced in historical data:\n\n${reasons.join('\n')}`;
      response.skipped_products = cannotDelete;
    } else if (deletedCount > 0) {
      response.message = `✓ Successfully deleted ${deletedCount} products`;
    }

    if (errors.length > 0) {
      response.errors = errors;
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error('Bulk delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
