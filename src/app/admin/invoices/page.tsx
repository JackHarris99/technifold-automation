/**
 * Invoice List
 * View and manage all invoices
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { cookies } from 'next/headers';
import InvoiceListClient from '@/components/admin/InvoiceListClient';

interface Invoice {
  invoice_id: string;
  company_id: string;
  invoice_number: string | null;
  total_amount: number;
  payment_status: 'paid' | 'unpaid' | 'void';
  invoice_date: string;
  invoice_url: string | null;
  stripe_invoice_id?: string | null;
  company_name?: string;
}

export default async function InvoicesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  // Get view mode from cookies
  const cookieStore = await cookies();
  const viewModeCookie = cookieStore.get('view_mode');
  const viewMode = viewModeCookie?.value === 'my_customers' ? 'my_customers' : 'all';

  const supabase = getSupabaseClient();

  // Get company IDs for filtering
  let companyIds: string[] = [];
  if (viewMode === 'my_customers' && currentUser.sales_rep_id) {
    const { data: companies } = await supabase
      .from('companies')
      .select('company_id')
      .eq('account_owner', currentUser.sales_rep_id);
    companyIds = companies?.map(c => c.company_id) || [];
  }

  // Fetch invoices
  let invoicesQuery = supabase
    .from('invoices')
    .select(`
      invoice_id,
      company_id,
      invoice_number,
      total_amount,
      payment_status,
      invoice_date,
      invoice_url,
      stripe_invoice_id
    `)
    .order('invoice_date', { ascending: false })
    .limit(100);

  // Apply "My Customers" filter
  if (viewMode === 'my_customers' && companyIds.length > 0) {
    invoicesQuery = invoicesQuery.in('company_id', companyIds);
  } else if (viewMode === 'my_customers' && companyIds.length === 0) {
    // My customers mode with no companies - show nothing
    invoicesQuery = invoicesQuery.eq('company_id', 'none');
  }

  const { data: invoices, error } = await invoicesQuery;

  // Fetch company names for invoices
  const uniqueCompanyIds = [...new Set((invoices || []).map(inv => inv.company_id))];
  const { data: companies } = await supabase
    .from('companies')
    .select('company_id, company_name')
    .in('company_id', uniqueCompanyIds);

  const companyMap = new Map(companies?.map(c => [c.company_id, c.company_name]) || []);

  // Enrich invoices with company names
  const enrichedInvoices: Invoice[] = (invoices || []).map(inv => ({
    ...inv,
    company_name: companyMap.get(inv.company_id) || 'Unknown Company',
  }));

  // Group by status for summary (exclude void invoices from calculations)
  const unpaidInvoices = enrichedInvoices.filter(inv => inv.payment_status === 'unpaid');
  const paidInvoices = enrichedInvoices.filter(inv => inv.payment_status === 'paid');
  const voidInvoices = enrichedInvoices.filter(inv => inv.payment_status === 'void');
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const paidTotal = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  return (
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="text-sm text-gray-800 mt-1">
                {viewMode === 'my_customers' ? 'My Customers Only' : 'All Companies (Team View)'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white border border-gray-200 border-l-4 border-l-orange-500 rounded-lg p-5">
            <div className="text-sm text-gray-800 mb-1">Unpaid</div>
            <div className="text-2xl font-bold text-gray-900">
              £{unpaidTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-700">{unpaidInvoices.length} invoice{unpaidInvoices.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="bg-white border border-gray-200 border-l-4 border-l-green-500 rounded-lg p-5">
            <div className="text-sm text-gray-800 mb-1">Paid (last 100)</div>
            <div className="text-2xl font-bold text-gray-900">
              £{paidTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-700">{paidInvoices.length} invoice{paidInvoices.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="bg-white border border-gray-200 border-l-4 border-l-gray-400 rounded-lg p-5">
            <div className="text-sm text-gray-800 mb-1">Void (excluded)</div>
            <div className="text-2xl font-bold text-gray-500">
              {voidInvoices.length}
            </div>
            <div className="text-sm text-gray-700">invoice{voidInvoices.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-lg p-5">
            <div className="text-sm text-gray-800 mb-1">Total Shown</div>
            <div className="text-2xl font-bold text-gray-900">
              {enrichedInvoices.length}
            </div>
            <div className="text-sm text-gray-700">invoices</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">Error loading invoices: {error.message}</p>
          </div>
        )}

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>Before importing invoices from Stripe:</strong> Link your companies to Stripe customers first.{' '}
            <Link href="/admin/companies/link-stripe" className="underline font-medium hover:text-blue-900">
              Link Companies to Stripe →
            </Link>
          </p>
        </div>

        {/* Invoice Table with Void Functionality */}
        <InvoiceListClient initialInvoices={enrichedInvoices} viewMode={viewMode} />

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/admin/sales" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Sales Center
          </Link>
        </div>
      </div>
    </div>
  );
}
