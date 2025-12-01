/**
 * Pipeline Table - Filterable, actionable deal tracking
 * Shows all stages from email sent → won/lost
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';

interface QuoteRequest {
  quote_request_id: string;
  status: string;
  created_at: string;
  updated_at: string;
  estimated_value?: number;
  contact_again_date?: string;
  companies: {
    company_id: string;
    company_name: string;
  };
  contacts: {
    contact_id: string;
    full_name: string;
    email: string;
  };
}

interface PipelineTableProps {
  quoteRequests: QuoteRequest[];
}

export default function PipelineTable({ quoteRequests }: PipelineTableProps) {
  const [stageFilter, setStageFilter] = useState<string>('needs_action');

  // Calculate "needs action" logic
  const getNeedsAction = (qr: QuoteRequest) => {
    if (qr.status === 'requested') {
      const hoursSinceRequest = (Date.now() - new Date(qr.created_at).getTime()) / (1000 * 60 * 60);
      return hoursSinceRequest > 24;
    }
    if (qr.status === 'quote_sent') {
      const daysSinceSent = (Date.now() - new Date(qr.updated_at || qr.created_at).getTime()) / (1000 * 60 * 60 * 24);
      return daysSinceSent > 3;
    }
    if (qr.status === 'not_yet' && qr.contact_again_date) {
      return new Date(qr.contact_again_date) <= new Date();
    }
    return false;
  };

  // Filter quotes based on selected stage
  const filteredQuotes = quoteRequests.filter(qr => {
    if (stageFilter === 'needs_action') {
      return getNeedsAction(qr);
    }
    if (stageFilter === 'active') {
      return ['requested', 'quote_sent', 'not_yet'].includes(qr.status);
    }
    if (stageFilter === 'won') {
      return qr.status === 'won';
    }
    if (stageFilter === 'lost') {
      return ['lost', 'too_soon', 'not_ready', 'too_expensive'].includes(qr.status);
    }
    if (stageFilter === 'all') {
      return true;
    }
    return qr.status === stageFilter;
  });

  // Get stage label and color
  const getStageDisplay = (status: string) => {
    const stages: Record<string, { label: string; color: string }> = {
      requested: { label: 'Quote Requested', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
      quote_sent: { label: 'Quote Sent', color: 'bg-blue-100 text-blue-800 border-blue-300' },
      not_yet: { label: 'Not Yet', color: 'bg-purple-100 text-purple-800 border-purple-300' },
      won: { label: 'Won', color: 'bg-green-100 text-green-800 border-green-300' },
      lost: { label: 'Lost', color: 'bg-red-100 text-red-800 border-red-300' },
      too_soon: { label: 'Too Soon', color: 'bg-orange-100 text-orange-800 border-orange-300' },
      not_ready: { label: 'Not Ready', color: 'bg-orange-100 text-orange-800 border-orange-300' },
      too_expensive: { label: 'Too Expensive', color: 'bg-orange-100 text-orange-800 border-orange-300' },
    };
    return stages[status] || { label: status, color: 'bg-gray-100 text-gray-800 border-gray-300' };
  };

  // Calculate days in stage
  const getDaysInStage = (qr: QuoteRequest) => {
    const stageDate = qr.updated_at || qr.created_at;
    const days = Math.floor((Date.now() - new Date(stageDate).getTime()) / (1000 * 60 * 60 * 24));
    return days;
  };

  return (
    <div>
      {/* Stage Filter */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setStageFilter('needs_action')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            stageFilter === 'needs_action'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          🎯 Needs Action ({quoteRequests.filter(qr => getNeedsAction(qr)).length})
        </button>
        <button
          onClick={() => setStageFilter('active')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            stageFilter === 'active'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Active Deals ({quoteRequests.filter(qr => ['requested', 'quote_sent', 'not_yet'].includes(qr.status)).length})
        </button>
        <button
          onClick={() => setStageFilter('won')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            stageFilter === 'won'
              ? 'bg-green-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ✅ Won ({quoteRequests.filter(qr => qr.status === 'won').length})
        </button>
        <button
          onClick={() => setStageFilter('lost')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            stageFilter === 'lost'
              ? 'bg-red-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          ❌ Lost ({quoteRequests.filter(qr => ['lost', 'too_soon', 'not_ready', 'too_expensive'].includes(qr.status)).length})
        </button>
        <button
          onClick={() => setStageFilter('all')}
          className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-colors ${
            stageFilter === 'all'
              ? 'bg-gray-700 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({quoteRequests.length})
        </button>
      </div>

      {/* Pipeline Table */}
      {filteredQuotes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600 text-lg">No deals in this stage</p>
          <p className="text-gray-500 text-sm mt-2">Great work keeping your pipeline clean!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredQuotes.map(qr => {
            const stageDisplay = getStageDisplay(qr.status);
            const daysInStage = getDaysInStage(qr);
            const needsAction = getNeedsAction(qr);

            return (
              <div
                key={qr.quote_request_id}
                className={`p-4 border-2 rounded-lg transition-colors ${
                  needsAction
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Company & Contact Info */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/admin/company/${qr.companies.company_id}`}
                      className="font-bold text-gray-900 hover:text-blue-600"
                    >
                      {qr.companies.company_name}
                    </Link>
                    <div className="text-sm text-gray-600">
                      {qr.contacts.full_name} • {qr.contacts.email}
                    </div>
                    {qr.estimated_value && (
                      <div className="text-sm text-gray-900 font-semibold mt-1">
                        Est. Value: £{qr.estimated_value.toFixed(2)}
                      </div>
                    )}
                  </div>

                  {/* Middle: Stage & Days */}
                  <div className="flex flex-col items-center gap-2">
                    <span className={`px-3 py-1 rounded-lg text-sm font-semibold border-2 ${stageDisplay.color}`}>
                      {stageDisplay.label}
                    </span>
                    <span className="text-xs text-gray-500">
                      {daysInStage} {daysInStage === 1 ? 'day' : 'days'} in stage
                    </span>
                    {qr.status === 'not_yet' && qr.contact_again_date && (
                      <span className="text-xs text-purple-700 font-semibold">
                        Contact: {new Date(qr.contact_again_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {/* Right: Action Buttons */}
                  <div className="flex flex-col gap-2">
                    {qr.status === 'requested' && (
                      <Link
                        href={`/admin/quote-builder-v2?request_id=${qr.quote_request_id}`}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 text-center whitespace-nowrap"
                      >
                        Send Quote
                      </Link>
                    )}
                    {(qr.status === 'quote_sent' || qr.status === 'not_yet') && (
                      <>
                        <button
                          className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 whitespace-nowrap"
                        >
                          Mark Won
                        </button>
                        <button
                          className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 whitespace-nowrap"
                        >
                          Mark Lost
                        </button>
                      </>
                    )}
                    <Link
                      href={`/admin/company/${qr.companies.company_id}`}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 text-center whitespace-nowrap"
                    >
                      View Details
                    </Link>
                  </div>
                </div>

                {/* Warning for needs action */}
                {needsAction && (
                  <div className="mt-3 p-2 bg-red-100 border border-red-300 rounded text-sm text-red-800 font-semibold">
                    ⚠️ This deal needs your attention!
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
