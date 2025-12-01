/**
 * Overview Tab - Company snapshot, machines, recent activity
 */

'use client';

interface OverviewTabProps {
  company: any;
  machines: any[];
  recentEngagement: any[];
  onNavigateTo: (tab: string) => void;
}

export default function OverviewTab({
  company,
  machines,
  recentEngagement,
  onNavigateTo
}: OverviewTabProps) {
  return (
    <div className="space-y-6">
      {/* Company Snapshot */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Company Snapshot</h2>
        <dl className="grid md:grid-cols-3 gap-4">
          <div>
            <dt className="text-sm text-gray-500">Company ID</dt>
            <dd className="font-mono text-sm text-gray-900">{company.company_id}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Account Owner</dt>
            <dd className="font-semibold text-gray-900">{company.account_owner || 'Unassigned'}</dd>
          </div>
          <div>
            <dt className="text-sm text-gray-500">Type</dt>
            <dd className="text-gray-900">{company.type || 'Customer'}</dd>
          </div>
        </dl>
      </div>

      {/* Known Machines */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Known Machines</h2>
          <button
            onClick={() => onNavigateTo('marketing')}
            className="text-sm text-blue-600 hover:text-blue-800 font-semibold"
          >
            Open Marketing Builder →
          </button>
        </div>

        {machines.length === 0 ? (
          <p className="text-gray-500">No machines tracked yet</p>
        ) : (
          <div className="space-y-3">
            {machines.map((cm) => (
              <div key={cm.company_machine_id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <div className="font-semibold text-gray-900">{cm.machines.display_name}</div>
                  <div className="flex items-center gap-2 mt-1">
                    {cm.confirmed ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full font-semibold">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Confirmed
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded-full">
                        🤚 {cm.source}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">Confidence: {cm.confidence_score}/5</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Engagement */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity (Last 30 Days)</h2>

        {recentEngagement.length === 0 ? (
          <p className="text-gray-500">No recent activity</p>
        ) : (
          <div className="space-y-2">
            {recentEngagement.slice(0, 10).map((event, idx) => (
              <div key={idx} className="flex items-center gap-3 text-sm">
                <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                <span className="font-medium text-gray-700">
                  {event.event_name?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                </span>
                <span className="text-gray-400">•</span>
                <span className="text-gray-500">
                  {new Date(event.occurred_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigateTo('marketing')}
          className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl hover:shadow-lg transition-shadow text-left"
        >
          <div className="font-bold text-lg text-gray-900 mb-2">Marketing Builder</div>
          <div className="text-sm text-gray-600">Create machine-specific campaigns</div>
        </button>

        <button
          onClick={() => onNavigateTo('copy-editor')}
          className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl hover:shadow-lg transition-shadow text-left"
        >
          <div className="font-bold text-lg text-gray-900 mb-2">Copy Editor</div>
          <div className="text-sm text-gray-600">Edit marketing copy & SKUs</div>
        </button>

        <button
          onClick={() => onNavigateTo('reorder')}
          className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-200 rounded-xl hover:shadow-lg transition-shadow text-left"
        >
          <div className="font-bold text-lg text-gray-900 mb-2">Reorder Reminders</div>
          <div className="text-sm text-gray-600">Send consumable reminders</div>
        </button>
      </div>
    </div>
  );
}
