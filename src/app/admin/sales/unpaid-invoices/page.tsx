/**
 * Full List: Unpaid Invoices
 * Shows all unpaid invoices with totals and age
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';

interface UnpaidInvoice {
  invoice_id: string;
  company_id: string;
  company_name: string;
  total_amount: number;
  invoice_date: string;
  invoice_url: string | null;
  days_old: number;
}

export default async function UnpaidInvoicesPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();
  const isDirector = currentUser.role === 'director';

  // Get companies in territory
  let companiesQuery = supabase
    .from('companies')
    .select('company_id, company_name');

  if (!isDirector && currentUser.sales_rep_id) {
    companiesQuery = companiesQuery.eq('account_owner', currentUser.sales_rep_id);
  }

  const { data: companies } = await companiesQuery;
  const companyIds = companies?.map(c => c.company_id) || [];
  const companyMap = new Map(companies?.map(c => [c.company_id, c.company_name]) || []);

  let unpaidInvoices: UnpaidInvoice[] = [];
  let totalUnpaid = 0;

  if (companyIds.length > 0) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('invoice_id, company_id, total_amount, invoice_date, invoice_url')
      .in('company_id', companyIds)
      .eq('payment_status', 'unpaid')
      .order('invoice_date', { ascending: true });

    unpaidInvoices = (invoices || []).map(inv => ({
      invoice_id: inv.invoice_id,
      company_id: inv.company_id,
      company_name: companyMap.get(inv.company_id) || 'Unknown Company',
      total_amount: inv.total_amount || 0,
      invoice_date: inv.invoice_date,
      invoice_url: inv.invoice_url,
      days_old: Math.floor((Date.now() - new Date(inv.invoice_date).getTime()) / (1000 * 60 * 60 * 24)),
    }));

    totalUnpaid = unpaidInvoices.reduce((sum, inv) => sum + inv.total_amount, 0);
  }

  // Group by age
  const overdue30 = unpaidInvoices.filter(i => i.days_old >= 30);
  const overdue14 = unpaidInvoices.filter(i => i.days_old >= 14 && i.days_old < 30);
  const recent = unpaidInvoices.filter(i => i.days_old < 14);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link
                  href="/admin/sales"
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Sales Center
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Unpaid Invoices
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {unpaidInvoices.length} unpaid invoice{unpaidInvoices.length !== 1 ? 's' : ''} totalling{' '}
                <span className="font-bold text-orange-600">
                  £{totalUnpaid.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {unpaidInvoices.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">💰</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">All Invoices Paid!</h2>
            <p className="text-gray-600">No outstanding invoices in your territory.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Overdue 30+ days */}
            {overdue30.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  Overdue 30+ days ({overdue30.length}) - £{overdue30.reduce((s, i) => s + i.total_amount, 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
                  {overdue30.map((invoice) => (
                    <InvoiceRow key={invoice.invoice_id} invoice={invoice} urgency="overdue" />
                  ))}
                </div>
              </div>
            )}

            {/* Overdue 14-29 days */}
            {overdue14.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  Overdue 14-29 days ({overdue14.length}) - £{overdue14.reduce((s, i) => s + i.total_amount, 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-orange-200 overflow-hidden">
                  {overdue14.map((invoice) => (
                    <InvoiceRow key={invoice.invoice_id} invoice={invoice} urgency="warning" />
                  ))}
                </div>
              </div>
            )}

            {/* Recent (under 14 days) */}
            {recent.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                  Recent (under 14 days) ({recent.length}) - £{recent.reduce((s, i) => s + i.total_amount, 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {recent.map((invoice) => (
                    <InvoiceRow key={invoice.invoice_id} invoice={invoice} urgency="recent" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </AdminLayout>
  );
}

function InvoiceRow({ invoice, urgency }: { invoice: UnpaidInvoice; urgency: 'overdue' | 'warning' | 'recent' }) {
  const hoverColors = {
    overdue: 'hover:bg-red-50',
    warning: 'hover:bg-orange-50',
    recent: 'hover:bg-gray-50',
  };

  const badgeColors = {
    overdue: 'bg-red-100 text-red-700',
    warning: 'bg-orange-100 text-orange-700',
    recent: 'bg-gray-100 text-gray-700',
  };

  return (
    <div
      className={`flex items-center justify-between p-4 ${hoverColors[urgency]} transition-colors border-b border-gray-100 last:border-b-0`}
    >
      <div className="flex-1">
        <Link
          href={`/admin/company/${invoice.company_id}`}
          className="font-semibold text-gray-900 hover:text-blue-600"
        >
          {invoice.company_name}
        </Link>
        <p className="text-sm text-gray-500">
          Invoice #{invoice.invoice_id.slice(-8)} • {new Date(invoice.invoice_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <span className="font-bold text-gray-900 text-lg">
          £{invoice.total_amount.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
        </span>
        <span className={`px-3 py-1 rounded-full text-sm font-bold ${badgeColors[urgency]}`}>
          {invoice.days_old}d old
        </span>
        {invoice.invoice_url && (
          <a
            href={invoice.invoice_url}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200"
          >
            View Invoice
          </a>
        )}
      </div>
    </div>
  );
}
