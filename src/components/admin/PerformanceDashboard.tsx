/**
 * Performance Dashboard Client Component
 * Fetches and displays commission and activity data
 */

'use client';

import { useEffect, useState } from 'react';

interface CommissionData {
  month: string;
  commission_breakdown: {
    tools: { revenue: number; commission: number; rate: number };
    consumables: { revenue: number; commission: number; rate: number; note: string };
    subscriptions: { revenue: number; commission: number; rate: number; note?: string };
  };
  total_commission: number;
  invoices_closed: number;
  activities: {
    calls: number;
    visits: number;
    quotes_sent: number;
    emails: number;
    followups: number;
    meetings: number;
  };
  top_products: Array<{
    product_code: string;
    name: string;
    units: number;
    revenue: number;
  }>;
}

interface TeamActivitiesData {
  month: string;
  reps: Array<{
    rep_id: string;
    full_name: string;
    activities: {
      calls: number;
      visits: number;
      quotes_sent: number;
      emails: number;
      followups: number;
      meetings: number;
    };
  }>;
}

export default function PerformanceDashboard() {
  const [commissionData, setCommissionData] = useState<CommissionData | null>(null);
  const [teamData, setTeamData] = useState<TeamActivitiesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [commissionRes, teamRes] = await Promise.all([
          fetch('/api/admin/commission/current'),
          fetch('/api/admin/commission/team-activities'),
        ]);

        if (!commissionRes.ok || !teamRes.ok) {
          throw new Error('Failed to fetch performance data');
        }

        const commission = await commissionRes.json();
        const team = await teamRes.json();

        setCommissionData(commission);
        setTeamData(team);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-700">Loading performance data...</div>
      </div>
    );
  }

  if (error || !commissionData || !teamData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">Error loading data: {error}</p>
      </div>
    );
  }

  // Calculate month progress
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const currentDay = now.getDate();
  const monthProgress = (currentDay / daysInMonth) * 100;

  // Get current user's activities for ranking
  const currentUserActivities = commissionData.activities;

  // Calculate rankings
  function getRanking(metric: keyof typeof currentUserActivities) {
    const sorted = [...teamData.reps]
      .map((rep) => rep.activities[metric])
      .sort((a, b) => b - a);
    const myValue = currentUserActivities[metric];
    const rank = sorted.indexOf(myValue) + 1;
    return { rank, total: teamData.reps.length };
  }

  const callsRanking = getRanking('calls');
  const visitsRanking = getRanking('visits');
  const quotesRanking = getRanking('quotes_sent');

  return (
    <div className="space-y-6">
      {/* Commission Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">💰 Commission This Month</h2>

        <div className="space-y-4">
          {/* Tools */}
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900">🔧 Tool Sales</div>
              <div className="text-xs text-gray-700 mt-1">
                £{commissionData.commission_breakdown.tools.revenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })} @ 10%
              </div>
            </div>
            <div className="text-xl font-bold text-blue-900">
              £{commissionData.commission_breakdown.tools.commission.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Consumables */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900">📦 Consumables (Your Customers)</div>
              <div className="text-xs text-gray-700 mt-1">
                £{commissionData.commission_breakdown.consumables.revenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })} @ 1%
              </div>
            </div>
            <div className="text-xl font-bold text-green-900">
              £{commissionData.commission_breakdown.consumables.commission.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Subscriptions */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <div className="text-sm font-medium text-gray-900">🔄 Subscriptions</div>
              <div className="text-xs text-gray-700 mt-1">
                {commissionData.commission_breakdown.subscriptions.note}
              </div>
            </div>
            <div className="text-xl font-bold text-gray-500">
              £0.00
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-200 pt-4">
            <div className="flex items-center justify-between">
              <div className="text-lg font-bold text-gray-900">TOTAL COMMISSION</div>
              <div className="text-3xl font-bold text-orange-600">
                £{commissionData.total_commission.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="text-sm text-gray-700 mt-2">
              {commissionData.invoices_closed} invoice{commissionData.invoices_closed !== 1 ? 's' : ''} paid this month
            </div>
          </div>

          {/* Month Progress */}
          <div>
            <div className="flex items-center justify-between text-sm text-gray-700 mb-2">
              <span>Month Progress</span>
              <span>{currentDay} / {daysInMonth} days ({Math.round(monthProgress)}%)</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full transition-all"
                style={{ width: `${monthProgress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">📊 Activity Metrics</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Calls */}
          <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
            <div className="text-3xl mb-2">📞</div>
            <div className="text-3xl font-bold text-gray-900">{currentUserActivities.calls}</div>
            <div className="text-sm text-gray-700 mt-1">Calls Made</div>
            <div className="text-xs font-bold text-orange-700 mt-2">
              {callsRanking.rank === 1 ? '🥇 #1 in team' : `#${callsRanking.rank} in team`}
            </div>
          </div>

          {/* Visits */}
          <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
            <div className="text-3xl mb-2">🚗</div>
            <div className="text-3xl font-bold text-gray-900">{currentUserActivities.visits}</div>
            <div className="text-sm text-gray-700 mt-1">Customer Visits</div>
            <div className="text-xs font-bold text-blue-700 mt-2">
              {visitsRanking.rank === 1 ? '🥇 #1 in team' : `#${visitsRanking.rank} in team`}
            </div>
          </div>

          {/* Quotes */}
          <div className="p-4 border-2 border-purple-200 rounded-lg bg-purple-50">
            <div className="text-3xl mb-2">✉️</div>
            <div className="text-3xl font-bold text-gray-900">{currentUserActivities.quotes_sent}</div>
            <div className="text-sm text-gray-700 mt-1">Quotes Sent</div>
            <div className="text-xs font-bold text-purple-700 mt-2">
              {quotesRanking.rank === 1 ? '🥇 #1 in team' : `#${quotesRanking.rank} in team`}
            </div>
          </div>
        </div>

        {/* Other Activities */}
        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{currentUserActivities.emails}</div>
            <div className="text-xs text-gray-700 mt-1">Emails</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{currentUserActivities.followups}</div>
            <div className="text-xs text-gray-700 mt-1">Follow-ups</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-gray-900">{currentUserActivities.meetings}</div>
            <div className="text-xs text-gray-700 mt-1">Meetings</div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {commissionData.top_products.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">🏆 Top Products Sold This Month</h2>

          <div className="space-y-3">
            {commissionData.top_products.map((product, index) => (
              <div
                key={product.product_code}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
                  <div>
                    <div className="font-semibold text-gray-900">{product.product_code}</div>
                    <div className="text-sm text-gray-700">{product.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">
                    £{product.revenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-sm text-gray-700">{product.units} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Comparison */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">👥 Team Activity Comparison</h2>
        <p className="text-sm text-gray-700 mb-4">Competing on effort, not results</p>

        {/* Calls Made */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-2">📞 Calls Made</h3>
          {teamData.reps
            .sort((a, b) => b.activities.calls - a.activities.calls)
            .map((rep, index) => {
              const maxCalls = Math.max(...teamData.reps.map((r) => r.activities.calls));
              const percentage = maxCalls > 0 ? (rep.activities.calls / maxCalls) * 100 : 0;

              return (
                <div key={rep.rep_id} className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900">
                      {index === 0 && '🥇 '}{rep.full_name}
                    </span>
                    <span className="font-bold text-gray-900">{rep.activities.calls}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Visits */}
        <div className="mb-6">
          <h3 className="text-sm font-bold text-gray-900 mb-2">🚗 Customer Visits</h3>
          {teamData.reps
            .sort((a, b) => b.activities.visits - a.activities.visits)
            .map((rep, index) => {
              const maxVisits = Math.max(...teamData.reps.map((r) => r.activities.visits));
              const percentage = maxVisits > 0 ? (rep.activities.visits / maxVisits) * 100 : 0;

              return (
                <div key={rep.rep_id} className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900">
                      {index === 0 && '🥇 '}{rep.full_name}
                    </span>
                    <span className="font-bold text-gray-900">{rep.activities.visits}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>

        {/* Quotes Sent */}
        <div>
          <h3 className="text-sm font-bold text-gray-900 mb-2">✉️ Quotes Sent</h3>
          {teamData.reps
            .sort((a, b) => b.activities.quotes_sent - a.activities.quotes_sent)
            .map((rep, index) => {
              const maxQuotes = Math.max(...teamData.reps.map((r) => r.activities.quotes_sent));
              const percentage = maxQuotes > 0 ? (rep.activities.quotes_sent / maxQuotes) * 100 : 0;

              return (
                <div key={rep.rep_id} className="mb-2">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900">
                      {index === 0 && '🥇 '}{rep.full_name}
                    </span>
                    <span className="font-bold text-gray-900">{rep.activities.quotes_sent}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-purple-500 h-2 rounded-full transition-all"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    </div>
  );
}
