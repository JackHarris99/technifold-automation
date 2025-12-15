/**
 * Actions Panel
 * Quick action buttons for company management
 */

'use client';

import Link from 'next/link';

interface ActionsPanelProps {
  companyId: string;
}

export default function ActionsPanel({ companyId }: ActionsPanelProps) {
  return (
    <div className="flex items-center gap-3">
      <Link
        href={`/admin/test-reorder-link?company_id=${companyId}`}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"
      >
        Generate Reorder Link
      </Link>

      <Link
        href={`/admin/quote-builder?company_id=${companyId}`}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition-colors"
      >
        Create Quote
      </Link>

      <Link
        href={`/admin/invoices/new?company_id=${companyId}`}
        className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-semibold transition-colors"
      >
        Create Invoice
      </Link>
    </div>
  );
}
