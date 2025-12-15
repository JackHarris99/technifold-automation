/**
 * Actions Panel
 * Quick action buttons for company management
 */

'use client';

import Link from 'next/link';
import { useState } from 'react';

interface ActionsPanelProps {
  companyId: string;
}

export default function ActionsPanel({ companyId }: ActionsPanelProps) {
  const [copiedReorderLink, setCopiedReorderLink] = useState(false);

  const handleCopyReorderLink = async () => {
    const reorderUrl = `${window.location.origin}/reorder/${companyId}`;
    await navigator.clipboard.writeText(reorderUrl);
    setCopiedReorderLink(true);
    setTimeout(() => setCopiedReorderLink(false), 2000);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleCopyReorderLink}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"
      >
        {copiedReorderLink ? '✓ Copied!' : 'Copy Reorder Link'}
      </button>

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
