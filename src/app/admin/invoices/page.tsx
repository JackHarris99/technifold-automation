/**
 * Invoice List
 * View and manage all invoices
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';

interface Invoice {
  invoice_id: string;
  company_id: string;
  invoice_number: string | null;
  total_amount: number;
  payment_status: 'paid' | 'unpaid' | 'void';
  invoice_date: string;
  invoice_url: string | null;
  company_name?: string;
}

export default async function InvoicesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();
  const isDirector = currentUser.role === 'director';

  // Get company IDs for territory filtering
  let companyIds: string[] = [];
  if (!isDirector && currentUser.sales_rep_id) {
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
      invoice_url
    `)
    .order('invoice_date', { ascending: false })
    .limit(100);

  // Territory filter for non-directors
  if (!isDirector && companyIds.length > 0) {
    invoicesQuery = invoicesQuery.in('company_id', companyIds);
  } else if (!isDirector && companyIds.length === 0) {
    // Non-director with no companies - show nothing
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

  // Group by status for summary
  const unpaidInvoices = enrichedInvoices.filter(inv => inv.payment_status === 'unpaid');
  const paidInvoices = enrichedInvoices.filter(inv => inv.payment_status === 'paid');
  const unpaidTotal = unpaidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const paidTotal = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Invoices</h1>
              <p className="text-sm text-gray-600 mt-1">
                {isDirector ? 'All Territories' : 'My Territory'}
              </p>
            </div>
            <Link
              href="/admin/invoices/new"
              className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold text-sm shadow-sm"
            >
              + Create Invoice
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white border border-gray-200 border-l-4 border-l-orange-500 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">Unpaid</div>
            <div className="text-2xl font-bold text-gray-900">
              £{unpaidTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-500">{unpaidInvoices.length} invoice{unpaidInvoices.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="bg-white border border-gray-200 border-l-4 border-l-green-500 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">Paid (last 100)</div>
            <div className="text-2xl font-bold text-gray-900">
              £{paidTotal.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-sm text-gray-500">{paidInvoices.length} invoice{paidInvoices.length !== 1 ? 's' : ''}</div>
          </div>
          <div className="bg-white border border-gray-200 border-l-4 border-l-blue-500 rounded-lg p-5">
            <div className="text-sm text-gray-600 mb-1">Total Shown</div>
            <div className="text-2xl font-bold text-gray-900">
              {enrichedInvoices.length}
            </div>
            <div className="text-sm text-gray-500">invoices</div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">Error loading invoices: {error.message}</p>
          </div>
        )}

        {/* Invoice Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Invoice</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Company</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Amount</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {enrichedInvoices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-500">
                      No invoices found
                    </td>
                  </tr>
                )}
                {enrichedInvoices.map((invoice) => (
                  <tr key={invoice.invoice_id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-mono text-sm text-gray-900">
                        {invoice.invoice_number || invoice.invoice_id.slice(0, 8)}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Link
                        href={`/admin/company/${invoice.company_id}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {invoice.company_name}
                      </Link>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(invoice.invoice_date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="py-3 px-4 text-right font-semibold text-gray-900">
                      £{invoice.total_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        invoice.payment_status === 'paid'
                          ? 'bg-green-100 text-green-700'
                          : invoice.payment_status === 'void'
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}>
                        {invoice.payment_status === 'paid' ? 'Paid' : invoice.payment_status === 'void' ? 'Void' : 'Unpaid'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {invoice.invoice_url && (
                        <a
                          href={invoice.invoice_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          View →
                        </a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/admin/sales" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Sales Center
          </Link>
        </div>
      </div>
    </div>
    </AdminLayout>
  );
}
