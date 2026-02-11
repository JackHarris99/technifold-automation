/**
 * Orders Page Client Component
 * Tabbed interface for invoices and pending orders
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PendingOrdersClient from './PendingOrdersClient';

interface Invoice {
  invoice_id: string;
  invoice_number: string | null;
  invoice_date: string | null;
  total_amount: number;
  currency: string;
  status: string;
  payment_status: string | null;
  invoice_url: string | null;
  invoice_pdf_url: string | null;
  paid_at: string | null;
  created_at: string;
}

interface OrderItem {
  product_code: string;
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  order_id: string;
  po_number: string | null;
  created_at: string;
  status: string;
  subtotal: number;
  predicted_shipping: number;
  vat_amount: number;
  total_amount: number;
  currency: string;
  shipping_address_line_1: string | null;
  shipping_city: string | null;
  shipping_postal_code: string | null;
  shipping_country: string | null;
  items: OrderItem[];
}

interface Props {
  invoices: Invoice[];
  pendingOrders: Order[];
  userName: string;
}

type Tab = 'invoices' | 'pending';

export default function OrdersPageClient({ invoices, pendingOrders, userName }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('invoices');

  const handleLogout = async () => {
    await fetch('/api/customer/auth/logout', { method: 'POST' });
    router.push('/customer/login');
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatCurrency = (amount: number, currency: string = 'GBP') => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  };

  const getStatusColor = (status: string, paymentStatus: string | null) => {
    if (paymentStatus === 'paid') return 'bg-green-100 text-green-800 border-green-200';
    if (status === 'void') return 'bg-gray-100 text-gray-800 border-gray-200';
    if (status === 'draft') return 'bg-blue-100 text-blue-800 border-blue-200';
    return 'bg-amber-100 text-amber-800 border-amber-200';
  };

  const getStatusLabel = (status: string, paymentStatus: string | null) => {
    if (paymentStatus === 'paid') return 'Paid';
    if (status === 'void') return 'Voided';
    if (status === 'draft') return 'Draft';
    return 'Unpaid';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b border-[#e8e8e8]">
        <div className="max-w-[1600px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <div className="relative h-10 w-32">
                <Image
                  src="https://pziahtfkagyykelkxmah.supabase.co/storage/v1/object/public/media/media/site/technifold.png"
                  alt="Technifold"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <nav className="flex items-center gap-6">
                <a
                  href="/customer/portal"
                  className="text-sm font-semibold text-[#666] hover:text-[#0a0a0a] transition-colors"
                >
                  Reorder
                </a>
                <a
                  href="/customer/orders"
                  className="text-sm font-semibold text-blue-600 border-b-2 border-blue-600 pb-1"
                >
                  Order History
                </a>
                <a
                  href="/customer/addresses"
                  className="text-sm font-semibold text-[#666] hover:text-[#0a0a0a] transition-colors"
                >
                  Addresses
                </a>
              </nav>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-[#666]">
                Welcome, <strong>{userName}</strong>
              </span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-semibold text-[#666] hover:text-[#0a0a0a] hover:bg-gray-100 rounded-lg transition-all"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1200px] mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#0a0a0a] mb-2">Orders & Invoices</h1>
          <p className="text-[#666]">Track your pending orders and view past invoices</p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex gap-8">
              <button
                onClick={() => setActiveTab('invoices')}
                className={`pb-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'invoices'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-[#666] hover:text-[#0a0a0a] hover:border-gray-300'
                }`}
              >
                Invoices
                {invoices.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                    {invoices.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('pending')}
                className={`pb-4 px-1 border-b-2 font-semibold text-sm transition-colors ${
                  activeTab === 'pending'
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-[#666] hover:text-[#0a0a0a] hover:border-gray-300'
                }`}
              >
                Pending Orders
                {pendingOrders.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-xs font-semibold">
                    {pendingOrders.length}
                  </span>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'invoices' && (
          <>
            {invoices.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-[#0a0a0a] mb-2">No Invoices Yet</h2>
                <p className="text-[#666] mb-6">Your invoices will appear here once orders are approved.</p>
                <a
                  href="/customer/portal"
                  className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
                >
                  Browse Products
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.invoice_id}
                    className="bg-white rounded-2xl shadow-sm border border-[#e8e8e8] p-6 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      {/* Invoice Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-[#0a0a0a]">
                            {invoice.invoice_number || `Invoice ${invoice.invoice_id.substring(0, 8)}`}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                              invoice.status,
                              invoice.payment_status
                            )}`}
                          >
                            {getStatusLabel(invoice.status, invoice.payment_status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-6 text-sm text-[#666]">
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(invoice.invoice_date || invoice.created_at)}</span>
                          </div>
                          {invoice.paid_at && (
                            <div className="flex items-center gap-2 text-green-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span>Paid {formatDate(invoice.paid_at)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right mr-6">
                        <div className="text-2xl font-bold text-[#0a0a0a]">
                          {formatCurrency(invoice.total_amount, invoice.currency)}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3">
                        {invoice.invoice_pdf_url && (
                          <a
                            href={invoice.invoice_pdf_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold text-sm transition-all"
                          >
                            📄 Download PDF
                          </a>
                        )}
                        {invoice.invoice_url && invoice.payment_status !== 'paid' && (
                          <a
                            href={invoice.invoice_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm transition-all"
                          >
                            Pay Now
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {activeTab === 'pending' && <PendingOrdersClient orders={pendingOrders} />}
      </div>
    </div>
  );
}
