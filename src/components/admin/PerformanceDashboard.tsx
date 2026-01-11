/**
 * Performance Dashboard Client Component
 * Completely redesigned to match quote portal aesthetic
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
    <div className="grid grid-cols-12 gap-6">
      {/* Left Column - Commission & Activity */}
      <div className="col-span-8 space-y-6">
        {/* Commission Overview */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8]">
          <div className="p-6 border-b border-[#e8e8e8]">
            <h1 className="text-[28px] font-[600] text-[#1e40af] mb-1 tracking-[-0.02em] leading-[1.2]">
              £{commissionData.total_commission.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
            </h1>
            <p className="text-[13px] text-[#334155] font-[400]">
              Commission this month • {commissionData.invoices_closed} invoice{commissionData.invoices_closed !== 1 ? 's' : ''} paid
            </p>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-3 gap-4 mb-6">
              {/* Tools */}
              <div>
                <div className="text-[11px] font-[600] text-[#475569] mb-2 uppercase tracking-wider">Tool Sales</div>
                <div className="p-3 bg-[#eff6ff] rounded-[10px] border border-[#bfdbfe]">
                  <div className="text-[20px] font-[700] text-[#1e40af] tracking-[-0.01em] mb-1">
                    £{commissionData.commission_breakdown.tools.commission.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-[#475569] font-[500]">
                    £{commissionData.commission_breakdown.tools.revenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })} @ 10%
                  </div>
                </div>
              </div>

              {/* Consumables */}
              <div>
                <div className="text-[11px] font-[600] text-[#475569] mb-2 uppercase tracking-wider">Consumables</div>
                <div className="p-3 bg-[#f0fdf4] rounded-[10px] border border-[#bbf7d0]">
                  <div className="text-[20px] font-[700] text-[#15803d] tracking-[-0.01em] mb-1">
                    £{commissionData.commission_breakdown.consumables.commission.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                  </div>
                  <div className="text-[11px] text-[#475569] font-[500]">
                    £{commissionData.commission_breakdown.consumables.revenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })} @ 1%
                  </div>
                </div>
              </div>

              {/* Subscriptions */}
              <div>
                <div className="text-[11px] font-[600] text-[#475569] mb-2 uppercase tracking-wider">Subscriptions</div>
                <div className="p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
                  <div className="text-[20px] font-[700] text-[#94a3b8] tracking-[-0.01em] mb-1">
                    £0.00
                  </div>
                  <div className="text-[11px] text-[#475569] font-[500]">
                    Not commissioned
                  </div>
                </div>
              </div>
            </div>

            {/* Month Progress */}
            <div>
              <div className="flex items-center justify-between text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-2">
                <span>Month Progress</span>
                <span>{currentDay} / {daysInMonth} days</span>
              </div>
              <div className="w-full bg-[#e2e8f0] rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] h-3 rounded-full transition-all"
                  style={{ width: `${monthProgress}%` }}
                />
              </div>
              <div className="text-right text-[11px] font-[600] text-[#1e40af] mt-1">
                {Math.round(monthProgress)}%
              </div>
            </div>
          </div>
        </div>

        {/* Activity Metrics */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
          <div className="mb-6">
            <h2 className="text-[20px] font-[600] text-[#0a0a0a] mb-1 tracking-[-0.01em]">Activity Metrics</h2>
            <p className="text-[13px] text-[#334155] font-[400]">Your performance this month</p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            {/* Calls */}
            <div>
              <div className="text-[11px] font-[600] text-[#475569] mb-2 uppercase tracking-wider">Calls Made</div>
              <div className="p-4 bg-[#fff7ed] rounded-[10px] border border-[#fed7aa]">
                <div className="text-[32px] font-[800] text-[#0a0a0a] tracking-[-0.02em] leading-[1]">{currentUserActivities.calls}</div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-[#ea580c] bg-opacity-10 rounded-[6px]">
                  <span className="text-[10px] font-[700] text-[#ea580c] uppercase tracking-wide">
                    Rank #{callsRanking.rank}
                  </span>
                </div>
              </div>
            </div>

            {/* Visits */}
            <div>
              <div className="text-[11px] font-[600] text-[#475569] mb-2 uppercase tracking-wider">Site Visits</div>
              <div className="p-4 bg-[#eff6ff] rounded-[10px] border border-[#bfdbfe]">
                <div className="text-[32px] font-[800] text-[#0a0a0a] tracking-[-0.02em] leading-[1]">{currentUserActivities.visits}</div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-[#1e40af] bg-opacity-10 rounded-[6px]">
                  <span className="text-[10px] font-[700] text-[#1e40af] uppercase tracking-wide">
                    Rank #{visitsRanking.rank}
                  </span>
                </div>
              </div>
            </div>

            {/* Quotes */}
            <div>
              <div className="text-[11px] font-[600] text-[#475569] mb-2 uppercase tracking-wider">Quotes Sent</div>
              <div className="p-4 bg-[#faf5ff] rounded-[10px] border border-[#e9d5ff]">
                <div className="text-[32px] font-[800] text-[#0a0a0a] tracking-[-0.02em] leading-[1]">{currentUserActivities.quotes_sent}</div>
                <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-1 bg-[#a855f7] bg-opacity-10 rounded-[6px]">
                  <span className="text-[10px] font-[700] text-[#a855f7] uppercase tracking-wide">
                    Rank #{quotesRanking.rank}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Secondary Metrics */}
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
              <div className="text-[20px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">{currentUserActivities.emails}</div>
              <div className="text-[10px] text-[#475569] font-[600] mt-1 uppercase tracking-wider">Emails</div>
            </div>
            <div className="text-center p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
              <div className="text-[20px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">{currentUserActivities.followups}</div>
              <div className="text-[10px] text-[#475569] font-[600] mt-1 uppercase tracking-wider">Follow-ups</div>
            </div>
            <div className="text-center p-3 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]">
              <div className="text-[20px] font-[700] text-[#0a0a0a] tracking-[-0.01em]">{currentUserActivities.meetings}</div>
              <div className="text-[10px] text-[#475569] font-[600] mt-1 uppercase tracking-wider">Meetings</div>
            </div>
          </div>
        </div>

        {/* Top Products */}
        {commissionData.top_products.length > 0 && (
          <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
            <div className="mb-4">
              <h2 className="text-[20px] font-[600] text-[#0a0a0a] mb-1 tracking-[-0.01em]">Top Products</h2>
              <p className="text-[13px] text-[#334155] font-[400]">Best sellers this month</p>
            </div>

            <div className="space-y-2">
              {commissionData.top_products.map((product, index) => (
                <div
                  key={product.product_code}
                  className="flex items-center justify-between p-4 bg-[#f8fafc] rounded-[10px] border border-[#e2e8f0]"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-[6px] bg-gradient-to-br from-[#15803d] to-[#16a34a] flex items-center justify-center">
                      <span className="text-[13px] font-[800] text-white">#{index + 1}</span>
                    </div>
                    <div>
                      <div className="font-[600] text-[13px] text-[#0a0a0a] font-mono">{product.product_code}</div>
                      <div className="text-[12px] text-[#475569] font-[400] mt-0.5">{product.name}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-[700] text-[15px] text-[#0a0a0a] tracking-[-0.01em]">
                      £{product.revenue.toLocaleString('en-GB', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-[11px] text-[#475569] font-[500] mt-0.5">{product.units} units</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right Column - Team Rankings */}
      <div className="col-span-4 space-y-6">
        {/* Calls Leaderboard */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
          <div className="mb-4">
            <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-1">Team Leaderboard</div>
            <h3 className="text-[17px] font-[600] text-[#0a0a0a] tracking-[-0.01em]">Calls Made</h3>
          </div>

          <div className="space-y-2">
            {teamData.reps
              .sort((a, b) => b.activities.calls - a.activities.calls)
              .map((rep, index) => {
                const maxCalls = Math.max(...teamData.reps.map((r) => r.activities.calls));
                const percentage = maxCalls > 0 ? (rep.activities.calls / maxCalls) * 100 : 0;
                const isCurrentUser = index === callsRanking.rank - 1;

                return (
                  <div key={rep.rep_id} className={`p-3 rounded-[10px] border ${isCurrentUser ? 'bg-[#fff7ed] border-[#fed7aa]' : 'bg-[#f8fafc] border-[#e2e8f0]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-[800] ${index === 0 ? 'text-[#ea580c]' : 'text-[#94a3b8]'}`}>
                          #{index + 1}
                        </span>
                        <span className={`text-[13px] font-[600] ${isCurrentUser ? 'text-[#0a0a0a]' : 'text-[#334155]'}`}>
                          {rep.full_name}
                        </span>
                      </div>
                      <span className="text-[13px] font-[700] text-[#0a0a0a]">{rep.activities.calls}</span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-[#ea580c] to-[#f97316] h-1.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Visits Leaderboard */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
          <div className="mb-4">
            <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-1">Team Leaderboard</div>
            <h3 className="text-[17px] font-[600] text-[#0a0a0a] tracking-[-0.01em]">Site Visits</h3>
          </div>

          <div className="space-y-2">
            {teamData.reps
              .sort((a, b) => b.activities.visits - a.activities.visits)
              .map((rep, index) => {
                const maxVisits = Math.max(...teamData.reps.map((r) => r.activities.visits));
                const percentage = maxVisits > 0 ? (rep.activities.visits / maxVisits) * 100 : 0;
                const isCurrentUser = index === visitsRanking.rank - 1;

                return (
                  <div key={rep.rep_id} className={`p-3 rounded-[10px] border ${isCurrentUser ? 'bg-[#eff6ff] border-[#bfdbfe]' : 'bg-[#f8fafc] border-[#e2e8f0]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-[800] ${index === 0 ? 'text-[#1e40af]' : 'text-[#94a3b8]'}`}>
                          #{index + 1}
                        </span>
                        <span className={`text-[13px] font-[600] ${isCurrentUser ? 'text-[#0a0a0a]' : 'text-[#334155]'}`}>
                          {rep.full_name}
                        </span>
                      </div>
                      <span className="text-[13px] font-[700] text-[#0a0a0a]">{rep.activities.visits}</span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-[#1e40af] to-[#3b82f6] h-1.5 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Quotes Leaderboard */}
        <div className="bg-white rounded-[16px] shadow-sm border border-[#e8e8e8] p-6">
          <div className="mb-4">
            <div className="text-[11px] font-[600] text-[#475569] uppercase tracking-wider mb-1">Team Leaderboard</div>
            <h3 className="text-[17px] font-[600] text-[#0a0a0a] tracking-[-0.01em]">Quotes Sent</h3>
          </div>

          <div className="space-y-2">
            {teamData.reps
              .sort((a, b) => b.activities.quotes_sent - a.activities.quotes_sent)
              .map((rep, index) => {
                const maxQuotes = Math.max(...teamData.reps.map((r) => r.activities.quotes_sent));
                const percentage = maxQuotes > 0 ? (rep.activities.quotes_sent / maxQuotes) * 100 : 0;
                const isCurrentUser = index === quotesRanking.rank - 1;

                return (
                  <div key={rep.rep_id} className={`p-3 rounded-[10px] border ${isCurrentUser ? 'bg-[#faf5ff] border-[#e9d5ff]' : 'bg-[#f8fafc] border-[#e2e8f0]'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[11px] font-[800] ${index === 0 ? 'text-[#a855f7]' : 'text-[#94a3b8]'}`}>
                          #{index + 1}
                        </span>
                        <span className={`text-[13px] font-[600] ${isCurrentUser ? 'text-[#0a0a0a]' : 'text-[#334155]'}`}>
                          {rep.full_name}
                        </span>
                      </div>
                      <span className="text-[13px] font-[700] text-[#0a0a0a]">{rep.activities.quotes_sent}</span>
                    </div>
                    <div className="w-full bg-[#e2e8f0] rounded-full h-1.5">
                      <div
                        className="bg-gradient-to-r from-[#a855f7] to-[#c084fc] h-1.5 rounded-full transition-all"
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
  );
}
