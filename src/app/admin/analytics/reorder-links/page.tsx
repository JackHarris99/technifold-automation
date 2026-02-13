/**
 * Reorder Link Analytics Dashboard
 * Track performance of consumable reorder email campaigns
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface AnalyticsData {
  emails_sent: number;
  link_clicks: number;
  orders_placed: number;
  conversion_rate: number;
  recent_clicks: Array<{
    contact_name: string;
    company_name: string;
    clicked_at: string;
    ordered: boolean;
  }>;
}

export default function ReorderLinkAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30'); // days

  useEffect(() => {
    loadAnalytics();
  }, [dateRange]);

  async function loadAnalytics() {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics/reorder-links?days=${dateRange}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-700">Loading analytics...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8">
        <div className="text-center text-gray-700">Failed to load analytics</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reorder Link Analytics</h1>
            <p className="text-gray-700 mt-1">Track performance of consumable reorder email campaigns</p>
          </div>

          {/* Date Range Selector */}
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="365">Last year</option>
          </select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-700 mb-1">Emails Sent</div>
          <div className="text-3xl font-bold text-gray-900">{data.emails_sent}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-700 mb-1">Link Clicks</div>
          <div className="text-3xl font-bold text-blue-600">{data.link_clicks}</div>
          <div className="text-xs text-gray-700 mt-1">
            {data.emails_sent > 0
              ? `${((data.link_clicks / data.emails_sent) * 100).toFixed(1)}% click rate`
              : 'N/A'}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-700 mb-1">Orders Placed</div>
          <div className="text-3xl font-bold text-green-600">{data.orders_placed}</div>
          <div className="text-xs text-gray-700 mt-1">
            {data.link_clicks > 0
              ? `${((data.orders_placed / data.link_clicks) * 100).toFixed(1)}% of clicks`
              : 'N/A'}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="text-sm text-gray-700 mb-1">Conversion Rate</div>
          <div className="text-3xl font-bold text-purple-600">{data.conversion_rate.toFixed(1)}%</div>
          <div className="text-xs text-gray-700 mt-1">Email → Order</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-900">Recent Link Clicks</h2>
        </div>

        {data.recent_clicks.length === 0 ? (
          <div className="p-8 text-center text-gray-700">
            No link clicks in this time period
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Clicked At</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Ordered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {data.recent_clicks.map((click, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{click.contact_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{click.company_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {new Date(click.clicked_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {click.ordered ? (
                        <span className="px-2 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded">
                          ✓ Ordered
                        </span>
                      ) : (
                        <span className="px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-700 rounded">
                          No order
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
