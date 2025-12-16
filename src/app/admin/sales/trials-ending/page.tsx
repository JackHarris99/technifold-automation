/**
 * Full List: Trials Ending Soon
 * Shows all trials ending within 30 days with filtering options
 */

import { getSupabaseClient } from '@/lib/supabase';
import { getCurrentUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import Link from 'next/link';

interface TrialEnding {
  subscription_id: string;
  company_id: string;
  company_name: string;
  days_left: number;
  trial_end_date: string;
  machine_id?: string;
  machine_name?: string;
}

export default async function TrialsEndingPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect('/login');
  }

  const supabase = getSupabaseClient();

  // Get all companies (no territory filtering)
  const { data: companies } = await supabase
    .from('companies')
    .select('company_id, company_name, account_owner');
  const companyIds = companies?.map(c => c.company_id) || [];
  const companyMap = new Map(companies?.map(c => [c.company_id, c.company_name]) || []);

  let trialsEnding: TrialEnding[] = [];

  if (companyIds.length > 0) {
    const thirtyDaysFromNow = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    const { data: trials } = await supabase
      .from('subscriptions')
      .select('subscription_id, company_id, trial_end_date, machine_id')
      .in('company_id', companyIds)
      .eq('status', 'trial')
      .lt('trial_end_date', thirtyDaysFromNow)
      .gt('trial_end_date', new Date().toISOString())
      .order('trial_end_date', { ascending: true });

    // Get machine names if needed
    const machineIds = trials?.filter(t => t.machine_id).map(t => t.machine_id) || [];
    let machineMap = new Map<string, string>();

    if (machineIds.length > 0) {
      const { data: machines } = await supabase
        .from('machines')
        .select('machine_id, brand, model')
        .in('machine_id', machineIds);

      machines?.forEach(m => {
        machineMap.set(m.machine_id, `${m.brand} ${m.model}`.trim());
      });
    }

    trialsEnding = (trials || []).map(trial => ({
      subscription_id: trial.subscription_id,
      company_id: trial.company_id,
      company_name: companyMap.get(trial.company_id) || 'Unknown Company',
      days_left: Math.ceil((new Date(trial.trial_end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
      trial_end_date: trial.trial_end_date,
      machine_id: trial.machine_id,
      machine_name: trial.machine_id ? machineMap.get(trial.machine_id) : undefined,
    }));
  }

  // Group by urgency
  const critical = trialsEnding.filter(t => t.days_left <= 3);
  const urgent = trialsEnding.filter(t => t.days_left > 3 && t.days_left <= 7);
  const upcoming = trialsEnding.filter(t => t.days_left > 7);

  return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <Link
                  href="/admin/sales"
                  className="text-gray-500 hover:text-gray-700"
                >
                  ← Sales Center
                </Link>
              </div>
              <h1 className="text-2xl font-bold text-gray-900">
                Trials Ending Soon
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {trialsEnding.length} trial{trialsEnding.length !== 1 ? 's' : ''} ending in the next 30 days
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {trialsEnding.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">No Trials Ending Soon</h2>
            <p className="text-gray-600">All active trials have more than 30 days remaining.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Critical - 0-3 days */}
            {critical.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-red-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  Critical - Ending in 3 days or less ({critical.length})
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-red-200 overflow-hidden">
                  {critical.map((trial) => (
                    <TrialRow key={trial.subscription_id} trial={trial} urgency="critical" />
                  ))}
                </div>
              </div>
            )}

            {/* Urgent - 4-7 days */}
            {urgent.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-orange-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
                  Urgent - Ending this week ({urgent.length})
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-orange-200 overflow-hidden">
                  {urgent.map((trial) => (
                    <TrialRow key={trial.subscription_id} trial={trial} urgency="urgent" />
                  ))}
                </div>
              </div>
            )}

            {/* Upcoming - 8-30 days */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                  Upcoming - Within 30 days ({upcoming.length})
                </h2>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  {upcoming.map((trial) => (
                    <TrialRow key={trial.subscription_id} trial={trial} urgency="upcoming" />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function TrialRow({ trial, urgency }: { trial: TrialEnding; urgency: 'critical' | 'urgent' | 'upcoming' }) {
  const hoverColors = {
    critical: 'hover:bg-red-50',
    urgent: 'hover:bg-orange-50',
    upcoming: 'hover:bg-gray-50',
  };

  const badgeColors = {
    critical: 'bg-red-100 text-red-700',
    urgent: 'bg-orange-100 text-orange-700',
    upcoming: 'bg-gray-100 text-gray-700',
  };

  return (
    <Link
      href={`/admin/company/${trial.company_id}`}
      className={`flex items-center justify-between p-4 ${hoverColors[urgency]} transition-colors border-b border-gray-100 last:border-b-0`}
    >
      <div>
        <h3 className="font-semibold text-gray-900">{trial.company_name}</h3>
        <p className="text-sm text-gray-500">
          {trial.machine_name || 'Unknown machine'} • Ends {new Date(trial.trial_end_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      </div>
      <div className={`px-3 py-1 rounded-full text-sm font-bold ${badgeColors[urgency]}`}>
        {trial.days_left <= 0 ? 'Today!' : `${trial.days_left}d`}
      </div>
    </Link>
  );
}
