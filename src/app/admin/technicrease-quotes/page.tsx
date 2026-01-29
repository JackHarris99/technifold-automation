/**
 * TechniCrease Quotes Pending Approval
 * Shows all TechniCrease quotes awaiting admin approval
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function TechnicreaseQuotesPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Get all quotes requiring approval (pending or all)
  const { data: quotes, error } = await supabase
    .from('quotes')
    .select(`
      quote_id,
      company_id,
      contact_id,
      status,
      approval_status,
      total_amount,
      currency,
      created_at,
      accepted_at,
      expires_at,
      companies!inner(company_name),
      contacts!inner(full_name, email)
    `)
    .eq('requires_approval', true)
    .order('created_at', { ascending: false });

  const pendingQuotes = quotes?.filter(q => q.approval_status === 'pending_approval') || [];
  const approvedQuotes = quotes?.filter(q => q.approval_status === 'approved') || [];
  const rejectedQuotes = quotes?.filter(q => q.approval_status === 'rejected') || [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TechniCrease Quotes</h1>
          <p className="text-gray-600">Review and approve TechniCrease system quotes</p>
        </div>

        {/* Pending Approval Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Pending Approval ({pendingQuotes.length})
            </h2>
          </div>
          <div className="p-6">
            {pendingQuotes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No quotes pending approval</p>
            ) : (
              <div className="space-y-4">
                {pendingQuotes.map((quote: any) => (
                  <Link
                    key={quote.quote_id}
                    href={`/admin/technicrease-quotes/${quote.quote_id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-orange-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{quote.companies.company_name}</h3>
                        <p className="text-sm text-gray-600">{quote.contacts.full_name} • {quote.contacts.email}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Accepted: {new Date(quote.accepted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          £{quote.total_amount.toLocaleString('en-GB')}
                        </div>
                        <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full mt-2">
                          Pending Review
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Approved Section */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Approved ({approvedQuotes.length})
            </h2>
          </div>
          <div className="p-6">
            {approvedQuotes.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No approved quotes</p>
            ) : (
              <div className="space-y-4">
                {approvedQuotes.map((quote: any) => (
                  <Link
                    key={quote.quote_id}
                    href={`/admin/quotes/${quote.quote_id}`}
                    className="block border border-gray-200 rounded-lg p-4 hover:border-green-500 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{quote.companies.company_name}</h3>
                        <p className="text-sm text-gray-600">{quote.contacts.full_name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          Approved: {new Date(quote.accepted_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          £{quote.total_amount.toLocaleString('en-GB')}
                        </div>
                        <span className="inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full mt-2">
                          Approved
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
