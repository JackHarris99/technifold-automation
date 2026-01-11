/**
 * Distributor Customer Detail Page
 * Shows customer info and order history
 */

import { getCurrentDistributor } from '@/lib/distributorAuth';
import { redirect } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase';
import Link from 'next/link';

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customer_id: string }>;
}) {
  const distributor = await getCurrentDistributor();

  if (!distributor) {
    redirect('/distributor/login');
  }

  const { customer_id } = await params;
  const supabase = getSupabaseClient();

  // Fetch customer details
  const { data: customer, error: customerError } = await supabase
    .from('companies')
    .select('*')
    .eq('company_id', customer_id)
    .eq('account_owner', distributor.account_owner)
    .single();

  if (customerError || !customer) {
    return (
      <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center">
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-8">
          <p className="text-[14px] text-red-800 font-[500]">Customer not found</p>
          <Link
            href="/distributor"
            className="mt-4 inline-block text-[13px] text-[#1e40af] font-[600] hover:text-[#1e3a8a]"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  // Fetch recent invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('invoice_id, invoice_number, invoice_date, total_amount, status')
    .eq('company_id', customer_id)
    .order('invoice_date', { ascending: false })
    .limit(20);

  return (
    <div className="min-h-screen bg-[#f8fafc]">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <div className="max-w-[1600px] mx-auto px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/distributor"
                className="text-[13px] text-[#475569] hover:text-[#1e40af] font-[500] transition-colors flex items-center gap-2 mb-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to Dashboard
              </Link>
              <h1 className="text-[32px] font-[700] text-[#0a0a0a] tracking-[-0.02em]">
                {customer.company_name}
              </h1>
              <p className="text-[15px] text-[#475569] font-[500] mt-2">
                Customer Details
              </p>
            </div>
            <Link
              href={`/distributor/order/${customer_id}`}
              className="px-6 py-3 bg-gradient-to-r from-[#1e40af] to-[#3b82f6] text-white rounded-[10px] text-[14px] font-[600] hover:from-[#1e3a8a] hover:to-[#2563eb] transition-all"
            >
              Place Order
            </Link>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-[1600px] mx-auto px-8 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Company Info */}
          <div className="col-span-4 space-y-6">
            <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
              <h2 className="text-[20px] font-[600] text-[#0a0a0a] mb-4 tracking-[-0.01em]">Company Information</h2>

              <div className="space-y-4">
                <div>
                  <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-1">Company ID</div>
                  <div className="text-[13px] text-[#0a0a0a] font-[500] font-mono">{customer.company_id}</div>
                </div>

                {customer.type && (
                  <div>
                    <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-1">Type</div>
                    <div className="text-[13px] text-[#0a0a0a] font-[500]">{customer.type}</div>
                  </div>
                )}

                {customer.country && (
                  <div>
                    <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-1">Country</div>
                    <div className="text-[13px] text-[#0a0a0a] font-[500]">{customer.country}</div>
                  </div>
                )}

                {customer.website && (
                  <div>
                    <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-1">Website</div>
                    <a href={customer.website} target="_blank" rel="noopener noreferrer" className="text-[13px] text-[#1e40af] font-[500] hover:text-[#1e3a8a]">
                      {customer.website}
                    </a>
                  </div>
                )}

                {customer.account_opened_at && (
                  <div>
                    <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-1">Customer Since</div>
                    <div className="text-[13px] text-[#0a0a0a] font-[500]">
                      {new Date(customer.account_opened_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Order History */}
          <div className="col-span-8">
            <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
              <div className="p-6 border-b border-[#e8e8e8]">
                <h2 className="text-[20px] font-[600] text-[#0a0a0a] mb-1 tracking-[-0.01em]">Order History</h2>
                <p className="text-[13px] text-[#334155] font-[400]">
                  {invoices?.length || 0} invoice{invoices?.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="p-6">
                {!invoices || invoices.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-[14px] text-[#475569] font-[400]">No orders yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {invoices.map((invoice) => (
                      <div
                        key={invoice.invoice_id}
                        className="p-4 bg-[#f8fafc] rounded-[12px] border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="text-[14px] font-[600] text-[#0a0a0a] font-mono">
                                {invoice.invoice_number}
                              </div>
                              {invoice.status && (
                                <div className={`px-2 py-1 rounded-[6px] text-[10px] font-[700] uppercase tracking-wide ${
                                  invoice.status === 'paid'
                                    ? 'bg-green-100 text-green-800'
                                    : invoice.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {invoice.status}
                                </div>
                              )}
                            </div>
                            <div className="text-[12px] text-[#475569] font-[500] mt-1">
                              {new Date(invoice.invoice_date).toLocaleDateString('en-GB', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-[17px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">
                              £{(invoice.total_amount || 0).toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
