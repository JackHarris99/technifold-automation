/**
 * Performance Dashboard Client Component
 * Fetches and displays commission and activity data
 * Redesigned to match quote portal design language
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
        <div className="text-[14px] text-[#475569]">Loading performance data...</div>
      </div>
    );
  }

  if (error || !commissionData || !teamData) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-[16px] p-6">
        <p className="text-[14px] text-red-800 font-[500]">Error loading data: {error}</p>
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
      <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-orange-50/50 to-transparent border-b border-[#e8e8e8]">
          <h2 className="text-[20px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">Commission This Month</h2>
          <p className="text-[13px] text-[#475569] mt-1 font-[500]">
            {commissionData.invoices_closed} invoice{commissionData.invoices_closed !== 1 ? 's' : ''} paid
          </p>
        </div>

        <div className="px-8 py-6 space-y-4">
          {/* Tools */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-br from-blue-50 to-blue-50/30 rounded-[12px] border-2 border-blue-200">
            <div>
              <div className="text-[14px] font-[600] text-[#0a0a0a] mb-1">Tool Sales</div>
              <div className="text-[12px] text-[#475569] font-[500]">
                £{commissionData.commission_breakdown.tools.revenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })} @ 10%
              </div>
            </div>
            <div className="text-[24px] font-[800] text-[#1e40af] tracking-[-0.02em]">
              £{commissionData.commission_breakdown.tools.commission.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Consumables */}
          <div className="flex items-center justify-between p-5 bg-gradient-to-br from-green-50 to-green-50/30 rounded-[12px] border-2 border-green-200">
            <div>
              <div className="text-[14px] font-[600] text-[#0a0a0a] mb-1">Consumables</div>
              <div className="text-[12px] text-[#475569] font-[500]">
                £{commissionData.commission_breakdown.consumables.revenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })} @ 1%
              </div>
            </div>
            <div className="text-[24px] font-[800] text-[#15803d] tracking-[-0.02em]">
              £{commissionData.commission_breakdown.consumables.commission.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </div>
          </div>

          {/* Subscriptions */}
          <div className="flex items-center justify-between p-5 bg-[#f8fafc] rounded-[12px] border-2 border-[#e2e8f0]">
            <div>
              <div className="text-[14px] font-[600] text-[#0a0a0a] mb-1">Subscriptions</div>
              <div className="text-[12px] text-[#475569] font-[500]">
                {commissionData.commission_breakdown.subscriptions.note}
              </div>
            </div>
            <div className="text-[24px] font-[800] text-[#94a3b8] tracking-[-0.02em]">
              £0.00
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-[#e8e8e8] pt-5 mt-2">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[17px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">TOTAL COMMISSION</div>
              <div className="text-[32px] font-[800] text-[#ea580c] tracking-[-0.02em]">
                £{commissionData.total_commission.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Month Progress */}
            <div>
              <div className="flex items-center justify-between text-[12px] text-[#475569] font-[500] mb-2">
                <span>Month Progress</span>
                <span>{currentDay} / {daysInMonth} days ({Math.round(monthProgress)}%)</span>
              </div>
              <div className="w-full bg-[#e2e8f0] rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#3b82f6] to-[#1e40af] h-3 rounded-full transition-all"
                  style={{ width: `${monthProgress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Metrics */}
      <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-blue-50/50 to-transparent border-b border-[#e8e8e8]">
          <h2 className="text-[20px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">Activity Metrics</h2>
          <p className="text-[13px] text-[#475569] mt-1 font-[500]">Your performance this month</p>
        </div>

        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Calls */}
            <div className="p-5 border-2 border-orange-200 rounded-[16px] bg-gradient-to-br from-orange-50 to-white">
              <div className="text-[32px] mb-2">📞</div>
              <div className="text-[36px] font-[800] text-[#0a0a0a] tracking-[-0.02em]">{currentUserActivities.calls}</div>
              <div className="text-[13px] text-[#475569] font-[500] mt-1">Calls Made</div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-100 rounded-[8px]">
                <span className="text-[11px] font-[700] text-orange-800">
                  {callsRanking.rank === 1 ? '🥇 #1 in team' : `#${callsRanking.rank} in team`}
                </span>
              </div>
            </div>

            {/* Visits */}
            <div className="p-5 border-2 border-blue-200 rounded-[16px] bg-gradient-to-br from-blue-50 to-white">
              <div className="text-[32px] mb-2">🚗</div>
              <div className="text-[36px] font-[800] text-[#0a0a0a] tracking-[-0.02em]">{currentUserActivities.visits}</div>
              <div className="text-[13px] text-[#475569] font-[500] mt-1">Customer Visits</div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 rounded-[8px]">
                <span className="text-[11px] font-[700] text-blue-800">
                  {visitsRanking.rank === 1 ? '🥇 #1 in team' : `#${visitsRanking.rank} in team`}
                </span>
              </div>
            </div>

            {/* Quotes */}
            <div className="p-5 border-2 border-purple-200 rounded-[16px] bg-gradient-to-br from-purple-50 to-white">
              <div className="text-[32px] mb-2">✉️</div>
              <div className="text-[36px] font-[800] text-[#0a0a0a] tracking-[-0.02em]">{currentUserActivities.quotes_sent}</div>
              <div className="text-[13px] text-[#475569] font-[500] mt-1">Quotes Sent</div>
              <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 rounded-[8px]">
                <span className="text-[11px] font-[700] text-purple-800">
                  {quotesRanking.rank === 1 ? '🥇 #1 in team' : `#${quotesRanking.rank} in team`}
                </span>
              </div>
            </div>
          </div>

          {/* Other Activities */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center p-4 bg-[#f8fafc] rounded-[12px] border border-[#e2e8f0]">
              <div className="text-[28px] font-[800] text-[#0a0a0a] tracking-[-0.02em]">{currentUserActivities.emails}</div>
              <div className="text-[11px] text-[#475569] font-[600] mt-1 uppercase tracking-wider">Emails</div>
            </div>
            <div className="text-center p-4 bg-[#f8fafc] rounded-[12px] border border-[#e2e8f0]">
              <div className="text-[28px] font-[800] text-[#0a0a0a] tracking-[-0.02em]">{currentUserActivities.followups}</div>
              <div className="text-[11px] text-[#475569] font-[600] mt-1 uppercase tracking-wider">Follow-ups</div>
            </div>
            <div className="text-center p-4 bg-[#f8fafc] rounded-[12px] border border-[#e2e8f0]">
              <div className="text-[28px] font-[800] text-[#0a0a0a] tracking-[-0.02em]">{currentUserActivities.meetings}</div>
              <div className="text-[11px] text-[#475569] font-[600] mt-1 uppercase tracking-wider">Meetings</div>
            </div>
          </div>
        </div>
      </div>

      {/* Top Products */}
      {commissionData.top_products.length > 0 && (
        <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] overflow-hidden">
          <div className="px-8 py-6 bg-gradient-to-r from-green-50/50 to-transparent border-b border-[#e8e8e8]">
            <h2 className="text-[20px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">Top Products Sold This Month</h2>
            <p className="text-[13px] text-[#475569] mt-1 font-[500]">{commissionData.top_products.length} product{commissionData.top_products.length !== 1 ? 's' : ''}</p>
          </div>

          <div className="px-8 py-6 space-y-3">
            {commissionData.top_products.map((product, index) => (
              <div
                key={product.product_code}
                className="flex items-center justify-between p-5 bg-[#f8fafc] rounded-[12px] border border-[#e2e8f0] hover:border-[#cbd5e1] transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-[8px] bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                    <span className="text-[16px] font-[800] text-green-700">#{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-[600] text-[14px] text-[#0a0a0a] font-mono">{product.product_code}</div>
                    <div className="text-[13px] text-[#475569] font-[500] mt-0.5">{product.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-[800] text-[17px] text-[#0a0a0a] tracking-[-0.01em]">
                    £{product.revenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[12px] text-[#475569] font-[500] mt-0.5">{product.units} units</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Team Comparison */}
      <div className="bg-white rounded-[20px] shadow-[0_1px_3px_rgba(0,0,0,0.04),0_8px_24px_rgba(0,0,0,0.04)] border border-[#e8e8e8] overflow-hidden">
        <div className="px-8 py-6 bg-gradient-to-r from-purple-50/50 to-transparent border-b border-[#e8e8e8]">
          <h2 className="text-[20px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">Team Activity Comparison</h2>
          <p className="text-[13px] text-[#475569] mt-1 font-[500]">See how you stack up against your team</p>
        </div>

        <div className="px-8 py-6">
          {/* Calls Made */}
          <div className="mb-8">
            <h3 className="text-[13px] font-[700] text-[#0a0a0a] mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="text-[16px]">📞</span> Calls Made
            </h3>
            <div className="space-y-3">
              {teamData.reps
                .sort((a, b) => b.activities.calls - a.activities.calls)
                .map((rep, index) => {
                  const maxCalls = Math.max(...teamData.reps.map((r) => r.activities.calls));
                  const percentage = maxCalls > 0 ? (rep.activities.calls / maxCalls) * 100 : 0;

                  return (
                    <div key={rep.rep_id}>
                      <div className="flex items-center justify-between text-[13px] mb-2">
                        <span className="font-[600] text-[#0a0a0a]">
                          {index === 0 && <span className="mr-1">🥇</span>}{rep.full_name}
                        </span>
                        <span className="font-[700] text-[#0a0a0a]">{rep.activities.calls}</span>
                      </div>
                      <div className="w-full bg-[#e2e8f0] rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-orange-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Visits */}
          <div className="mb-8">
            <h3 className="text-[13px] font-[700] text-[#0a0a0a] mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="text-[16px]">🚗</span> Customer Visits
            </h3>
            <div className="space-y-3">
              {teamData.reps
                .sort((a, b) => b.activities.visits - a.activities.visits)
                .map((rep, index) => {
                  const maxVisits = Math.max(...teamData.reps.map((r) => r.activities.visits));
                  const percentage = maxVisits > 0 ? (rep.activities.visits / maxVisits) * 100 : 0;

                  return (
                    <div key={rep.rep_id}>
                      <div className="flex items-center justify-between text-[13px] mb-2">
                        <span className="font-[600] text-[#0a0a0a]">
                          {index === 0 && <span className="mr-1">🥇</span>}{rep.full_name}
                        </span>
                        <span className="font-[700] text-[#0a0a0a]">{rep.activities.visits}</span>
                      </div>
                      <div className="w-full bg-[#e2e8f0] rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-blue-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* Quotes Sent */}
          <div>
            <h3 className="text-[13px] font-[700] text-[#0a0a0a] mb-4 uppercase tracking-wider flex items-center gap-2">
              <span className="text-[16px]">✉️</span> Quotes Sent
            </h3>
            <div className="space-y-3">
              {teamData.reps
                .sort((a, b) => b.activities.quotes_sent - a.activities.quotes_sent)
                .map((rep, index) => {
                  const maxQuotes = Math.max(...teamData.reps.map((r) => r.activities.quotes_sent));
                  const percentage = maxQuotes > 0 ? (rep.activities.quotes_sent / maxQuotes) * 100 : 0;

                  return (
                    <div key={rep.rep_id}>
                      <div className="flex items-center justify-between text-[13px] mb-2">
                        <span className="font-[600] text-[#0a0a0a]">
                          {index === 0 && <span className="mr-1">🥇</span>}{rep.full_name}
                        </span>
                        <span className="font-[700] text-[#0a0a0a]">{rep.activities.quotes_sent}</span>
                      </div>
                      <div className="w-full bg-[#e2e8f0] rounded-full h-2.5">
                        <div
                          className="bg-gradient-to-r from-purple-500 to-purple-600 h-2.5 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
