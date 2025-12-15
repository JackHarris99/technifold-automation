/**
 * Subscriptions Section
 * Shows active and trial subscriptions with allocated tools
 */

'use client';

import Link from 'next/link';

interface Subscription {
  subscription_id: string;
  status: string;
  start_date: string;
  end_date?: string;
  billing_cycle: string;
  monthly_price: number;
  created_at: string;
  subscription_tools?: Array<{
    tool_code: string;
    added_at: string;
    products?: {
      description: string;
    };
  }>;
  contacts?: {
    full_name: string;
    email: string;
  };
}

interface SubscriptionsSectionProps {
  subscriptions: Subscription[];
}

export default function SubscriptionsSection({ subscriptions }: SubscriptionsSectionProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trial':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">
        Active Subscriptions ({subscriptions.length})
      </h2>

      {subscriptions.length === 0 ? (
        <p className="text-gray-600 text-sm">No active subscriptions</p>
      ) : (
        <div className="space-y-4">
          {subscriptions.map((sub) => (
            <Link
              key={sub.subscription_id}
              href={`/admin/subscriptions/${sub.subscription_id}`}
              className="block border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      Subscription #{sub.subscription_id.slice(0, 8)}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(sub.status)}`}>
                      {sub.status}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mt-1">
                    {sub.contacts?.full_name || 'No contact assigned'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    £{sub.monthly_price.toFixed(2)}/{sub.billing_cycle}
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-600 mb-3">
                Started: {new Date(sub.start_date).toLocaleDateString('en-GB')}
                {sub.end_date && (
                  <> • Ends: {new Date(sub.end_date).toLocaleDateString('en-GB')}</>
                )}
              </div>

              {sub.subscription_tools && sub.subscription_tools.length > 0 && (
                <div className="border-t border-gray-200 pt-3">
                  <div className="text-xs text-gray-600 mb-2">
                    Allocated Tools ({sub.subscription_tools.length}):
                  </div>
                  <div className="space-y-1">
                    {sub.subscription_tools.slice(0, 3).map((tool) => (
                      <div key={tool.tool_code} className="text-sm text-gray-700">
                        • {tool.products?.description || tool.tool_code}
                      </div>
                    ))}
                    {sub.subscription_tools.length > 3 && (
                      <div className="text-sm text-gray-500">
                        + {sub.subscription_tools.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
