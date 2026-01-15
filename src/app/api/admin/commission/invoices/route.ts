/**
 * GET /api/admin/commission/invoices
 * Returns detailed per-invoice commission breakdown for current month
 * Sales reps see only their own invoices
 */

import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';

interface InvoiceItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  product_type: string | null;
  commission: number;
}

interface InvoiceDetail {
  invoice_id: string;
  invoice_number: string | null;
  invoice_date: string;
  company_id: string;
  company_name: string;
  invoice_url: string | null;
  subtotal: number;
  tools_revenue: number;
  tools_commission: number;
  consumables_revenue: number;
  consumables_commission: number;
  total_commission: number;
  items: InvoiceItem[];
}

export async function GET(request: NextRequest) {
  try {
    // SECURITY: Require authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const supabase = getSupabaseClient();

    // Get current month boundaries
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const firstDayOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Fetch invoices with line items for current month
    const { data: invoiceItems, error: fetchError } = await supabase
      .from('invoice_items')
      .select(`
        invoice_id,
        product_code,
        description,
        quantity,
        unit_price,
        line_total,
        invoices!inner (
          invoice_id,
          invoice_number,
          invoice_date,
          company_id,
          subtotal,
          payment_status,
          invoice_url,
          companies!inner (
            company_id,
            company_name,
            account_owner
          )
        ),
        products (
          product_code,
          type
        )
      `)
      .gte('invoices.invoice_date', firstDayOfMonth.toISOString())
      .lt('invoices.invoice_date', firstDayOfNextMonth.toISOString())
      .eq('invoices.payment_status', 'paid');

    if (fetchError) {
      console.error('[commission/invoices] Query error:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch invoices' },
        { status: 500 }
      );
    }

    if (!invoiceItems || invoiceItems.length === 0) {
      return NextResponse.json({
        month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
        invoices: [],
        summary: {
          total_invoices: 0,
          total_commission: 0,
          total_tools_commission: 0,
          total_consumables_commission: 0,
        },
      });
    }

    // Group by invoice
    const invoicesMap = new Map<string, InvoiceDetail>();

    for (const item of invoiceItems as any[]) {
      const invoice = item.invoices;
      if (!invoice) continue;

      const company = invoice.companies;
      if (!company) continue;

      // SECURITY: Filter by account owner (only show invoices for assigned customers)
      if (company.account_owner !== user.sales_rep_id) {
        continue;
      }

      // Calculate commission for this line item
      const productType = item.products?.type || 'other';
      let itemCommission = 0;

      if (productType === 'tool') {
        itemCommission = (item.line_total || 0) * 0.10; // 10%
      } else if (productType === 'consumable') {
        itemCommission = (item.line_total || 0) * 0.01; // 1%
      }

      // Get or create invoice entry
      if (!invoicesMap.has(invoice.invoice_id)) {
        invoicesMap.set(invoice.invoice_id, {
          invoice_id: invoice.invoice_id,
          invoice_number: invoice.invoice_number,
          invoice_date: invoice.invoice_date,
          company_id: company.company_id,
          company_name: company.company_name,
          invoice_url: invoice.invoice_url,
          subtotal: invoice.subtotal || 0,
          tools_revenue: 0,
          tools_commission: 0,
          consumables_revenue: 0,
          consumables_commission: 0,
          total_commission: 0,
          items: [],
        });
      }

      const invoiceDetail = invoicesMap.get(invoice.invoice_id)!;

      // Add to product type totals
      if (productType === 'tool') {
        invoiceDetail.tools_revenue += item.line_total || 0;
        invoiceDetail.tools_commission += itemCommission;
      } else if (productType === 'consumable') {
        invoiceDetail.consumables_revenue += item.line_total || 0;
        invoiceDetail.consumables_commission += itemCommission;
      }

      invoiceDetail.total_commission += itemCommission;

      // Add line item
      invoiceDetail.items.push({
        product_code: item.product_code,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        line_total: item.line_total,
        product_type: productType,
        commission: itemCommission,
      });
    }

    // Convert map to array and sort by date (newest first)
    const invoices = Array.from(invoicesMap.values()).sort(
      (a, b) => new Date(b.invoice_date).getTime() - new Date(a.invoice_date).getTime()
    );

    // Calculate summary
    const summary = {
      total_invoices: invoices.length,
      total_commission: invoices.reduce((sum, inv) => sum + inv.total_commission, 0),
      total_tools_commission: invoices.reduce((sum, inv) => sum + inv.tools_commission, 0),
      total_consumables_commission: invoices.reduce((sum, inv) => sum + inv.consumables_commission, 0),
    };

    return NextResponse.json({
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      invoices,
      summary,
    });

  } catch (err: any) {
    console.error('[commission/invoices] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
