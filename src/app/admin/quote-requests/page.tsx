/**
 * Quote Requests Dashboard
 * /admin/quote-requests - View and manage all quote requests
 */

import { getSupabaseClient } from '@/lib/supabase';
import QuoteRequestsTable from '@/components/admin/QuoteRequestsTable';
import Link from 'next/link';

export default async function QuoteRequestsPage() {
  const supabase = getSupabaseClient();

  // Fetch all quote requests with related data
  const { data: quoteRequests } = await supabase
    .from('quote_requests')
    .select(`
      *,
      companies:company_id (
        company_id,
        company_name,
        country
      ),
      contacts:contact_id (
        contact_id,
        email,
        full_name,
        first_name
      )
    `)
    .order('created_at', { ascending: false });

  const requests = quoteRequests || [];

  // Count by status
  const statusCounts = {
    requested: requests.filter(r => r.status === 'requested').length,
    quote_sent: requests.filter(r => r.status === 'quote_sent').length,
    won: requests.filter(r => r.status === 'won').length,
    lost: requests.filter(r => ['lost', 'too_soon', 'not_ready', 'too_expensive'].includes(r.status)).length,
  };

  return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Quote Requests
              </h1>
              <p className="text-gray-600">
                Track leads, build quotes, and close deals
              </p>
            </div>
            <Link
              href="/admin"
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              ← Back to Admin
            </Link>
          </div>

          {/* Status Overview */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-yellow-600">{statusCounts.requested}</div>
              <div className="text-sm text-gray-600">New Requests</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-blue-600">{statusCounts.quote_sent}</div>
              <div className="text-sm text-gray-600">Quotes Sent</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-green-600">{statusCounts.won}</div>
              <div className="text-sm text-gray-600">Won</div>
            </div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="text-2xl font-bold text-red-600">{statusCounts.lost}</div>
              <div className="text-sm text-gray-600">Lost</div>
            </div>
          </div>
        </div>

        {/* Quote Requests Table */}
        <QuoteRequestsTable initialData={requests} />
      </div>
    </div>
  );
}
