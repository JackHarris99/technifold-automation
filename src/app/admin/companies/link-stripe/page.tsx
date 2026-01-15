/**
 * Link Companies to Stripe Customers
 * Review and confirm automatic matches
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import LinkStripeClient from '@/components/admin/LinkStripeClient';

export default async function LinkStripePage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Link Companies to Stripe</h1>
              <p className="text-sm text-gray-800 mt-1">
                Review and confirm automatic matches between your companies and Stripe customers
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <LinkStripeClient />

        {/* Back Link */}
        <div className="mt-8">
          <Link href="/admin/invoices" className="text-blue-600 hover:text-blue-800 font-medium">
            ← Back to Invoices
          </Link>
        </div>
      </div>
    </div>
  );
}
